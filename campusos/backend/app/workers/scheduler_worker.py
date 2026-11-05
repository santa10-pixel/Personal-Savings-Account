import time
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from campusos.backend.app.database.session import SessionLocal
from campusos.backend.app.services.notification_scheduler import dispatch_due_notifications

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("campusos.worker")

def run_notification_cycle():
    db = SessionLocal()
    try:
        count = dispatch_due_notifications(db)
        if count > 0:
            logger.info(f"Dispatched {count} due academic reminder notification(s).")
    except Exception as e:
        logger.error(f"Error in notification dispatch cycle: {e}")
    finally:
        db.close()

def start_worker():
    scheduler = BackgroundScheduler()
    # Check for due notifications every 30 seconds
    scheduler.add_job(run_notification_cycle, 'interval', seconds=30, id='dispatch_notifications')
    scheduler.start()
    logger.info("CampusOS Background Worker started. Listening for scheduled notification triggers...")

    try:
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("CampusOS Background Worker shut down.")

if __name__ == "__main__":
    start_worker()
