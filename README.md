# Todo App Microservices


This project is a microservices-based Todo application with a Go (Gin) backend and a React frontend. The database will be a separate service, to be integrated later. The app is fully Dockerized for easy local development and deployment.



## Project Structure

- `todo-service/` — Go backend service (Gin, REST API, CORS enabled)
- `frontend/` — React frontend (uses environment variable for API URL)
- `db-service/` — (To be added) Database service

---

## Architecture & Flow

### Overview
This project is a Todo application built using a microservices architecture. The backend is implemented in Go using the Gin web framework for routing. The frontend is built with React. The database will be a separate service, which will be integrated later.

#### Microservices Breakdown

1. **Todo Service (Go + Gin):**
   - Handles all Todo CRUD operations (Create, Read, Update, Delete).
   - Exposes RESTful APIs.
   - Stateless; will connect to a database service in the future.
   - CORS enabled for frontend integration.

2. **Frontend Service (React):**
   - User interface for managing todos.
   - Communicates with the Todo Service via HTTP APIs.
   - Uses environment variable `REACT_APP_API_URL` for backend connectivity.

3. **Database Service (To be added):**
   - Will be a separate service (e.g., PostgreSQL, MongoDB, etc.).
   - Todo Service will interact with this service for data persistence.

#### Flow Diagram

```
[React Frontend] <----HTTP----> [Go Gin Todo Service] <----DB Protocol----> [Database Service]
```

---

## API Endpoints

### Auth
- `POST /register` — Register a new user
- `POST /login` — Login and create a session
- `POST /logout` — Logout and clear session
- `GET /me` — Get current user info (requires session)

### Todos
- `GET /todos` — List all todos for the user
- `POST /todos` — Create a new todo
- `GET /todos/id/:id` — Get a todo by ID
- `PUT /todos/id/:id` — Update a todo by ID
- `DELETE /todos/id/:id` — Delete a todo by ID

### Tasks (per Todo)
- `GET /todos/:todoId/tasks` — List all tasks for a todo
- `POST /todos/:todoId/tasks` — Create a new task in a todo
- `GET /todos/:todoId/tasks/:id` — Get a task by ID
- `PUT /todos/:todoId/tasks/:id` — Update a task by ID
- `DELETE /todos/:todoId/tasks/:id` — Delete a task by ID

---

## CORS & Networking

- The Go backend uses a CORS middleware to allow requests from the frontend (http://localhost:3000) and supports credentials (cookies).
- When running in Docker, the frontend uses the service name (`http://todo-service:8080`) to reach the backend.
- When running locally, the frontend uses `http://localhost:8080`.
- The React frontend reads the backend URL from the `REACT_APP_API_URL` environment variable (set in `.env` for local dev, or via Docker Compose for containers).

---

## Environment Variables

### Frontend
- `REACT_APP_API_URL` — The base URL for the backend API. Example: `http://localhost:8080` (local), `http://todo-service:8080` (Docker)

### Backend
- `PORT` — The port the Go backend listens on (default: 8080)

---

## Running the App

### Local Development (without Docker)
1. **Clone the repository**
2. **Backend:**
   - `cd todo-service`
   - `go mod tidy` (if needed)
   - `go run .`
3. **Frontend:**
   - `cd frontend`
   - `npm install`
   - Create a `.env` file with `REACT_APP_API_URL=http://localhost:8080`
   - `npm start`

### Dockerized Development
1. **Clone the repository**
2. **Build and start all services:**
   - `docker-compose up --build`
3. The React frontend will be available at `http://localhost:3000` and will connect to the Go backend at `http://localhost:8080` (via Docker network).

---

## Usage
- Access the React frontend at `http://localhost:3000`
- The frontend communicates with the Go backend at `http://localhost:8080` (local) or `http://todo-service:8080` (inside Docker)

---

## Example .env for Frontend

```
REACT_APP_API_URL=http://localhost:8080
```

---

## Development Notes

- All Go code is in the `main` package for simplicity.
- The backend uses SQLite for local storage (file: `todos.db`).
- All API endpoints require authentication except `/register` and `/login`.
- CORS is enabled for local frontend-backend development.
- The database service will be added in the next phase for production-ready persistence.

---

## Getting Started


### Prerequisites
- Go (1.18+)
- Node.js & npm (for React)
- Docker & Docker Compose (for containerized development)


### Setup

#### Local Development (without Docker)
1. **Clone the repository**
2. **Backend:**
   - `cd todo-service`
   - `go mod tidy` (if needed)
   - `go run .`
3. **Frontend:**
   - `cd frontend`
   - `npm install`
   - Create a `.env` file with `REACT_APP_API_URL=http://localhost:8080`
   - `npm start`

#### Dockerized Development
1. **Clone the repository**
2. **Build and start all services:**
   - `docker-compose up --build`
3. The React frontend will be available at `http://localhost:3000` and will connect to the Go backend at `http://localhost:8080` (via Docker network).


### Usage
- Access the React frontend at `http://localhost:3000`
- The frontend communicates with the Go backend at `http://localhost:8080` (local) or `http://todo-service:8080` (inside Docker)


## Microservices
- Each service runs independently and communicates via HTTP APIs.
- The backend supports CORS for frontend integration.
- The database service will be added and integrated in the next phase.
