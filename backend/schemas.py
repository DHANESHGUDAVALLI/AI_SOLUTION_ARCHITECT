from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectRequirementInput(BaseModel):
    project_name: str
    domain: str
    description: str
    expected_users: Optional[str] = "10,000 - 100,000 DAU"
    team_size: Optional[str] = "3 - 5 Developers"
    budget: Optional[str] = "Moderate ($2,000 - $10,000 / month)"
    deadline: Optional[str] = "3 - 6 Months"
    required_features: Optional[str] = "Auth, Dashboard, Real-time notifications, Search, Analytics"
    compliance_needs: Optional[str] = "Standard Security / GDPR"
    preferred_cloud: Optional[str] = "AWS / GCP Multi-cloud"
    custom_gemini_key: Optional[str] = None

class TechStackItem(BaseModel):
    category: str
    technology: str
    version_or_tier: str
    why_this: str
    why_not_alternatives: str

class TradeoffOption(BaseModel):
    architecture_name: str
    summary: str
    pros: List[str]
    cons: List[str]
    suitability_score: int # 1 to 100
    estimated_monthly_cost: str
    complexity_level: str # Low, Medium, High

class SprintTask(BaseModel):
    sprint_number: int
    sprint_title: str
    duration_weeks: int
    key_deliverables: List[str]
    milestone: str

class CostBreakdownItem(BaseModel):
    resource: str
    service_type: str
    estimated_monthly_usd: float
    notes: str

class RiskItem(BaseModel):
    category: str # Technical, Operational, Security, Financial
    risk_title: str
    description: str
    severity: str # High, Medium, Low
    impact: str
    mitigation_strategy: str

class NodeConnection(BaseModel):
    from_node: str
    to_node: str
    label: str

class DiagramNode(BaseModel):
    id: str
    label: str
    layer: str # Frontend, Backend, Database, Cloud, Cache
    subtext: str

class ArchitectureDiagramData(BaseModel):
    nodes: List[DiagramNode]
    connections: List[NodeConnection]

class ArchitectureEvaluationResponse(BaseModel):
    project_name: str
    domain: str
    executive_summary: str
    recommended_pattern: str # e.g. Event-Driven Microservices
    pattern_description: str
    tech_stack: List[TechStackItem]
    tradeoff_options: List[TradeoffOption]
    diagram: ArchitectureDiagramData
    cost_estimation: Dict[str, Any] # total_monthly, currency, itemized: List[CostBreakdownItem]
    sprint_plan: List[SprintTask]
    risk_analysis: List[RiskItem]
    recommended_at: Optional[str] = None
    project_id: Optional[int] = None

class ChatRequest(BaseModel):
    project_id: Optional[int] = None
    architecture_context: Dict[str, Any]
    user_query: str
    custom_gemini_key: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
