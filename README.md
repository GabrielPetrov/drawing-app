# Drawing App – DevOps Microservices Project

## 📌 Overview

This project is a web-based drawing application that allows users to:
- Draw on a canvas in the browser
- Save drawings to a database
- Load previously saved drawings
- Delete drawings

The main goal of the project is to demonstrate a **complete DevOps workflow**, including:
- Containerization with Docker
- Orchestration with Kubernetes
- CI/CD automation
- GitOps deployment
- Observability and alerting
- Infrastructure as Code (IaC)

---

## 🧠 Problem it Solves

The application provides a simple platform for creating and storing drawings, while the infrastructure demonstrates how modern cloud-native systems are designed, deployed, and monitored.

---

## 🏗️ Architecture

The system follows a **microservices architecture**:

- **Frontend (React + Nginx)** – UI and drawing logic
- **Backend (FastAPI)** – REST API and business logic
- **Database (PostgreSQL)** – persistent storage

Additionally:
- **Prometheus + Grafana** – metrics and visualization
- **Alertmanager** – alerting via webhooks
- **Argo CD** – GitOps-based deployment
- **GitHub Actions** – CI/CD automation
- **Terraform** – infrastructure provisioning

---

## 📊 Architecture Diagram

See: `docs/architecture.mmd`
(Exported image can be placed in `docs/architecture.png`)

---

## 🧩 Technologies Used

| Component | Technology |
|----------|------------|
| Frontend | React 18, Vite, Nginx |
| Backend | FastAPI, SQLAlchemy |
| Database | PostgreSQL 16 |
| Containers | Docker |
| Orchestration | Kubernetes (Minikube) |
| CI/CD | GitHub Actions |
| GitOps CD | Argo CD |
| IaC | Terraform |
| Observability | Prometheus, Grafana |
| Alerting | Alertmanager + Slack Webhook |
| Code Quality | pre-commit, detect-secrets, black |

---

## 📁 Project Structure
drawing-app/
├── backend/ # FastAPI backend
├── frontend/ # React frontend + Nginx
├── k8s/ # Kubernetes manifests (base + overlays)
├── terraform/ # Infrastructure as Code
├── .github/workflows/ # CI/CD pipelines
├── docs/ # Architecture diagrams
└── README.md

---

## ⚙️ How to Run the Project

### Start cluster

minikube start --driver=docker

### Deploy

kubectl apply -k k8s/overlays/prod

### Access app

minikube service frontend -n drawing --url

------------------------------------------------------------------------

## 🐳 Docker Images

sova11/drawing-app-backend:`<tag>`{=html}
sova11/drawing-app-frontend:`<tag>`{=html}

------------------------------------------------------------------------

## 🔁 CI/CD

CI (GitHub Actions)
   - Runs pre-commit checks
   - Executes backend tests (pytest)
   - Builds frontend
   - Builds Docker images
   - Pushes images to Docker Hub
   - Sends webhook notifications
CD (GitOps via Argo CD)
   - CI updates image tag in Kubernetes manifests
   - Argo CD detects change in Git
   - Automatically deploys new version to cluster

------------------------------------------------------------------------

## 🔐 Secrets Management

GitHub Secrets
-   Docker Hub credentials
-   Slack webhook
Kubernetes Secrets
-   PostgreSQL password
ConfigMap
-   Non-sensitive environment variables

------------------------------------------------------------------------

## 📈 Observability

Metrics:
-    Backend exposes /metrics
-    Prometheus collects metrics
-    Grafana visualizes them

Logs:
-   All services log to stdout
-   Accessible via:
    -    kubectl logs -n drawing deploy/backend

Alerts:
-    Prometheus rules detect failures
-    Alertmanager sends notifications via webhook (Slack)

------------------------------------------------------------------------

## 🧪 Pre-commit Hooks

Before each commit:
-    Code formatting
-    YAML/JSON validation
-    Secret detection
-    Trailing whitespace removal

Setup:
    pip install pre-commit detect-secrets
    pre-commit install

------------------------------------------------------------------------

## 🏗️ IaC

Terraform provisions:
-    Namespaces
-    Argo CD
-    Monitoring stack (Prometheus, Grafana)
-    Alertmanager configuration

Run:
    cd terraform
    terraform init
    terraform apply

------------------------------------------------------------------------

## 🚀 Summary

This project demonstrates a full modern DevOps lifecycle:
from development and validation to automated deployment and monitoring,
using industry-standard tools and practices.
