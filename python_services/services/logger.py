import uuid
import time
import traceback
import psutil
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models.database.models import RequestLog, ErrorLog, PerformanceLog, get_db, create_tables
from contextlib import contextmanager
import logging

class DatabaseLogger:
    def __init__(self):
        create_tables()
        self.process = psutil.Process()
        
        # Setup standard Python logging as backup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def generate_request_id(self) -> str:
        """Generate unique request ID"""
        return str(uuid.uuid4())

    @contextmanager
    def get_db_session(self):
        """Get database session with proper cleanup"""
        db = next(get_db())
        try:
            yield db
            db.commit()
        except Exception as e:
            db.rollback()
            self.logger.error(f"Database error: {e}")
            raise
        finally:
            db.close()

    def log_request(self, 
                   request_id: str,
                   endpoint: str,
                   method: str = "POST",
                   user_agent: str = "",
                   ip_address: str = "",
                   product_name: str = "",
                   product_category: str = "",
                   platform: str = "",
                   style: str = "",
                   success: bool = True,
                   response_time_ms: float = 0.0,
                   error_message: str = "",
                   image_id: str = "",
                   image_path: str = "",
                   generation_time_ms: float = 0.0,
                   metadata: Optional[Dict[str, Any]] = None):
        """Log API request details"""
        try:
            with self.get_db_session() as db:
                log_entry = RequestLog(
                    timestamp=datetime.utcnow(),
                    endpoint=endpoint,
                    method=method,
                    user_agent=user_agent[:500],  # Truncate long user agents
                    ip_address=ip_address,
                    request_id=request_id,
                    product_name=product_name[:200],
                    product_category=product_category,
                    platform=platform,
                    style=style,
                    success="true" if success else "false",
                    response_time_ms=response_time_ms,
                    error_message=error_message,
                    image_id=image_id,
                    image_path=image_path,
                    generation_time_ms=generation_time_ms,
                    metadata=metadata or {}
                )
                db.add(log_entry)
                
        except Exception as e:
            # Fallback to standard logging
            self.logger.error(f"Failed to log request to database: {e}")
            self.logger.info(f"Request {request_id}: {endpoint} - Success: {success}")

    def log_error(self, 
                  request_id: str,
                  error_type: str,
                  error_message: str,
                  endpoint: str = "",
                  context: Optional[Dict[str, Any]] = None):
        """Log error details"""
        try:
            with self.get_db_session() as db:
                error_log = ErrorLog(
                    timestamp=datetime.utcnow(),
                    request_id=request_id,
                    error_type=error_type,
                    error_message=error_message,
                    stack_trace=traceback.format_exc(),
                    endpoint=endpoint,
                    context=context or {}
                )
                db.add(error_log)
                
        except Exception as e:
            # Fallback to standard logging
            self.logger.error(f"Failed to log error to database: {e}")
            self.logger.error(f"Original error - {error_type}: {error_message}")

    def log_performance(self, 
                       request_id: str,
                       operation: str,
                       duration_ms: float,
                       metadata: Optional[Dict[str, Any]] = None):
        """Log performance metrics"""
        try:
            # Get current system metrics
            memory_info = self.process.memory_info()
            memory_mb = memory_info.rss / (1024 * 1024)
            cpu_percent = self.process.cpu_percent()
            
            with self.get_db_session() as db:
                perf_log = PerformanceLog(
                    timestamp=datetime.utcnow(),
                    request_id=request_id,
                    operation=operation,
                    duration_ms=duration_ms,
                    memory_usage_mb=memory_mb,
                    cpu_percent=cpu_percent,
                    metadata=metadata or {}
                )
                db.add(perf_log)
                
        except Exception as e:
            # Fallback to standard logging
            self.logger.error(f"Failed to log performance to database: {e}")
            self.logger.info(f"Performance - {operation}: {duration_ms}ms")

    def cleanup_old_logs(self, days: int = 15):
        """Delete ONLY LOG ENTRIES older than specified days.
        
        IMPORTANT: This only deletes logs, not any business data like:
        - User accounts, passwords, authentication data
        - Ad performance metrics and analytics
        - Generated images or their metadata
        - Any persistent application data
        
        Only the following LOG TABLES are cleaned:
        - request_logs: API request logs
        - error_logs: Error and exception logs  
        - performance_logs: System performance logs
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Define ONLY the log tables that should be cleaned
            LOG_TABLES_ONLY = [
                (RequestLog, "request_logs"),
                (ErrorLog, "error_logs"), 
                (PerformanceLog, "performance_logs")
            ]
            
            total_deleted = 0
            deleted_by_table = {}
            
            with self.get_db_session() as db:
                for log_model, table_name in LOG_TABLES_ONLY:
                    # Safety check: Only delete from tables that end with "_logs"
                    if not table_name.endswith("_logs"):
                        self.logger.warning(f"Skipping {table_name} - not a log table")
                        continue
                    
                    deleted_count = db.query(log_model).filter(
                        log_model.timestamp < cutoff_date
                    ).delete()
                    
                    deleted_by_table[table_name] = deleted_count
                    total_deleted += deleted_count
                
                self.logger.info(f"Log cleanup completed: {total_deleted} log entries removed after {days} days")
                self.logger.info(f"Breakdown: {deleted_by_table}")
                return total_deleted
                
        except Exception as e:
            self.logger.error(f"Failed to cleanup old logs: {e}")
            return 0

    def get_log_stats(self) -> Dict[str, Any]:
        """Get logging statistics"""
        try:
            with self.get_db_session() as db:
                request_count = db.query(RequestLog).count()
                error_count = db.query(ErrorLog).count()
                perf_count = db.query(PerformanceLog).count()
                
                # Get recent activity (last 24 hours)
                recent_cutoff = datetime.utcnow() - timedelta(hours=24)
                recent_requests = db.query(RequestLog).filter(
                    RequestLog.timestamp > recent_cutoff
                ).count()
                
                recent_errors = db.query(ErrorLog).filter(
                    ErrorLog.timestamp > recent_cutoff
                ).count()
                
                return {
                    "total_logs": {
                        "requests": request_count,
                        "errors": error_count,
                        "performance": perf_count,
                        "total": request_count + error_count + perf_count
                    },
                    "last_24_hours": {
                        "requests": recent_requests,
                        "errors": recent_errors
                    },
                    "database_file": "logs.db"
                }
                
        except Exception as e:
            self.logger.error(f"Failed to get log stats: {e}")
            return {"error": str(e)}

# Global logger instance
db_logger = DatabaseLogger()

@contextmanager
def log_request_context(endpoint: str, **kwargs):
    """Context manager for logging requests with automatic timing"""
    request_id = db_logger.generate_request_id()
    start_time = time.time()
    
    try:
        yield request_id
        # Log successful request
        response_time = (time.time() - start_time) * 1000
        db_logger.log_request(
            request_id=request_id,
            endpoint=endpoint,
            response_time_ms=response_time,
            success=True,
            **kwargs
        )
    except Exception as e:
        # Log failed request
        response_time = (time.time() - start_time) * 1000
        db_logger.log_request(
            request_id=request_id,
            endpoint=endpoint,
            response_time_ms=response_time,
            success=False,
            error_message=str(e),
            **kwargs
        )
        db_logger.log_error(
            request_id=request_id,
            error_type=type(e).__name__,
            error_message=str(e),
            endpoint=endpoint
        )
        raise

@contextmanager 
def log_performance_context(request_id: str, operation: str, **kwargs):
    """Context manager for logging performance with automatic timing"""
    start_time = time.time()
    try:
        yield
    finally:
        duration = (time.time() - start_time) * 1000
        db_logger.log_performance(
            request_id=request_id,
            operation=operation,
            duration_ms=duration,
            metadata=kwargs
        )