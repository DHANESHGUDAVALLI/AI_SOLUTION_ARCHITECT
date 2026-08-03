import urllib.request
import json

BASE_URL = "http://localhost:8000/api"

def test_full_application():
    print("1. Testing Health Endpoint...")
    req = urllib.request.urlopen(f"{BASE_URL}/health")
    health = json.loads(req.read().decode())
    print("Health Status:", health)
    assert health["status"] == "online"

    print("\n2. Testing User Registration...")
    reg_data = json.dumps({
        "username": "Enterprise Architect",
        "email": "test_architect@calibo.ai",
        "password": "SecurePassword2026!"
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(f"{BASE_URL}/auth/register", data=reg_data, headers={'Content-Type': 'application/json'})
        res = urllib.request.urlopen(req)
        auth_res = json.loads(res.read().decode())
        print("Registered Successfully. User ID:", auth_res['user']['id'])
        token = auth_res['access_token']
    except Exception as e:
        print("User might exist, trying login...")
        login_data = json.dumps({
            "email": "test_architect@calibo.ai",
            "password": "SecurePassword2026!"
        }).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, headers={'Content-Type': 'application/json'})
        res = urllib.request.urlopen(req)
        auth_res = json.loads(res.read().decode())
        print("Logged in successfully.")
        token = auth_res['access_token']

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {token}"
    }

    print("\n3. Testing AI Architecture Recommendation Engine...")
    proj_input = json.dumps({
        "project_name": "Calibo Pay Ledger",
        "domain": "FinTech & Payments",
        "description": "High-frequency payment processing ledger with fraud detection and multi-currency support.",
        "expected_users": "500,000 DAU",
        "team_size": "5 Senior Engineers",
        "budget": "$10,000 / month",
        "deadline": "6 Months",
        "required_features": "Real-time LEDGER, Webhooks, Fraud Analytics, PCI-DSS",
        "compliance_needs": "PCI-DSS Level 1, SOC2",
        "preferred_cloud": "AWS Fargate + Aurora PostgreSQL"
    }).encode('utf-8')

    req = urllib.request.Request(f"{BASE_URL}/architect/recommend", data=proj_input, headers=headers)
    res = urllib.request.urlopen(req)
    eval_res = json.loads(res.read().decode())
    
    print("Recommended Pattern:", eval_res.get("recommended_pattern"))
    print("Tech Stack items count:", len(eval_res.get("tech_stack", [])))
    print("Estimated Monthly Cost:", eval_res.get("cost_estimation", {}).get("total_monthly"))
    print("Sprint count:", len(eval_res.get("sprint_plan", [])))
    print("Risk items count:", len(eval_res.get("risk_analysis", [])))

    print("\n4. Testing Architecture History Retrieval...")
    req = urllib.request.Request(f"{BASE_URL}/projects/history", headers=headers)
    res = urllib.request.urlopen(req)
    history = json.loads(res.read().decode())
    print(f"Retrieved {len(history)} saved projects from SQLite database.")

    print("\n5. Testing AI Architect Interactive Chat Assistant...")
    chat_input = json.dumps({
        "architecture_context": eval_res,
        "user_query": "How can we optimize PostgreSQL database costs during low traffic hours?"
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/architect/chat", data=chat_input, headers=headers)
    res = urllib.request.urlopen(req)
    chat_res = json.loads(res.read().decode())
    print("AI Architect Answer:", chat_res.get("answer")[:180] + "...")

    print("\n6. Testing PDF Report Export Engine...")
    req = urllib.request.Request(f"{BASE_URL}/pdf/export", data=json.dumps(eval_res).encode('utf-8'), headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    pdf_bytes = res.read()
    print(f"Generated PDF Report successfully! Length: {len(pdf_bytes)} bytes.")

    print("\n[SUCCESS] ALL BACKEND & AI SOLUTION ARCHITECT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_application()
