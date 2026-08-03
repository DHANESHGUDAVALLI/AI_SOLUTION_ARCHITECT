import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    projects = relationship("ArchitectureProject", back_populates="owner", cascade="all, delete-orphan")

class ArchitectureProject(Base):
    __tablename__ = "architecture_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    project_name = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    expected_users = Column(String, nullable=True)
    team_size = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    required_features = Column(Text, nullable=True)
    compliance_needs = Column(String, nullable=True)
    preferred_cloud = Column(String, nullable=True)
    
    # Store complete evaluation response JSON
    evaluation_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="projects")
