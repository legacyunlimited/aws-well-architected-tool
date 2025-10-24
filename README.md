# AWS Well-Architected Assessment Tool 

A lightweight, serverless web app that walks clients through the **AWS Well-Architected Framework** and stores their responses for instant review and PDF export.

This project showcases how to design, deploy, and deliver client-facing AWS tools that demonstrate **real-world architecture, automation, and consulting value**.

---

##  Live Architecture Overview

| Layer | Service | Purpose |
|-------|----------|----------|
| **Frontend** | React (Create React App) | Dynamic question UI + PDF export |
| **API Gateway** | REST API | Routes `/submit` requests securely |
| **Lambda (Node.js 18)** | `submitAnswers` | Validates + writes answers to DynamoDB |
| **DynamoDB** | `AssessmentResponses` | Stores client assessment results |
| **S3 (optional)** | Static hosting for frontend | Deploy React app easily with CloudFront CDN |
| **jsPDF** | Browser-side library | Generates client-ready assessment PDF |

---

## 🧩 Key Features

✅ 12 curated questions across all **6 AWS Well-Architected pillars**  
✅ Serverless backend with **Lambda + DynamoDB + API Gateway**  
✅ Real-time client storage via AWS SDK  
✅ Instant **PDF summary report** generator  
✅ CORS-enabled secure API  
✅ Designed for **consultants and solution architects**

---

## ⚙️ How It Works

1. Users answer 12 questions (2 per AWS pillar).  
2. Answers are sent to API Gateway → AWS Lambda → DynamoDB.  
3. After submission, a summary dashboard displays “Yes / No / Partially” counts.  
4. Clients can **download a professional PDF** report instantly.  

---

## Run Locally

 1️⃣ Frontend

```bash
cd frontend
npm install
npm start

Access at http://localhost:3000.

2️⃣ Backend (Lambda)

Folder: backend/lambda/

Deploy function manually via AWS CLI:

zip -r submitAnswers.zip submitAnswers.js
aws lambda update-function-code \
  --function-name SubmitAssessmentAnswers \
  --zip-file fileb://submitAnswers.zip

📊 Example Output (DynamoDB)
{
  "assessmentId": "client@example.com",
  "timestamp": "2025-10-24T10:39:14Z",
  "responses": {
    "Reliability": "Yes",
    "Security": "Partially",
    "CostOptimization": "Yes"
  }
}

What I Learned

Designing event-driven serverless architectures

Implementing secure API Gateway → Lambda → DynamoDB integrations

Handling CORS, structured data flow, and JSON parsing

Building React apps with API integrations and PDF reporting

The power of automation for client-facing AWS consulting tools


Future Enhancements

Add authentication (Cognito or IAM Identity Center)

Integrate AI-powered recommendations per pillar

Deploy full CI/CD with AWS Amplify or CDK

Add a client dashboard for tracking historical assessments

👤 Author

Kendall Boone
AWS Cloud Architect • Consultant • Builder

