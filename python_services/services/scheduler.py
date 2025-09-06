from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from services.logger import db_logger
import logging
import asyncio

class LogCleanupScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.logger = logging.getLogger(__name__)
        
    def start_scheduler(self):
        """Start the background scheduler for log cleanup"""
        try:
            # Schedule log cleanup to run daily at 2 AM
            self.scheduler.add_job(
                func=self._cleanup_logs,
                trigger=CronTrigger(hour=2, minute=0),
                id='log_cleanup',
                name='Daily Log Cleanup',
                replace_existing=True
            )
            
            # Also schedule a weekly cleanup at Sunday 3 AM for extra safety
            self.scheduler.add_job(
                func=self._weekly_cleanup,
                trigger=CronTrigger(day_of_week=0, hour=3, minute=0),
                id='weekly_log_cleanup',
                name='Weekly Log Cleanup',
                replace_existing=True
            )
            
            self.scheduler.start()
            self.logger.info("Log cleanup scheduler started successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to start log cleanup scheduler: {e}")
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        try:
            self.scheduler.shutdown()
            self.logger.info("Log cleanup scheduler stopped")
        except Exception as e:
            self.logger.error(f"Error stopping scheduler: {e}")
    
    async def _cleanup_logs(self):
        """Daily cleanup job - removes ONLY LOG ENTRIES older than 15 days
        
        SAFETY: This will NEVER delete business data like users, passwords, 
        ad performance metrics, or any persistent application data.
        """
        try:
            self.logger.info("Starting daily log cleanup - ONLY removing log entries, NOT business data")
            deleted_count = db_logger.cleanup_old_logs(days=15)
            self.logger.info(f"Daily log cleanup completed: {deleted_count} log entries removed (business data preserved)")
        except Exception as e:
            self.logger.error(f"Daily log cleanup failed: {e}")
    
    async def _weekly_cleanup(self):
        """Weekly cleanup job - more thorough cleanup and stats logging
        
        SAFETY: This will NEVER delete business data like users, passwords,
        ad performance metrics, or any persistent application data.
        """
        try:
            self.logger.info("Starting weekly log cleanup - ONLY removing log entries, NOT business data")
            
            # Clean up logs older than 15 days (LOGS ONLY)
            deleted_count = db_logger.cleanup_old_logs(days=15)
            
            # Get current stats
            stats = db_logger.get_log_stats()
            
            self.logger.info(f"Weekly log cleanup completed: {deleted_count} log entries removed (business data preserved)")
            self.logger.info(f"Current log stats: {stats}")
            
        except Exception as e:
            self.logger.error(f"Weekly log cleanup failed: {e}")
    
    def cleanup_now(self):
        """Manually trigger cleanup (useful for testing or manual maintenance)
        
        SAFETY: This will NEVER delete business data like users, passwords,
        ad performance metrics, or any persistent application data.
        """
        try:
            self.logger.info("Starting manual log cleanup - ONLY removing log entries, NOT business data")
            deleted_count = db_logger.cleanup_old_logs(days=15)
            self.logger.info(f"Manual log cleanup completed: {deleted_count} log entries removed (business data preserved)")
            return deleted_count
        except Exception as e:
            self.logger.error(f"Manual log cleanup failed: {e}")
            return 0

# Global scheduler instance
log_scheduler = LogCleanupScheduler()