import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from campusos.backend.app.main import app
from campusos.backend.app.database.session import Base, get_db
from campusos.backend.app.services.academic_metrics import calculate_attendance_metrics, map_score_to_grade

import os

# Use a test SQLite database file for test suite isolation
TEST_DB_FILE = "./test_campusos.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

if os.path.exists(TEST_DB_FILE):
    try:
        os.remove(TEST_DB_FILE)
    except Exception:
        pass

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_registration_and_login(client):
    # Register Student A
    reg_payload = {
        "email": "student1@vitstudent.ac.in",
        "password": "Password123!",
        "full_name": "Santhosh Sivan",
        "campus": "Vellore Campus",
        "branch": "Computer Science",
        "registration_number": "21BCE1042"
    }
    r = client.post("/api/auth/register", json=reg_payload)
    assert r.status_code == 200
    tokens = r.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # Duplicate registration should fail
    r_dup = client.post("/api/auth/register", json=reg_payload)
    assert r_dup.status_code == 400

    # Login
    login_payload = {
        "email": "student1@vitstudent.ac.in",
        "password": "Password123!"
    }
    r_login = client.post("/api/auth/login", json=login_payload)
    assert r_login.status_code == 200
    assert "access_token" in r_login.json()

    # Wrong password should fail
    bad_login = {
        "email": "student1@vitstudent.ac.in",
        "password": "WrongPassword!"
    }
    r_bad = client.post("/api/auth/login", json=bad_login)
    assert r_bad.status_code == 401

def test_user_profile_and_me(client):
    login_res = client.post("/api/auth/login", json={
        "email": "student1@vitstudent.ac.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r_me = client.get("/api/auth/me", headers=headers)
    assert r_me.status_code == 200
    user_data = r_me.json()
    assert user_data["email"] == "student1@vitstudent.ac.in"
    assert user_data["full_name"] == "Santhosh Sivan"
    assert user_data["profile"]["campus"] == "Vellore Campus"

    # Update profile
    r_update = client.put("/api/auth/profile", json={"programme": "B.Tech Honours"}, headers=headers)
    assert r_update.status_code == 200
    assert r_update.json()["profile"]["programme"] == "B.Tech Honours"

def test_events_crud_and_completion(client):
    login_res = client.post("/api/auth/login", json={
        "email": "student1@vitstudent.ac.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create event
    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    evt_payload = {
        "title": "SWE3001 Software Project Sprint 3",
        "event_type": "Project Review",
        "due_date": due,
        "due_time": "15:00",
        "priority": "high",
        "venue": "PRP-204"
    }
    r_create = client.post("/api/events", json=evt_payload, headers=headers)
    assert r_create.status_code == 201
    created_event = r_create.json()
    assert created_event["title"] == "SWE3001 Software Project Sprint 3"
    assert created_event["completion_status"] == "pending"
    event_id = created_event["id"]

    # Toggle complete
    r_toggle = client.patch(f"/api/events/{event_id}/toggle-complete", headers=headers)
    assert r_toggle.status_code == 200
    assert r_toggle.json()["completion_status"] == "completed"

    # Toggle back
    r_toggle2 = client.patch(f"/api/events/{event_id}/toggle-complete", headers=headers)
    assert r_toggle2.json()["completion_status"] == "pending"

    # Update event
    r_update = client.put(f"/api/events/{event_id}", json={"priority": "medium"}, headers=headers)
    assert r_update.status_code == 200
    assert r_update.json()["priority"] == "medium"

    # Delete event
    r_del = client.delete(f"/api/events/{event_id}", headers=headers)
    assert r_del.status_code == 204

    # Verify not found
    r_get = client.get(f"/api/events/{event_id}", headers=headers)
    assert r_get.status_code == 404

def test_user_data_isolation(client):
    # Register Student B
    client.post("/api/auth/register", json={
        "email": "student2@vitstudent.ac.in",
        "password": "Password456!",
        "full_name": "Priya Sharma",
        "registration_number": "21BCE2001"
    })

    # Student A token
    resA = client.post("/api/auth/login", json={"email": "student1@vitstudent.ac.in", "password": "Password123!"})
    tokenA = resA.json()["access_token"]
    headersA = {"Authorization": f"Bearer {tokenA}"}

    # Student B token
    resB = client.post("/api/auth/login", json={"email": "student2@vitstudent.ac.in", "password": "Password456!"})
    tokenB = resB.json()["access_token"]
    headersB = {"Authorization": f"Bearer {tokenB}"}

    # Student A creates a private event
    due = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    r_evtA = client.post("/api/events", json={
        "title": "Confidential Study Plan A",
        "due_date": due,
        "priority": "low"
    }, headers=headersA)
    evtA_id = r_evtA.json()["id"]

    # Student B attempts to access Student A's event -> 404 isolation
    r_isolated = client.get(f"/api/events/{evtA_id}", headers=headersB)
    assert r_isolated.status_code == 404

    # Student B attempts to delete Student A's event -> 404 isolation
    r_del_isolated = client.delete(f"/api/events/{evtA_id}", headers=headersB)
    assert r_del_isolated.status_code == 404

def test_attendance_and_metrics(client):
    login_res = client.post("/api/auth/login", json={"email": "student1@vitstudent.ac.in", "password": "Password123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r_att = client.get("/api/attendance", headers=headers)
    assert r_att.status_code == 200
    att_list = r_att.json()
    assert len(att_list) > 0
    record = att_list[0]
    assert "attendance_percentage" in record
    assert "can_miss_classes" in record

    # Unit test attendance math
    m1 = calculate_attendance_metrics(attended=28, total=30, required_threshold=75.0)
    assert m1["percentage"] == 93.33
    assert m1["can_miss_classes"] > 0
    assert m1["classes_needed_for_target"] == 0

    m2 = calculate_attendance_metrics(attended=20, total=30, required_threshold=75.0)
    assert m2["percentage"] == 66.67
    assert m2["can_miss_classes"] == 0
    assert m2["classes_needed_for_target"] > 0

def test_cgpa_calculation(client):
    login_res = client.post("/api/auth/login", json={"email": "student1@vitstudent.ac.in", "password": "Password123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r_cgpa = client.get("/api/marks/cgpa", headers=headers)
    assert r_cgpa.status_code == 200
    data = r_cgpa.json()
    assert "estimated_gpa" in data
    assert data["total_registered_credits"] > 0

    # Grade mapping test
    g_s = map_score_to_grade(92.0)
    assert g_s["grade"] == "S" and g_s["points"] == 10.0
    g_f = map_score_to_grade(35.0)
    assert g_f["grade"] == "F" and g_f["points"] == 0.0

def test_sync_engine_and_deduplication(client):
    login_res = client.post("/api/auth/login", json={"email": "student1@vitstudent.ac.in", "password": "Password123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Connect Google Classroom mock
    r_conn = client.post("/api/sync/google_classroom/connect", json={"email": "student1@vitstudent.ac.in"}, headers=headers)
    assert r_conn.status_code == 200

    # Sync single platform
    r_sync1 = client.post("/api/sync/google_classroom", headers=headers)
    assert r_sync1.status_code == 200
    res1 = r_sync1.json()
    assert res1["status"] == "success"
    first_add_count = res1["items_added"]
    assert first_add_count > 0

    # Syncing again should deduplicate: 0 new items added!
    r_sync2 = client.post("/api/sync/google_classroom", headers=headers)
    assert r_sync2.status_code == 200
    res2 = r_sync2.json()
    assert res2["items_added"] == 0  # Deduplication verified!
    assert res2["items_updated"] == first_add_count  # Correctly detected existing and updated!

def test_study_planner_generation(client):
    login_res = client.post("/api/auth/login", json={"email": "student1@vitstudent.ac.in", "password": "Password123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch an exam event
    events = client.get("/api/events?event_type=Midterm", headers=headers).json()
    assert len(events) > 0
    exam_id = events[0]["id"]

    start_date = datetime.now().date().isoformat()
    plan_payload = {
        "event_id": exam_id,
        "start_date": start_date,
        "daily_available_hours": 2.0,
        "subject_difficulty": "medium",
        "topics": ["Module 1: Relational Algebra", "Module 2: SQL & Indexes", "Module 3: Normalization", "Module 4: Transactions"]
    }

    r_plan = client.post("/api/study-planner/generate", json=plan_payload, headers=headers)
    assert r_plan.status_code == 200
    sessions = r_plan.json()
    assert len(sessions) > 0
    assert "Module" in sessions[0]["topic"] or "Study" in sessions[0]["title"]
