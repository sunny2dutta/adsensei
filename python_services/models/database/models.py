from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class RequestLog(Base):
    __tablename__ = "request_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    endpoint = Column(String(100), index=True)
    method = Column(String(10))
    user_agent = Column(String(500))
    ip_address = Column(String(45))
    request_id = Column(String(100), unique=True, index=True)
    
    # Request data
    product_name = Column(String(200))
    product_category = Column(String(100))
    platform = Column(String(50))
    style = Column(String(50))
    
    # Response data
    success = Column(String(10))
    response_time_ms = Column(Float)
    error_message = Column(Text)
    
    # Generated image data
    image_id = Column(String(100))
    image_path = Column(String(500))
    generation_time_ms = Column(Float)
    
    # Additional metadata
    metadata = Column(JSON)

class ErrorLog(Base):
    __tablename__ = "error_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    request_id = Column(String(100), index=True)
    error_type = Column(String(100))
    error_message = Column(Text)
    stack_trace = Column(Text)
    endpoint = Column(String(100))
    
    # Context data
    context = Column(JSON)

class PerformanceLog(Base):
    __tablename__ = "performance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    request_id = Column(String(100), index=True)
    operation = Column(String(100))
    duration_ms = Column(Float)
    
    # Performance metrics
    memory_usage_mb = Column(Float)
    cpu_percent = Column(Float)
    
    # Additional metrics
    metadata = Column(JSON)

# Database setup
DATABASE_URL = "sqlite:///./logs.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()