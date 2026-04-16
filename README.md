# 🎨 Drawing App – DevOps Microservices Project

## 📌 Overview

This project is a web-based drawing application that allows users to:

* Draw on a canvas in the browser
* Save drawings to a database
* Load previously saved drawings
* Delete drawings

The primary goal is to demonstrate a **complete DevOps lifecycle**, including:

* Containerization with Docker
* Orchestration with Kubernetes
* CI/CD automation
* GitOps deployment
* Observability and alerting
* Infrastructure as Code (IaC)

---

## 🧠 Problem Statement

The application itself is intentionally simple.
The focus of the project is to showcase how modern cloud-native systems are:

* Built and tested
* Packaged into containers
* Deployed via GitOps
* Monitored in real time
* Observed and debugged

---

## 🏗️ Architecture

The system follows a **microservices architecture**:

* **Frontend (React + Nginx)** – UI and drawing logic
* **Backend (FastAPI)** – REST API and business logic
* **Database (PostgreSQL)** – persistent storage

Supporting infrastructure:

* **Prometheus + Grafana** – metrics collection and visualization
* **Alertmanager** – alert routing
* **Argo CD** – GitOps-based deployment
* **GitHub Actions** – CI/CD pipelines
* **Terraform** – infrastructure provisioning

---

## 📊 Architecture Diagram

See: `docs/architecture.mmd`
(Optional exported version: `docs/architecture.png`)

---

## 🧩 Technologies Used

| Layer                   | Technology                        | Version        |
| ----------------------- | --------------------------------- | -------------- |
| Frontend framework      | React                             | 18.3.1         |
| Frontend rendering      | React DOM                         | 18.3.1         |
| Frontend build tool     | Vite                              | 5.4.21         |
| Frontend Vite plugin    | @vitejs/plugin-react              | 4.3.1          |
| Frontend web server     | Nginx                             | 1.27.5         |
| Backend framework       | FastAPI                           | 0.111.0        |
| ASGI server             | Uvicorn                           | 0.30.1         |
| ORM                     | SQLAlchemy                        | 2.0.30         |
| Data validation         | Pydantic                          | 2.7.4          |
| PostgreSQL driver       | psycopg2-binary                   | 2.9.9          |
| Testing                 | pytest                            | 8.3.3          |
| HTTP client             | httpx                             | 0.27.2         |
| Metrics instrumentation | prometheus-fastapi-instrumentator | 7.0.0          |
| Database                | PostgreSQL                        | 16.11          |
| Container runtime       | Docker                            | 29.4.0         |
| Local Kubernetes        | Minikube                          | 1.37.0         |
| Orchestration           | Kubernetes                        | v1.34.0        |
| GitOps CD               | Argo CD                           | v2.12.6        |
| Argo CD Helm chart      | argo-cd                           | 7.6.12         |
| Monitoring stack        | kube-prometheus-stack             | 66.2.1         |
| Metric scraping         | Prometheus                        | v2.55.1        |
| Grafana                 | via kube-prometheus-stack         |                |
| IaC                     | Terraform                         | 1.14.8         |
| CI/CD                   | GitHub Actions                    | hosted runners |
| Code quality            | pre-commit                        | local          |
| Secret scanning         | detect-secrets                    | local          |

---

## 📁 Project Structure

```
drawing-app/
├── backend/
├── frontend/
├── k8s/
├── terraform/
├── .github/workflows/
├── docs/
└── README.md
```

---

## ⚙️ Running the Project

### Start cluster

```bash
minikube start --driver=docker
```

### Deploy application

```bash
kubectl apply -k k8s/overlays/prod
```

### Access frontend

```bash
minikube service frontend -n drawing --url
```

---

## 🐳 Docker Images

* `sova11/drawing-app-backend:<tag>`
* `sova11/drawing-app-frontend:<tag>`

---

## 🔁 CI/CD Pipeline

### CI (GitHub Actions)

* Runs pre-commit checks
* Executes backend tests (pytest)
* Builds frontend
* Builds Docker images
* Pushes images to Docker Hub
* Sends webhook notifications to Slack

### CD (GitOps with Argo CD)

* CI updates image tags in manifests
* Argo CD continuously monitors the repository
* Changes are automatically applied to the cluster

---

## 🔐 Secrets Management

### GitHub Secrets

* Docker Hub credentials
* Slack webhook

### Kubernetes

* Secret → PostgreSQL password
* ConfigMap → application configuration

---

## 📈 Observability

### Metrics

* Backend exposes `/metrics`
* Prometheus scrapes metrics
* Grafana visualizes dashboards

### Logs

```bash
kubectl logs -n drawing deploy/backend
```

### Alerts

* Prometheus rules detect failures
* Alertmanager is deployed for alert routing

⚠️ Note:
Some Kubernetes control-plane alerts may fire in Minikube due to missing metrics endpoints.
This is expected in local environments and does not indicate application failure.

---

## 🧪 Pre-commit Hooks

Checks executed before each commit:

* Code formatting
* YAML/JSON validation
* Secret detection
* Trailing whitespace removal

Setup:

```bash
pip install pre-commit detect-secrets
pre-commit install
```

---

## 🏗️ Infrastructure as Code

Provisioned with Terraform:

* Argo CD
* Monitoring stack
* Alerting components

```bash
cd terraform
terraform init
terraform apply
```

---

## 🚀 Summary

This project demonstrates a full modern DevOps workflow:

Development → CI → Docker → Kubernetes → GitOps → Monitoring → Alerting

using industry-standard tools and practices.
