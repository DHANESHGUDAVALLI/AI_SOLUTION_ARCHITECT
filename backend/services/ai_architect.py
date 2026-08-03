import json
import logging
import re
from typing import Dict, Any, Optional
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from config import GEMINI_API_KEY
from schemas import ProjectRequirementInput, ChatRequest

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an Elite Enterprise AI Solution Architect & Principal Systems Engineer.
Your task is to analyze software project requirements and output a comprehensive, production-grade enterprise software architecture blueprint in valid JSON format ONLY.

Your analysis MUST include:
1. Executive Summary & Recommended Architecture Pattern (e.g., Event-Driven Microservices, Modular Monolith, Serverless Microservices, CQRS Hybrid).
2. Complete Tech Stack with deep technical justifications for "Why This Technology?" and "Why Not Alternatives?".
3. Architecture Comparison Matrix (Comparing 3 architectures: Option A Recommended, Option B Monolith/Simple, Option C Serverless/Distributed).
4. Architecture Diagram Nodes & Connections suitable for visualization.
5. Monthly & Annual Infrastructure Cost Estimation broken down by compute, DB, storage, CDN, security, and AI API costs based on user scale.
6. Agile Sprint Plan & Timeline (6 Sprints with key deliverables and milestones).
7. Risk Analysis Matrix (Technical, Operational, Security, Financial risks with severity scores and mitigation strategies).

Format your output strictly as a JSON object matching this structure:
{
  "executive_summary": "Comprehensive 3-4 sentence architectural executive summary...",
  "recommended_pattern": "Event-Driven Microservices with CQRS",
  "pattern_description": "Detailed explanation of why this pattern suits the domain and scale requirements...",
  "tech_stack": [
    {
      "category": "Frontend",
      "technology": "React 18 + Vite + Tailwind CSS",
      "version_or_tier": "v18.x",
      "why_this": "Provides component modularity, instant SSR/SPA rendering, rich ecosystem for dashboard charts and fast bundle sizes.",
      "why_not_alternatives": "Avoided Angular due to higher boilerplate overhead and slower iteration speed for small to medium team size."
    },
    {
      "category": "Backend Services",
      "technology": "FastAPI (Python) + Node.js (Async Gateway)",
      "version_or_tier": "Python 3.11+",
      "why_this": "FastAPI offers high-performance async IO, automatic OpenAPI specs, and seamless integration with ML/AI pipelines.",
      "why_not_alternatives": "Avoided Ruby on Rails due to lower async concurrency throughput under high DAU peaks."
    },
    {
      "category": "Database Layer",
      "technology": "PostgreSQL (RDS Aurora Multi-AZ) + Redis",
      "version_or_tier": "PostgreSQL 16",
      "why_this": "ACID compliance for critical transactions, JSONB document fields, and Redis for sub-millisecond session caching.",
      "why_not_alternatives": "Avoided pure MongoDB due to lack of strict relational constraints on financial/core domain schemas."
    },
    {
      "category": "Authentication",
      "technology": "JWT (OAuth2 + PKCE) + Auth0 / Supabase Auth",
      "version_or_tier": "Standard RFC 7519",
      "why_this": "Stateless token validation across microservices with RBAC fine-grained permissions.",
      "why_not_alternatives": "Avoided legacy stateful session cookies due to scaling friction across multi-region server nodes."
    },
    {
      "category": "Cloud & Infrastructure",
      "technology": "AWS ECS (Fargate) + CloudFront CDN + Terraform",
      "version_or_tier": "AWS Cloud",
      "why_this": "Serverless container orchestration eliminates cluster patching while maintaining container portability.",
      "why_not_alternatives": "Avoided raw EC2 instances due to manual auto-scaling complexity and elevated operational burden."
    }
  ],
  "tradeoff_options": [
    {
      "architecture_name": "Event-Driven Microservices (Recommended)",
      "summary": "Decoupled domain microservices communicating asynchronously via Kafka/RabbitMQ.",
      "pros": ["Independent service scaling", "High fault isolation", "Flexible tech choices per domain service"],
      "cons": ["Higher deployment complexity", "Distributed tracing overhead"],
      "suitability_score": 95,
      "estimated_monthly_cost": "$850 - $1,400 / mo",
      "complexity_level": "Medium-High"
    },
    {
      "architecture_name": "Modular Monolith",
      "summary": "Single deployment artifact organized into strictly isolated domain modules in Python/Node.",
      "pros": ["Simple CI/CD deployment", "Zero network latency between modules", "Single DB connection pool"],
      "cons": ["Single point of deployment failure", "Tighter resource contention"],
      "suitability_score": 75,
      "estimated_monthly_cost": "$350 - $600 / mo",
      "complexity_level": "Low-Medium"
    },
    {
      "architecture_name": "Fully Serverless (Lambda + DynamoDB)",
      "summary": "Event-driven functions triggered by API Gateway with NoSQL persistent store.",
      "pros": ["Zero idle compute cost", "Automatic infinite elasticity"],
      "cons": ["Cold start latency spikes", "Vendor lock-in", "Complex local testing"],
      "suitability_score": 68,
      "estimated_monthly_cost": "$200 - $1,800 / mo (traffic variable)",
      "complexity_level": "Medium"
    }
  ],
  "diagram": {
    "nodes": [
      {"id": "n1", "label": "React Single Page App", "layer": "Frontend", "subtext": "CloudFront CDN"},
      {"id": "n2", "label": "API Gateway / Nginx", "layer": "Gateway", "subtext": "OAuth2 Auth Check"},
      {"id": "n3", "label": "Core API Service", "layer": "Backend", "subtext": "FastAPI Async Cluster"},
      {"id": "n4", "label": "Redis In-Memory Cache", "layer": "Cache", "subtext": "Sub-ms Session & Cache"},
      {"id": "n5", "label": "PostgreSQL Primary", "layer": "Database", "subtext": "Multi-AZ Replication"}
    ],
    "connections": [
      {"from_node": "n1", "to_node": "n2", "label": "HTTPS REST/WS"},
      {"from_node": "n2", "to_node": "n3", "label": "gRPC / HTTP2"},
      {"from_node": "n3", "to_node": "n4", "label": "Redis Protocol"},
      {"from_node": "n3", "to_node": "n5", "label": "SQL Connection Pool"}
    ]
  },
  "cost_estimation": {
    "currency": "USD",
    "total_monthly": 1250.00,
    "total_annual": 15000.00,
    "itemized": [
      {"resource": "Compute Application Servers", "service_type": "AWS ECS Fargate (4 vCPU, 8GB RAM)", "estimated_monthly_usd": 420.0, "notes": "Auto-scaling 2 to 6 tasks"},
      {"resource": "Database Instance", "service_type": "AWS RDS PostgreSQL Aurora db.r6g.large", "estimated_monthly_usd": 380.0, "notes": "Multi-AZ with auto-backups"},
      {"resource": "Caching & Queue", "service_type": "AWS ElastiCache Redis (cache.m6g.large)", "estimated_monthly_usd": 150.0, "notes": "Session & DB query caching"},
      {"resource": "CDN & Storage", "service_type": "CloudFront + S3 (500GB static assets)", "estimated_monthly_usd": 90.0, "notes": "Global edge caching"},
      {"resource": "Logging & Security", "service_type": "CloudWatch + AWS WAF + Datadog", "estimated_monthly_usd": 210.0, "notes": "Real-time metrics & threat protection"}
    ]
  },
  "sprint_plan": [
    {
      "sprint_number": 1,
      "sprint_title": "Architecture Setup & Core Foundation",
      "duration_weeks": 2,
      "key_deliverables": ["Repository scaffold & CI/CD pipeline", "DB schema design & migrations", "JWT Auth implementation"],
      "milestone": "Base Skeleton Running locally & staging"
    },
    {
      "sprint_number": 2,
      "sprint_title": "Domain Core Services & APIs",
      "duration_weeks": 2,
      "key_deliverables": ["CRUD API endpoints", "Data validation schemas", "Redis caching integration"],
      "milestone": "Core Business APIs Complete"
    },
    {
      "sprint_number": 3,
      "sprint_title": "Frontend App & Integration",
      "duration_weeks": 2,
      "key_deliverables": ["UI Component Library setup", "Dashboard layout & state management", "API Gateway connection"],
      "milestone": "End-to-End User Flow Functional"
    },
    {
      "sprint_number": 4,
      "sprint_title": "Advanced Features & AI/Analytics Integration",
      "duration_weeks": 2,
      "key_deliverables": ["Background job processor setup", "Real-time updates / WebSockets", "Analytics telemetry"],
      "milestone": "Feature Complete MVP"
    },
    {
      "sprint_number": 5,
      "sprint_title": "Security, Testing & Performance Tuning",
      "duration_weeks": 2,
      "key_deliverables": ["Load testing & DB query optimization", "Penetration testing & OWASP audit", "Cost monitoring alarms"],
      "milestone": "Production Readiness Gate Passed"
    },
    {
      "sprint_number": 6,
      "sprint_title": "Production Deployment & Go-Live",
      "duration_weeks": 2,
      "key_deliverables": ["Multi-region blue-green rollout", "DNS cutover & SSL certification", "SLA monitoring & alerts"],
      "milestone": "General Availability (GA) Launch"
    }
  ],
  "risk_analysis": [
    {
      "category": "Technical",
      "risk_title": "Database Connection Pool Bottleneck under Peak Traffic",
      "description": "High concurrent user spikes could exceed maximum relational database connection limits.",
      "severity": "High",
      "impact": "Increased API latency or HTTP 500 error spikes during traffic surges.",
      "mitigation_strategy": "Implement PgBouncer connection pooling, read replicas for heavy queries, and Redis caching for hot read paths."
    },
    {
      "category": "Operational",
      "risk_title": "Deployment Complexity & Distributed Service Failures",
      "description": "Managing multiple containerized services increases monitoring and debugging friction.",
      "severity": "Medium",
      "impact": "Delayed bug resolution due to distributed log fragmentation.",
      "mitigation_strategy": "Adopt OpenTelemetry distributed tracing, centralized CloudWatch log aggregation, and automated CI/CD rollback triggers."
    },
    {
      "category": "Security",
      "risk_title": "Unauthorized Access & Data Breaches",
      "description": "Exposure of sensitive customer data or compromise of API JWT tokens.",
      "severity": "High",
      "impact": "Compliance violation fines, reputational damage, and security incidents.",
      "mitigation_strategy": "Enforce TLS 1.3 in transit, AES-256 at rest, strict CORS headers, rate limiting at Gateway, and annual security audits."
    },
    {
      "category": "Financial",
      "risk_title": "Cloud Infrastructure Budget Overrun",
      "description": "Unconstrained compute scaling or unoptimized logging storage driving up AWS bills.",
      "severity": "Medium",
      "impact": "Monthly operational expense exceeding allocated project budget.",
      "mitigation_strategy": "Configure AWS Budget alerts at 80% threshold, auto-scaling upper bounds, and S3 lifecycle retention rules."
    }
  ]
}
"""

def generate_architecture_recommendation(input_data: ProjectRequirementInput) -> Dict[str, Any]:
    """
    Generates a full AI architecture recommendation using Gemini API if key is present,
    or falls back to an intelligent heuristic deterministic Enterprise Architect engine.
    """
    api_key = input_data.custom_gemini_key or GEMINI_API_KEY
    
    if api_key and api_key.strip():
        try:
            logger.info("Calling Google Gemini API for Enterprise Architecture Evaluation...")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""
            {SYSTEM_PROMPT}

            --- USER PROJECT SPECIFICATIONS ---
            Project Name: {input_data.project_name}
            Industry Domain: {input_data.domain}
            Project Description: {input_data.description}
            Expected Users / Traffic: {input_data.expected_users}
            Team Size & Skill: {input_data.team_size}
            Budget Limit: {input_data.budget}
            Target Deadline: {input_data.deadline}
            Required Key Features: {input_data.required_features}
            Compliance / Security Needs: {input_data.compliance_needs}
            Preferred Cloud Provider: {input_data.preferred_cloud}
            """

            response = model.generate_content(prompt)
            raw_text = response.text
            
            # Extract JSON substring
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if json_match:
                parsed_json = json.loads(json_match.group(0))
                parsed_json["project_name"] = input_data.project_name
                parsed_json["domain"] = input_data.domain
                return parsed_json
        except Exception as e:
            logger.warning(f"Gemini API call failed or timed out ({str(e)}). Falling back to heuristic engine.")

    # Fallback to Intelligent Deterministic Enterprise Architect Engine
    return generate_deterministic_architecture(input_data)

def generate_deterministic_architecture(input_data: ProjectRequirementInput) -> Dict[str, Any]:
    domain = input_data.domain.lower()
    desc = input_data.description.lower()
    users = (input_data.expected_users or "").lower()
    
    # Determine pattern based on domain & user scale
    is_high_scale = "100k" in users or "1m" in users or "enterprise" in desc or "fintech" in domain
    is_microservice = is_high_scale or "microservices" in desc
    
    if "fintech" in domain or "finance" in domain or "bank" in domain:
        pattern = "Event-Driven Microservices with CQRS & Saga Pattern"
        pattern_desc = "High-security financial architecture emphasizing ACID transaction consistency, event sourcing for audit trails, and strict decoupling between payment processing and reporting services."
        frontend_tech = "React 18 + TypeScript + Vite + Tailwind CSS"
        backend_tech = "FastAPI (Async Microservices) + Java Spring Boot (Core Ledger)"
        db_tech = "PostgreSQL RDS Aurora (Multi-AZ) + Redis Enterprise Cache"
        auth_tech = "OAuth2 / OIDC + JWT with mTLS & Hardware Security Module (HSM)"
        cloud_tech = "AWS (ECS / EKS) + WAF Security Shield + CloudTrail Audit"
        cost_monthly = 2450.0
    elif "e-commerce" in domain or "retail" in domain or "shop" in domain:
        pattern = "Modular Monolith with Serverless Edge API Gateway"
        pattern_desc = "High-throughput modular commerce architecture prioritizing fast product catalog caching, resilient inventory locking, and quick checkout flow."
        frontend_tech = "Next.js / React SSR + Tailwind CSS"
        backend_tech = "FastAPI (Python) / Node.js Express"
        db_tech = "PostgreSQL (Core Orders) + MongoDB (Product Catalog) + Redis (Cart)"
        auth_tech = "JWT Tokens + Auth0 / Supabase Authentication"
        cloud_tech = "AWS Fargate + CloudFront CDN Edge Caching"
        cost_monthly = 1150.0
    elif "health" in domain or "medical" in domain:
        pattern = "HIPAA-Compliant Microservices with Secure Data Vault"
        pattern_desc = "HIPAA-compliant healthcare solution using end-to-end encryption at rest and in transit, strict audit logging, and isolated Patient PHI databases."
        frontend_tech = "React 18 + PWA + Tailwind CSS"
        backend_tech = "FastAPI (Python async) + HL7 / FHIR Integration Gateway"
        db_tech = "PostgreSQL Encrypted Aurora + AWS KMS"
        auth_tech = "JWT + Multi-Factor Auth (MFA) + RBAC Policies"
        cloud_tech = "AWS HIPAA-Eligible Stack (ECS + CloudWatch + KMS)"
        cost_monthly = 1850.0
    elif "ai" in domain or "machine learning" in domain or "llm" in domain:
        pattern = "Asynchronous Microservices with GPU Worker Queues"
        pattern_desc = "AI-centric architecture designed for decoupled API handling and async background processing for heavy LLM / ML inference pipelines."
        frontend_tech = "React 18 + Vite + Tailwind CSS + WebSockets"
        backend_tech = "FastAPI (Python) + Celery / RabbitMQ Distributed Task Workers"
        db_tech = "PostgreSQL + pgvector (Vector DB) + Redis Result Backend"
        auth_tech = "JWT Bearer Tokens + API Key Rate Limiting"
        cloud_tech = "AWS ECS + GCP Vertex AI / Nvidia GPU Nodes"
        cost_monthly = 1600.0
    else:
        pattern = "Modular Monolith with Event Bus & Caching Layer"
        pattern_desc = "Clean, highly scalable modular monolith structure providing low deployment complexity, fast feature delivery, and straightforward evolution into microservices."
        frontend_tech = "React 18 + Vite + Tailwind CSS"
        backend_tech = "FastAPI (Python) + Pydantic v2"
        db_tech = "PostgreSQL 16 + Redis In-Memory Cache"
        auth_tech = "JWT (RFC 7519) + OAuth2 Password Bearer"
        cloud_tech = "AWS ECS Fargate + CloudFront CDN + Terraform"
        cost_monthly = 850.0

    return {
        "project_name": input_data.project_name,
        "domain": input_data.domain,
        "executive_summary": f"Targeted architectural blueprint for '{input_data.project_name}' in the {input_data.domain} domain. The architecture balances developer velocity ({input_data.team_size}) with operational stability for target scale ({input_data.expected_users}). Recommended pattern: {pattern}.",
        "recommended_pattern": pattern,
        "pattern_description": pattern_desc,
        "tech_stack": [
            {
                "category": "Frontend Framework",
                "technology": frontend_tech,
                "version_or_tier": "v18.x / Latest LTS",
                "why_this": f"Enables fast UI rendering, component reusability, and robust state management ideal for {input_data.project_name}.",
                "why_not_alternatives": "Avoided monolithic server-rendered legacy frameworks (like Django templates) to maintain decoupled frontend-backend architecture."
            },
            {
                "category": "Backend Services",
                "technology": backend_tech,
                "version_or_tier": "Python 3.10+ / FastAPI",
                "why_this": "Delivers automatic OpenAPI documentation, async IO concurrency, and native Pydantic data validation with near C-speed performance.",
                "why_not_alternatives": "Avoided Synchronous Ruby/PHP due to lower throughput for real-time traffic spikes and concurrent API calls."
            },
            {
                "category": "Database & Storage",
                "technology": db_tech,
                "version_or_tier": "PostgreSQL 16 Multi-AZ",
                "why_this": "Guarantees strict ACID compliance, complex relational queries, and scalable indexing alongside Redis for sub-millisecond session caching.",
                "why_not_alternatives": "Avoided pure NoSQL (e.g. DynamoDB) as primary store due to complex join requirements across business domains."
            },
            {
                "category": "Authentication & Security",
                "technology": auth_tech,
                "version_or_tier": "OAuth2 / JWT Standard",
                "why_this": "Provides stateless, cryptographic access tokens scalable across multiple API instances with zero session store lookup latency.",
                "why_not_alternatives": "Avoided stateful server cookies which hinder horizontal server scaling and multi-region deployments."
            },
            {
                "category": "Cloud & Infrastructure",
                "technology": cloud_tech,
                "version_or_tier": f"Cloud Provider: {input_data.preferred_cloud or 'AWS'}",
                "why_this": "Eliminates physical server maintenance, provides automatic container scaling, and enforces infrastructure-as-code reproduciblity.",
                "why_not_alternatives": "Avoided bare-metal VPS hosting due to lack of auto-scaling, high manual maintenance overhead, and lack of managed SLA."
            }
        ],
        "tradeoff_options": [
            {
                "architecture_name": f"{pattern} (Recommended)",
                "summary": f"Optimal balance of performance, maintainability, and scalability tailored for {input_data.domain}.",
                "pros": ["Optimized for team productivity", "High scalability headroom", "Clear domain boundary isolation"],
                "cons": ["Slightly higher initial setup time than basic monolith"],
                "suitability_score": 96,
                "estimated_monthly_cost": f"${int(cost_monthly)} - ${int(cost_monthly * 1.5)} / mo",
                "complexity_level": "Medium"
            },
            {
                "architecture_name": "Traditional Single Monolith",
                "summary": "Single monolithic app hosting API and static files together in one code repository.",
                "pros": ["Simplest local development setup", "Single deployment target"],
                "cons": ["Scales all components together inefficiency", "Coupled code refactoring risk"],
                "suitability_score": 72,
                "estimated_monthly_cost": f"${int(cost_monthly * 0.4)} - ${int(cost_monthly * 0.6)} / mo",
                "complexity_level": "Low"
            },
            {
                "architecture_name": "Full Serverless (Lambda / Cloud Functions)",
                "summary": "Function-as-a-Service model triggering on individual HTTP routes.",
                "pros": ["Pay strictly per request", "Zero idle server cost"],
                "cons": ["Cold start execution delays", "Complex local debugging & integration tests"],
                "suitability_score": 65,
                "estimated_monthly_cost": f"${int(cost_monthly * 0.3)} - ${int(cost_monthly * 2.0)} / mo",
                "complexity_level": "Medium-High"
            }
        ],
        "diagram": {
            "nodes": [
                {"id": "n1", "label": "React Single Page App", "layer": "Frontend", "subtext": "Edge CDN & HTTPS"},
                {"id": "n2", "label": "API Gateway / Nginx", "layer": "Gateway", "subtext": "JWT Auth & Rate Limit"},
                {"id": "n3", "label": "FastAPI Core Application", "layer": "Backend", "subtext": "Async REST / WebSockets"},
                {"id": "n4", "label": "Redis Cache", "layer": "Cache", "subtext": "In-Memory Session & Hot Cache"},
                {"id": "n5", "label": "PostgreSQL Database", "layer": "Database", "subtext": "Primary DB + Read Replicas"}
            ],
            "connections": [
                {"from_node": "n1", "to_node": "n2", "label": "HTTPS API Requests"},
                {"from_node": "n2", "to_node": "n3", "label": "Proxied Requests"},
                {"from_node": "n3", "to_node": "n4", "label": "Cache Lookup / Write"},
                {"from_node": "n3", "to_node": "n5", "label": "Async SQL Queries"}
            ]
        },
        "cost_estimation": {
            "currency": "USD",
            "total_monthly": cost_monthly,
            "total_annual": cost_monthly * 12,
            "itemized": [
                {"resource": "Application Compute", "service_type": "AWS ECS / Container Nodes", "estimated_monthly_usd": round(cost_monthly * 0.35, 2), "notes": "Auto-scaling web API instances"},
                {"resource": "Database Cluster", "service_type": "Managed PostgreSQL RDS Multi-AZ", "estimated_monthly_usd": round(cost_monthly * 0.30, 2), "notes": "High availability persistent store"},
                {"resource": "Caching & In-Memory Store", "service_type": "ElastiCache Redis Node", "estimated_monthly_usd": round(cost_monthly * 0.15, 2), "notes": "Session & query response caching"},
                {"resource": "CDN & Object Storage", "service_type": "CloudFront CDN + AWS S3", "estimated_monthly_usd": round(cost_monthly * 0.08, 2), "notes": "Global asset delivery & backup"},
                {"resource": "Monitoring & Security WAF", "service_type": "AWS WAF + CloudWatch Logs", "estimated_monthly_usd": round(cost_monthly * 0.12, 2), "notes": "Security firewall & telemetry"}
            ]
        },
        "sprint_plan": [
            {
                "sprint_number": 1,
                "sprint_title": "Sprint 1: Architecture Core & Foundation",
                "duration_weeks": 2,
                "key_deliverables": [f"Setup {input_data.project_name} codebase repository", "Configure CI/CD deployment pipeline", "Implement Database migrations & JWT Auth"],
                "milestone": "Foundation Baseline Ready"
            },
            {
                "sprint_number": 2,
                "sprint_title": "Sprint 2: Domain Data Models & Core APIs",
                "duration_weeks": 2,
                "key_deliverables": ["Build core domain REST API endpoints", "Setup Pydantic data validation schemas", "Implement Redis caching middleware"],
                "milestone": "Backend API Ready"
            },
            {
                "sprint_number": 3,
                "sprint_title": "Sprint 3: React Frontend & Dashboard Integration",
                "duration_weeks": 2,
                "key_deliverables": ["Implement UI component hierarchy", "Connect authentication flows", "Build interactive dashboard components"],
                "milestone": "End-to-End User Flow"
            },
            {
                "sprint_number": 4,
                "sprint_title": "Sprint 4: Advanced Features & Business Logic",
                "duration_weeks": 2,
                "key_deliverables": [f"Implement features: {input_data.required_features}", "Add background task queues", "Setup automated alert webhooks"],
                "milestone": "Feature Complete MVP"
            },
            {
                "sprint_number": 5,
                "sprint_title": "Sprint 5: Security Hardening & Performance Optimization",
                "duration_weeks": 2,
                "key_deliverables": ["Perform OWASP security audit", "Optimize slow database queries", "Configure rate limiting & CloudWatch alarms"],
                "milestone": "Production Readiness Passed"
            },
            {
                "sprint_number": 6,
                "sprint_title": "Sprint 6: Final QA & Production Go-Live",
                "duration_weeks": 2,
                "key_deliverables": ["Execute load testing under peak traffic", "Configure domain DNS & SSL certificates", "Deploy to production multi-region cluster"],
                "milestone": "Production Launch (GA)"
            }
        ],
        "risk_analysis": [
            {
                "category": "Technical",
                "risk_title": "Database Query Bottlenecks under Peak Load",
                "description": "Unoptimized relational joins during traffic bursts may cause query timeouts.",
                "severity": "High",
                "impact": "Increased user latency and potential HTTP 504 gateway timeouts.",
                "mitigation_strategy": "Implement database indexing on foreign keys, read replicas for heavy queries, and Redis response caching."
            },
            {
                "category": "Operational",
                "risk_title": "Team Velocity Constraints & Scope Creep",
                "description": f"Team size ({input_data.team_size}) could be strained by expanding feature requirements.",
                "severity": "Medium",
                "impact": "Potential deadline slips beyond planned timeline.",
                "mitigation_strategy": "Enforce strict Agile sprint backlogs, prioritize MVP features, and utilize automated CI/CD testing."
            },
            {
                "category": "Security",
                "risk_title": "Credential Exposure & API Rate Limit Vulnerabilities",
                "description": "Publicly facing REST APIs targeted by automated credential stuffing attacks.",
                "severity": "High",
                "impact": "Unauthorized access or denial of service.",
                "mitigation_strategy": "Deploy Web Application Firewall (WAF), enforce JWT token expiration, and configure token bucket rate limiting at API Gateway."
            },
            {
                "category": "Financial",
                "risk_title": "Unforeseen Cloud Bandwidth or Database Storage Expenses",
                "description": "Scaling compute instances dynamically could push monthly costs beyond target budget.",
                "severity": "Medium",
                "impact": "Cloud expenditure exceeding monthly allocated budget.",
                "mitigation_strategy": "Set hard limits on auto-scaling group capacity and enable automated cloud billing alert thresholds at 80% of budget."
            }
        ]
    }

def answer_architecture_question(request: ChatRequest) -> str:
    """
    Answers follow-up interactive questions regarding the generated architecture.
    """
    api_key = request.custom_gemini_key or GEMINI_API_KEY
    if api_key and api_key.strip():
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
            You are an AI Solution Architect answering a user question about their project architecture blueprint.

            CONTEXT ARCHITECTURE:
            Project: {request.architecture_context.get('project_name')}
            Recommended Pattern: {request.architecture_context.get('recommended_pattern')}
            Executive Summary: {request.architecture_context.get('executive_summary')}

            USER QUESTION:
            {request.user_query}

            Provide a clear, concise, highly professional architectural answer with technical depth and practical advice.
            """
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.warning(f"Gemini chat failed: {e}")

    # Fallback response engine
    query = request.user_query.lower()
    proj = request.architecture_context.get('project_name', 'your project')
    pattern = request.architecture_context.get('recommended_pattern', 'the recommended architecture')
    
    if "cost" in query or "reduce" in query or "cheaper" in query:
        return f"To optimize infrastructure costs for {proj}:\n1. **Compute**: Utilize AWS Fargate Spot instances or GCP Cloud Run for non-critical workloads (up to 70% savings).\n2. **Database**: Use single-AZ RDS for dev/staging and auto-pause Aurora instances when idle.\n3. **Caching**: Maximize Redis TTL for static query responses to reduce DB read ops."
    elif "security" in query or "auth" in query or "token" in query:
        return f"Regarding security in {pattern}:\n1. Enforce short-lived JWT tokens (15-30 min) combined with secure HTTP-only refresh cookies.\n2. Store secrets in AWS Secrets Manager or HashiCorp Vault.\n3. Enforce strict CORS policies and TLS 1.3 encryption across all internal microservice calls."
    elif "scale" in query or "traffic" in query or "performance" in query:
        return f"To handle traffic surges for {proj}:\n1. Configure Horizontal Pod Autoscaling (HPA) or ECS Auto Scaling based on CPU/Memory thresholds.\n2. Put CloudFront CDN in front of dynamic endpoints to cache static and semi-static JSON payloads.\n3. Implement a message queue (RabbitMQ/Kafka) to buffer bursty traffic."
    else:
        return f"Based on the recommended blueprint for **{proj}** ({pattern}), we prioritize modularity and clean separation of concerns. You can easily extend backend microservices using FastAPI, maintain high data integrity in PostgreSQL, and decouple frontend UI rendering for maximum velocity."
