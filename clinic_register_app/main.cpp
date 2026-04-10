#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <map>
#include <algorithm>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

using namespace std;

// ─────────────────────────────────────────────────────────────
// Custom Output Flusher (Bypasses Emscripten \n buffering)
// ─────────────────────────────────────────────────────────────
class WebOut {
    std::ostringstream oss;
public:
    template<typename T>
    WebOut& operator<<(const T& val) {
        oss << val;
        return *this;
    }
    // Handle manipulators like std::endl
    WebOut& operator<<(std::ostream& (*manip)(std::ostream&)) {
        if (manip == static_cast<std::ostream& (*)(std::ostream&)>(std::endl)) {
            oss << "\n";
        } else {
            manip(oss);
        }
        return *this;
    }
    ~WebOut() {
        std::string s = oss.str();
        if(s.empty()) return;
#ifdef __EMSCRIPTEN__
        EM_ASM({
            if (typeof window.cprint !== 'undefined') {
                window.cprint(UTF8ToString($0));
            } else {
                console.log(UTF8ToString($0));
            }
        }, s.c_str());
#else
        std::cout << s;
        std::cout.flush();
#endif
    }
};

// Intercept all cout calls
#define cout WebOut()

// ANSI colors for styling
const string RESET  = "\033[0m";
const string BOLD   = "\033[1m";
const string CYAN   = "\033[36m";
const string GREEN  = "\033[32m";
const string YELLOW = "\033[33m";
const string RED    = "\033[31m";
const string MAGENTA= "\033[35m";
const string DIM    = "\033[90m";

// ─────────────────────────────────────────────────────────────
// Futuristic ASYNC Input System (Replaces cin)
// ─────────────────────────────────────────────────────────────
string getWebInput() {
#ifdef __EMSCRIPTEN__
    while (true) {
        int hasInput = EM_ASM_INT({
            return (window.inputBuffer && window.inputBuffer.length > 0) ? 1 : 0;
        });
        if (hasInput == 1) {
            char* buf = (char*)EM_ASM_INT({
                var str = window.inputBuffer.shift();
                var len = lengthBytesUTF8(str) + 1;
                var ptr = _malloc(len);
                stringToUTF8(str, ptr, len);
                return ptr;
            });
            string res(buf);
            free(buf);
            return res;
        }
        emscripten_sleep(50); // Yield to JS Event Loop
    }
    return "";
#else
    string s;
    getline(cin, s);
    return s;
#endif
}

void getIntInput(int& out) {
    while (true) {
        string s = getWebInput();
        if(s.find_first_not_of(" \t\n\r\f\v") != string::npos) {
            s.erase(0, s.find_first_not_of(" \t\n\r\f\v"));
            s.erase(s.find_last_not_of(" \t\n\r\f\v") + 1);
        }
        if (s.empty()) {
            cout << RED << "  ✗ Please enter a valid number: " << RESET;
            continue;
        }
        bool valid = true;
        for (size_t i = 0; i < s.length(); ++i) {
            if (i == 0 && (s[i] == '-' || s[i] == '+')) continue;
            if (!isdigit(s[i])) { valid = false; break; }
        }
        if (valid) {
            out = atoi(s.c_str());
            break;
        }
        cout << RED << "  ✗ Invalid number. Please try again: " << RESET;
    }
}

void getStringInput(string& out) {
    out = getWebInput();
    // Trim spaces
    out.erase(0, out.find_first_not_of(" \t\n\r\f\v"));
    out.erase(out.find_last_not_of(" \t\n\r\f\v") + 1);
}

void pauseForUser() {
    cout << "\n  " << DIM << "[ Press Enter to return to Menu ]" << RESET;
    string dummy;
    getStringInput(dummy);
}

// ─────────────────────────────────────────────────────────────
// DA2 Logic (Classes & STL)
// ─────────────────────────────────────────────────────────────
class Patient {
public:
    string id;
    string name;
    int age;
    string phone;

    Patient(string i, string n, int a, string p) : id(i), name(n), age(a), phone(p) {}
    
    void print() const {
        cout << "  " << CYAN << "Patient ID No. : " << RESET << BOLD << id << RESET << "\n"
             << "  " << CYAN << "Name           : " << RESET << BOLD << name << RESET << "\n"
             << "  " << DIM  << "Age            : " << RESET << age << "\n"
             << "  " << DIM  << "Phone          : " << RESET << phone << "\n";
    }
};

class Visit {
public:
    string patientId;
    string date;
    string diagnosis;
    string prescription;

    Visit(string pid, string dt, string diag, string rx) 
        : patientId(pid), date(dt), diagnosis(diag), prescription(rx) {}

    void print() const {
        cout << "  " << YELLOW << setw(11) << left << date << RESET 
             << " | Diag: " << MAGENTA << setw(15) << left << diagnosis << RESET
             << " | Rx: " << DIM << prescription << RESET << "\n";
    }
};

class HospitalSystem {
private:
    vector<Patient> patients;
    vector<Visit> visits;
    const string PAT_FILE = "patients.dat";
    const string VIS_FILE = "visits.dat";

    int findPatient(const string& pid) {
        for(size_t i=0; i<patients.size(); ++i) {
            if(patients[i].id == pid) return i;
        }
        return -1;
    }

    void loadData() {
        ifstream pf(PAT_FILE);
        string line;
        while(getline(pf, line)) {
            istringstream ss(line);
            string id, name, phone, ageStr;
            if(getline(ss, id, '|') && getline(ss, name, '|') && getline(ss, ageStr, '|') && getline(ss, phone, '|')) {
                patients.emplace_back(id, name, atoi(ageStr.c_str()), phone);
            }
        }
        pf.close();
        
        ifstream vf(VIS_FILE);
        while(getline(vf, line)) {
            istringstream ss(line);
            string pid, dt, diag, rx;
            if(getline(ss, pid, '|') && getline(ss, dt, '|') && getline(ss, diag, '|') && getline(ss, rx, '|')) {
                visits.emplace_back(pid, dt, diag, rx);
            }
        }
        vf.close();
    }

    void saveData() {
        ofstream pf(PAT_FILE);
        for(const auto& p : patients) {
            pf << p.id << "|" << p.name << "|" << p.age << "|" << p.phone << "\n";
        }
        pf.close();

        ofstream vf(VIS_FILE);
        for(const auto& v : visits) {
            vf << v.patientId << "|" << v.date << "|" << v.diagnosis << "|" << v.prescription << "\n";
        }
        vf.close();
    }

public:
    HospitalSystem() { loadData(); }

    void registerPatient() {
        cout << CYAN << "\n  ┌─[ Register Patient ]──────────────┐\n" << RESET;
        string id, name, phone; int age;
        
        cout << "  │ Patient ID: ";    getStringInput(id);
        if(findPatient(id) != -1) {
            cout << RED << "  ✗ Error: Patient ID already exists.\n" << RESET;
            return;
        }
        
        cout << "  │ Name: ";          getStringInput(name);
        cout << "  │ Age: ";           getIntInput(age);
        cout << "  │ Phone: ";         getStringInput(phone);

        patients.emplace_back(id, name, age, phone);
        saveData();
        cout << GREEN << "  ✓ Patient registered successfully.\n" << RESET;
    }

    void addVisit() {
        cout << CYAN << "\n  ┌─[ Add Visit Record ]──────────────┐\n" << RESET;
        string id, date, diag, rx;
        
        cout << "  │ Patient ID: ";    getStringInput(id);
        if(findPatient(id) == -1) {
            cout << RED << "  ✗ Error: Cannot add visit. Patient not found.\n" << RESET;
            return;
        }
        
        cout << "  │ Date (YYYY-MM-DD): "; getStringInput(date);
        cout << "  │ Diagnosis: ";         getStringInput(diag);
        cout << "  │ Prescription: ";      getStringInput(rx);

        visits.emplace_back(id, date, diag, rx);
        saveData();
        cout << GREEN << "  ✓ Visit added successfully.\n" << RESET;
    }

    void searchPatient() {
        cout << CYAN << "\n  ┌─[ Search Patient ]────────────────┐\n" << RESET;
        string id;
        cout << "  │ Patient ID: "; getStringInput(id);
        int idx = findPatient(id);
        if(idx == -1) {
            cout << RED << "  ✗ Patient not found.\n" << RESET;
            return;
        }
        
        cout << "\n  " << BOLD << "👤 Patient Profile:" << RESET << "\n";
        patients[idx].print();
        
        cout << "\n  " << BOLD << "📋 Visit History:" << RESET << "\n";
        bool found = false;
        for(const auto& v : visits) {
            if(v.patientId == id) {
                cout << "\n";
                v.print();
                found = true;
            }
        }
        if(!found) cout << "\n  " << DIM << "No visits recorded yet.\n" << RESET;
    }

    void reportFrequentVisitors() {
        int N;
        cout << CYAN << "\n  ┌─[ Frequent Visitors Report ]─────────────┐\n" << RESET;
        cout << "  │ Enter Minimum Number of Visits (e.g. 2): ";
        getIntInput(N);
        
        cout << "\n";
        map<string, int> visitCounts;
        for(const auto& v : visits) visitCounts[v.patientId]++;
        
        bool found = false;
        for(const auto& pair : visitCounts) {
            if(pair.second > N) {
                int idx = findPatient(pair.first);
                if(idx != -1) {
                    cout << "\n";
                    patients[idx].print();
                    cout << "  " << MAGENTA << "Number of Visits : " << pair.second << RESET << "\n";
                    found = true;
                }
            }
        }
        if(!found) cout << DIM << "  No patients with more than " << N << " visits.\n" << RESET;
    }

    void reportTotalVisits() {
        cout << MAGENTA << "\n  ┌─[ System Statistics ]─────────────┐\n" << RESET;
        cout << "  │ Total Patients Registered : " << BOLD << patients.size() << RESET << "\n";
        cout << "  │ Total Visits Recorded     : " << BOLD << visits.size() << RESET << "\n";
        cout << "  └───────────────────────────────────┘\n";
    }
};

int main() {
    HospitalSystem hs;
    int choice;
    do {
        cout << "\n" << BOLD << CYAN << "  === 🏥 CLINIC REGISTER SYSTEM ===" << RESET << "\n";
        cout << "  1. Register New Patient\n";
        cout << "  2. Add Visit Record\n";
        cout << "  3. Search Patient by ID & View History\n";
        cout << "  4. Report: Frequent Visitors\n";
        cout << "  5. Report: Total Visits\n";
        cout << RED << "  0. Exit\n" << RESET;
        cout << BOLD << "  Choice: " << RESET;
        
        getIntInput(choice);

        switch(choice) {
            case 1: hs.registerPatient(); pauseForUser(); break;
            case 2: hs.addVisit(); pauseForUser(); break;
            case 3: hs.searchPatient(); pauseForUser(); break;
            case 4: hs.reportFrequentVisitors(); pauseForUser(); break;
            case 5: hs.reportTotalVisits(); pauseForUser(); break;
            case 0: cout << GREEN << "\n  Data saved. Goodbye!\n" << RESET; break;
            default: cout << RED << "  ✗ Invalid choice.\n" << RESET; pauseForUser();
        }
    } while(choice != 0);

    return 0;
}
