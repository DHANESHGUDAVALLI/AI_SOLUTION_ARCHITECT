from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import engine, get_db
from services.auth import get_password_hash, verify_password, create_access_token, get_current_user, require_current_user
from services.ai_architect import generate_architecture_recommendation, answer_architecture_question
from services.pdf_generator import generate_pdf_report
import datetime

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Solution Architect API",
    description="Intelligent Enterprise Architecture Recommendation System powered by Generative AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "AI Solution Architect Engine"}

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.Token)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username
        }
    }

@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(require_current_user)):
    return current_user

# --- ARCHITECTURE RECOMMENDATION ENDPOINTS ---

@app.post("/api/architect/recommend", response_model=schemas.ArchitectureEvaluationResponse)
def analyze_and_recommend(
    input_data: schemas.ProjectRequirementInput,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
    recommendation = generate_architecture_recommendation(input_data)
    recommendation["recommended_at"] = datetime.datetime.utcnow().isoformat()
    
    # Save project automatically if authenticated user
    if current_user:
        new_project = models.ArchitectureProject(
            user_id=current_user.id,
            project_name=input_data.project_name,
            domain=input_data.domain,
            description=input_data.description,
            expected_users=input_data.expected_users,
            team_size=input_data.team_size,
            budget=input_data.budget,
            deadline=input_data.deadline,
            required_features=input_data.required_features,
            compliance_needs=input_data.compliance_needs,
            preferred_cloud=input_data.preferred_cloud,
            evaluation_result=recommendation
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        recommendation["project_id"] = new_project.id

    return recommendation

@app.post("/api/architect/chat", response_model=schemas.ChatResponse)
def chat_with_architect(request: schemas.ChatRequest):
    answer = answer_architecture_question(request)
    return {"answer": answer}

# --- PROJECT HISTORY ENDPOINTS ---

@app.get("/api/projects/history")
def get_project_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_current_user)
):
    projects = db.query(models.ArchitectureProject).filter(
        models.ArchitectureProject.user_id == current_user.id
    ).order_by(models.ArchitectureProject.created_at.desc()).all()

    history_list = []
    for p in projects:
        history_list.append({
            "id": p.id,
            "project_name": p.project_name,
            "domain": p.domain,
            "description": p.description,
            "created_at": p.created_at.isoformat(),
            "recommended_pattern": p.evaluation_result.get("recommended_pattern", "N/A"),
            "evaluation_result": p.evaluation_result
        })
    return history_list

@app.get("/api/projects/{project_id}")
def get_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_current_user)
):
    project = db.query(models.ArchitectureProject).filter(
        models.ArchitectureProject.id == project_id,
        models.ArchitectureProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project evaluation not found")
    return project.evaluation_result

@app.delete("/api/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_current_user)
):
    project = db.query(models.ArchitectureProject).filter(
        models.ArchitectureProject.id == project_id,
        models.ArchitectureProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project evaluation not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project evaluation deleted successfully"}

# --- PDF REPORT EXPORT ENDPOINT ---

@app.post("/api/pdf/export")
def export_pdf_report(eval_data: dict):
    try:
        pdf_bytes = generate_pdf_report(eval_data)
        filename = f"{eval_data.get('project_name', 'Architecture')}_Report.pdf".replace(" ", "_")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")
