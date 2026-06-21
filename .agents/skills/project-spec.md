# Project Specification: Collaborative Kanban Microservices App

## 1. Project Overview

Build a full-stack Kanban dashboard application using a microservices architecture.

The application allows users to register, log in, and manage their own tasks on a Kanban board. The board has three columns: **To-Do**, **In Progress**, and **Done**.

The system must include:

* React.js frontend
* Auth Microservice
* Task Microservice
* PostgreSQL for user authentication data
* MongoDB for task data
* JWT-based authentication
* Drag-and-drop task movement
* Dockerized local development environment

---

## 2. Core Features

### 2.1 User Authentication

Users must be able to:

* Register with email and password
* Log in with email and password
* Receive a JWT token after successful login
* Stay authenticated while using the dashboard
* Log out

The frontend must store the JWT token and send it in the `Authorization` header when calling the Task Service.

Example header:

```http
Authorization: Bearer <token>
```

---

## 3. Frontend Requirements

### 3.1 Login Page

The login page must include:

* Email input
* Password input
* Login button
* Link to register page
* Error message display

### 3.2 Register Page

The register page must include:

* Email input
* Password input
* Confirm password input
* Register button
* Link to login page
* Error message display

### 3.3 Dashboard Page

After logging in, the user must see a Kanban dashboard.

The dashboard must include:

* Header
* Board title: `Team Workspace`
* Logout button
* Create New Board button
* Three Kanban columns:

  * To-Do
  * In Progress
  * Done

The `Create New Board` button is only required as a UI element for this version. It does not need to create real boards yet.

---

## 4. Kanban Board Requirements

### 4.1 Columns

The board must have three static columns:

| Column Name | Status Value  |
| ----------- | ------------- |
| To-Do       | `todo`        |
| In Progress | `in-progress` |
| Done        | `done`        |

Tasks must be displayed in the correct column based on their `status` value.

### 4.2 Task Card

Each task card must display:

* Task title
* Task description
* Task status
* Delete button

### 4.3 Create Task

Users must be able to create a new task from the To-Do column.

Required fields:

* Title
* Description

New tasks must use this default status:

```txt
todo
```

After creating a task, it must appear in the To-Do column.

### 4.4 Read Tasks

When the dashboard loads, the frontend must fetch all tasks belonging to the logged-in user.

The fetched tasks must be sorted into the correct columns based on their status.

### 4.5 Update Task Status

Users must be able to drag and drop task cards between all three columns:

* To-Do
* In Progress
* Done

When a task is moved to another column:

* The frontend updates the task position/status
* The Task Service receives a `PATCH` or `PUT` request
* The task status is updated in MongoDB

Example request:

```http
PATCH /tasks/:id/status
```

Example body:

```json
{
  "status": "in-progress"
}
```

### 4.6 Delete Task

Each task card must have a Delete button.

When clicked:

* The task is deleted through the Task Service
* The task is removed from MongoDB
* The task disappears from the dashboard

---

## 5. Auth Microservice Requirements

The Auth Microservice handles registration and login.

### 5.1 Responsibilities

The Auth Service must:

* Register users
* Log in users
* Hash passwords
* Generate JWT tokens
* Store user data in PostgreSQL

### 5.2 User Data

Users must be stored in PostgreSQL.

User fields:

```txt
id
email
password
created_at
updated_at
```

The password must be hashed before being saved.

### 5.3 Register Endpoint

```http
POST /auth/register
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Expected behavior:

* Validate email and password
* Check if email already exists
* Hash password
* Save user to PostgreSQL

### 5.4 Login Endpoint

```http
POST /auth/login
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Expected behavior:

* Validate email and password
* Compare password with hashed password
* Return JWT token if login succeeds

Success response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

---

## 6. Task Microservice Requirements

The Task Microservice handles task data.

### 6.1 Responsibilities

The Task Service must:

* Validate JWT tokens
* Create tasks
* Fetch tasks for the logged-in user
* Update task status
* Delete tasks
* Store task data in MongoDB

### 6.2 Task Data

Tasks must be stored in MongoDB.

Task fields:

```txt
_id
userId
title
description
status
createdAt
updatedAt
```

Allowed status values:

```txt
todo
in-progress
done
```

### 6.3 Authentication

All Task Service endpoints must require a valid JWT token.

The Task Service must read the token from:

```http
Authorization: Bearer <token>
```

Users must only be able to access their own tasks.

### 6.4 Create Task Endpoint

```http
POST /tasks
```

Request body:

```json
{
  "title": "Create login page",
  "description": "Build login form with email and password"
}
```

Default status:

```txt
todo
```

### 6.5 Get Tasks Endpoint

```http
GET /tasks
```

Expected behavior:

* Return only tasks owned by the logged-in user
* Return tasks from MongoDB

### 6.6 Update Task Status Endpoint

```http
PATCH /tasks/:id/status
```

Request body:

```json
{
  "status": "done"
}
```

Expected behavior:

* Validate status value
* Check that the task belongs to the logged-in user
* Update task status in MongoDB

### 6.7 Delete Task Endpoint

```http
DELETE /tasks/:id
```

Expected behavior:

* Check that the task belongs to the logged-in user
* Delete task from MongoDB

---

## 7. Data Layer Requirements

### 7.1 PostgreSQL

PostgreSQL is used only by the Auth Service.

It stores:

* User email
* Hashed password
* User metadata

### 7.2 MongoDB

MongoDB is used only by the Task Service.

It stores:

* Task title
* Task description
* Task status
* Task owner user ID
* Task timestamps

---

## 8. UI Requirements

The frontend UI should be clean, modern, and visually polished.

The dashboard should include:

* Beautiful Kanban layout
* Responsive design
* Card-based task UI
* Smooth drag-and-drop experience
* Clear column separation
* Good spacing and hover effects
* Loading and error states

Desktop layout:

```txt
+------------------------------------------------+
| Team Workspace                    Logout       |
+------------------------------------------------+

+-------------+-------------+-------------+
| To-Do       | In Progress | Done        |
|             |             |             |
| Task Card   | Task Card   | Task Card   |
| Task Card   |             |             |
| + Add Task  |             |             |
+-------------+-------------+-------------+
```

Mobile layout:

* Columns should stack vertically
* Task cards should remain readable
* Buttons and forms should be easy to use

---

## 10. Environment Variables

### Frontend

```env
VITE_AUTH_API_URL=http://localhost:4000
VITE_TASK_API_URL=http://localhost:5000
```

### Auth Service

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auth_db
JWT_SECRET=your_secret_key
```

### Task Service

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/tasks_db
JWT_SECRET=your_secret_key
```

The same `JWT_SECRET` must be used by the Auth Service and Task Service in local development.

---

## 11. Acceptance Criteria

The project is complete when:

* User can register
* User can log in
* Auth Service saves users in PostgreSQL
* Passwords are hashed
* Auth Service returns a JWT token
* Frontend stores the JWT token
* Frontend sends the JWT token to the Task Service
* Task Service validates JWT tokens
* Dashboard displays `Team Workspace`
* Dashboard has To-Do, In Progress, and Done columns
* User can create tasks
* User can view their own tasks
* User can drag tasks between columns
* Dragging a task updates its status in MongoDB
* User can delete tasks
* Task data is stored in MongoDB
* The UI is beautiful and responsive
* The full app runs with Docker Compose
