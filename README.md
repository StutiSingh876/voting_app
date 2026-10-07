# Full-Stack Voting & Polling Application

A production-minded, containerized web application built with **React**, **FastAPI**, **PostgreSQL**, **Prometheus**, and **Grafana**. Designed with clear architectural boundaries, single-vote integrity, stateless JWT authentication, automated database migrations, health/readiness/liveness probes, and full RED observability metrics.

---

## Architecture Diagram

```
                                +-----------------------+
                                |  Browser / React SPA  |
                                |      (Vite + Nginx)   |
                                +-----------+-----------+
                                            |
                                  HTTP / REST (JSON + Bearer)
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| Docker Compose Environment                                                            |
|                                                                                       |
|  +--------------------+          +---------------------+        +------------------+  |
|  |   FastAPI Backend  |--------->| PostgreSQL Database |        |    Prometheus    |  |
|  |  (Port 8000)       |   SQL    | (Port 5432)         |        |   (Port 9090)    |  |
|  |  - Auth & JWT       |          | - users             |        |  - Scrapes       |  |
|  |  - SQLAlchemy      |          | - polls             |        |    /metrics      |  |
|  |  - Pydantic        |          | - poll_options      |        +--------+---------+  |
|  |  - Instrumentator  |          | - votes (Unique)    |                 |            |
|  +--------------------+          +---------------------+                 v            |
|                                                                 +------------------+  |
|                                                                 |     Grafana      |  |
|                                                                 |   (Port 3000)    |  |
|                                                                 |  - Preprovisioned|  |
|                                                                 +------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## Key Features

- **Authentication & Authorization**: Stateless JWT token authentication with bcrypt password hashing.
- **Poll Creation & Options**: Dynamic poll creation with custom options and ownership attribution.
- **Vote Integrity**: Guaranteed single vote per user per poll enforced at both the API level and database level via composite `UniqueConstraint("user_id", "poll_id")`.
- **Live Poll Results**: Aggregated vote tallies computed cleanly per poll choice.
- **Health & Readiness Probes**: Kubernetes-style probe endpoints (`/health/livez`, `/health/readyz`, `/health/startupz`).
- **Container Orchestration**: Multi-container setup with Docker Compose, postgres healthchecks, and automatic Alembic migrations on startup.
- **Observability Stack**: Prometheus scraping custom counters (`users_registered_total`, `polls_created_total`, `votes_cast_total`) and pre-provisioned Grafana dashboard.

---

## Tech Stack

- **Frontend**: React 19, Vite, HTML5/CSS3, Nginx
- **Backend**: Python 3.12, FastAPI, Pydantic V2, PyJWT / Python-Jose, Bcrypt
- **Database & ORM**: PostgreSQL 16, SQLAlchemy 2.0, Alembic (migrations)
- **Containerization**: Docker, Docker Compose
- **Monitoring & Metrics**: Prometheus, Grafana, `prometheus-fastapi-instrumentator`
- **Testing**: Pytest, HTTPX, SQLite in-memory engine

---

## Project Structure

```
VOTING-APP/
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── core/             # Auth, config, security, metrics, health
│   │   ├── db/               # Database connection and session dependencies
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── routes/           # FastAPI route handlers (auth, polls, users, health)
│   │   ├── schemas/          # Pydantic request/response validation schemas
│   │   └── main.py           # FastAPI application entrypoint
│   ├── tests/                # Automated Pytest suite
│   ├── Dockerfile            # Container build for backend
│   ├── entrypoint.sh         # Migration execution and server startup script
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/                  # React components, pages, and API client
│   ├── nginx.conf            # Nginx production web server configuration
│   ├── Dockerfile            # Multi-stage container build for frontend
│   └── package.json          # React dependencies & scripts
├── docker/
│   └── prometheus/           # Prometheus scraper & Grafana provisioning configs
├── docker-compose.yml        # Multi-service container orchestration
└── README.md
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://voting_user:voting_password@postgres:5432/voting_db` |
| `SECRET_KEY` | JWT signing secret key | `dev_secret_key_voting_app_change_in_production_987654321` |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration duration | `60` |
| `CORS_ORIGINS` | Allowed cross-origin domains | `http://localhost:5173,http://127.0.0.1:5173` |

---

## Quickstart with Docker Compose

1. **Clone & start the stack**:
   ```bash
   docker compose up --build
   ```
2. **Access services**:
   - **Frontend App**: `http://localhost:5173`
   - **FastAPI Swagger Docs**: `http://localhost:8000/docs`
   - **Prometheus Metrics Target**: `http://localhost:9090`
   - **Grafana Dashboard**: `http://localhost:3000` (Login: `admin` / `admin`)

---

## Local Development (Without Docker)

1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Running Automated Tests

Run the backend Pytest suite (uses SQLite in-memory DB for rapid test execution):

```bash
cd backend
pytest -v
```

---

## API Summary

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and obtain JWT token
- `GET /users/me` - Fetch authenticated user profile
- `GET /polls` - List all polls with options
- `POST /polls` - Create a new poll with choices (Authenticated)
- `GET /polls/{id}` - Fetch single poll details
- `POST /polls/{id}/vote` - Cast a vote for a poll option (Authenticated, single vote per user)
- `GET /polls/{id}/results` - Aggregate live poll results
- `GET /health/livez` - Liveness probe
- `GET /health/readyz` - Readiness probe (checks DB health)
- `GET /metrics` - Prometheus metrics feed

---

## Monitoring & Observability

- **Prometheus**: Automatically scrapes backend `/metrics` every 5s.
- **Grafana**: Pre-loaded with datasource and the **Voting Application Overview** dashboard showing real-time stats for registered users, created polls, and votes cast.
