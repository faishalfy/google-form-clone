# Google Form Clone - Backend API

A production-ready RESTful API for a Google Form Clone application built with Node.js, Express, and PostgreSQL.

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Example Requests](#-example-requests)
- [Business Constraints](#-business-constraints)
- [Error Handling](#-error-handling)
- [Environment Variables](#-environment-variables)

## ✨ Features

### Level 1 Features
- **User Authentication**: Register, login with JWT tokens
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Form CRUD Operations**: Create, read, update, delete forms
- **Authorization**: JWT middleware to protect routes
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Prevent brute-force attacks
- **Security Headers**: Helmet.js for HTTP headers
- **CORS Support**: Configurable cross-origin requests
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Database**: PostgreSQL with connection pooling
- **Clean Architecture**: MVC pattern with service layer

### Level 2 Features (NEW)
- **Form Filtering & Sorting**: Search by title, filter by status, sort by date
- **Questions CRUD**: Full CRUD operations for questions within forms
- **Question Types**: short_answer, multiple_choice, checkbox, dropdown
- **Response Submission**: Submit form responses with answer validation
- **Answer Validation**: Type-based validation (options matching for choices)
- **Business Constraints**: Protect data integrity when forms have submissions
- **Transactions**: Database transactions for response submission
- **Statistics**: Answer statistics for form analytics

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js            # Database connection and pool
│   ├── controllers/
│   │   ├── authController.js      # Authentication request handlers
│   │   ├── formController.js      # Form CRUD request handlers
│   │   ├── questionController.js  # Question CRUD request handlers (NEW)
│   │   └── responseController.js  # Response submission handlers (NEW)
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT authentication
│   │   ├── errorMiddleware.js     # Global error handler
│   │   └── validationMiddleware.js # Request validation
│   ├── models/
│   │   ├── userModel.js           # User database operations
│   │   ├── formModel.js           # Form database operations
│   │   ├── questionModel.js       # Question database operations (NEW)
│   │   └── responseModel.js       # Response database operations (NEW)
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication routes
│   │   ├── formRoutes.js          # Form routes
│   │   ├── questionRoutes.js      # Question routes (NEW)
│   │   ├── responseRoutes.js      # Response routes (NEW)
│   │   └── index.js               # Route aggregator
│   ├── services/
│   │   ├── authService.js         # Authentication business logic
│   │   ├── formService.js         # Form business logic
│   │   ├── questionService.js     # Question business logic (NEW)
│   │   └── responseService.js     # Response business logic (NEW)
│   ├── utils/
│   │   ├── apiResponse.js         # Standardized API responses
│   │   └── validators.js          # Validation rules
│   └── app.js                     # Express app configuration
├── database/
│   └── schema.sql                 # Database schema (updated)
├── .env                           # Environment variables
├── .env.example                   # Example environment file
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── README.md                      # This file
└── server.js                      # Application entry point
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v13 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## 🚀 Installation

### Step 1: Clone or navigate to the project

```bash
cd backend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values (see Environment Variables section)
```

## 🗄️ Database Setup

### Step 1: Create the database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE google_form_clone;
```

### Step 2: Connect to the database

```bash
psql -U postgres -d google_form_clone
```

Or in psql:
```sql
\c google_form_clone
```

### Step 3: Run the schema

```bash
# From the backend folder
psql -U postgres -d google_form_clone -f database/schema.sql
```

Or copy and paste the contents of `database/schema.sql` into psql/pgAdmin.

### For Existing Databases (Upgrading from Level 1)

The schema includes migration scripts that will:
1. Add the `status` column to forms if it doesn't exist
2. Create the `questions`, `responses`, and `answers` tables
3. Create necessary indexes

## ▶️ Running the Application

### Development mode (with auto-reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

You should see:
```
✅ Database connected successfully
🚀 Server is running on port 5000
📍 Environment: development
🔗 API Base URL: http://localhost:5000/api
```

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Form Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/forms` | Create a new form | Yes |
| GET | `/api/forms` | Get user's forms (with filters) | Yes |
| GET | `/api/forms/public` | Get all published forms | No |
| GET | `/api/forms/:id` | Get form by ID (with questions) | No* |
| PUT | `/api/forms/:id` | Update form | Yes (owner only) |
| DELETE | `/api/forms/:id` | Delete form | Yes (owner only) |

*Unpublished forms can only be viewed by their owner

#### Form List Query Parameters (NEW in Level 2)

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search by title (partial match, case-insensitive) | `?search=feedback` |
| `status` | string | Filter by status: draft, published, closed | `?status=published` |
| `sort` | string | Sort by created_at: asc, desc | `?sort=desc` |
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (1-100, default: 10) | `?limit=20` |

**Example:** `GET /api/forms?search=feedback&status=published&sort=desc`

### Question Endpoints (NEW in Level 2)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/forms/:formId/questions` | Create a question | Yes (owner) |
| GET | `/api/forms/:formId/questions` | Get all questions | No* |
| GET | `/api/forms/:formId/questions/:id` | Get question by ID | No* |
| PUT | `/api/forms/:formId/questions/:id` | Update question | Yes (owner) |
| DELETE | `/api/forms/:formId/questions/:id` | Delete question | Yes (owner) |
| PUT | `/api/forms/:formId/questions/reorder` | Reorder questions | Yes (owner) |

*Unpublished forms require ownership

#### Question Types

| Type | Description | Options Required |
|------|-------------|------------------|
| `short_answer` | Text input field | No |
| `multiple_choice` | Single selection radio buttons | Yes |
| `checkbox` | Multiple selection checkboxes | Yes |
| `dropdown` | Single selection dropdown menu | Yes |

### Response Endpoints (NEW in Level 2)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/forms/:formId/submit` | Submit a form response | Optional* |
| GET | `/api/forms/:formId/responses` | Get all responses | Yes (owner) |
| GET | `/api/forms/:formId/responses/:id` | Get response by ID | Yes** |
| GET | `/api/forms/:formId/responses/export` | Export all responses | Yes (owner) |
| DELETE | `/api/forms/:formId/responses/:id` | Delete a response | Yes (owner) |
| GET | `/api/forms/:formId/questions/:questionId/statistics` | Get answer stats | Yes (owner) |
| GET | `/api/responses/me` | Get user's own responses | Yes |

*If authenticated, submission is linked to user
**Either the respondent or form owner

## 🔐 Authentication Flow

### How JWT Authentication Works

1. **Registration**: User provides name, email, and password. Password is hashed using bcrypt, and user is stored in database.

2. **Login**: User provides email and password. Server verifies credentials, and if valid, generates a JWT token.

3. **Protected Routes**: For protected endpoints, client sends the JWT token in the Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

4. **Token Verification**: Server middleware verifies the token, extracts user ID, and attaches user info to the request.

5. **Token Expiration**: Tokens expire after the configured time (default: 7 days). Users must login again to get a new token.

### Security Features

- **Password Hashing**: Passwords are hashed with bcrypt (12 salt rounds by default)
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries throughout

## 📝 Example Requests

### Register a New User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create a Form

**Request:**
```http
POST /api/forms
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "title": "Customer Feedback Survey",
  "description": "Help us improve our services",
  "status": "draft"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Form created successfully.",
  "data": {
    "form": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "title": "Customer Feedback Survey",
      "description": "Help us improve our services",
      "status": "draft",
      "is_published": false,
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### Get User's Forms with Filters (Level 2)

**Request:**
```http
GET /api/forms?search=feedback&status=published&sort=desc&page=1&limit=10
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Forms retrieved successfully.",
  "data": {
    "forms": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "title": "Customer Feedback Survey",
        "description": "Help us improve our services",
        "status": "published",
        "is_published": true,
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "created_at": "2024-01-15T11:00:00.000Z",
        "updated_at": "2024-01-15T11:00:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "filters": {
      "search": "feedback",
      "status": "published",
      "sort": "desc"
    }
  }
}
```

### Create a Question (Level 2)

**Request:**
```http
POST /api/forms/456e7890-e89b-12d3-a456-426614174001/questions
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "title": "How satisfied are you with our service?",
  "type": "multiple_choice",
  "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
  "is_required": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Question created successfully.",
  "data": {
    "question": {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "form_id": "456e7890-e89b-12d3-a456-426614174001",
      "title": "How satisfied are you with our service?",
      "type": "multiple_choice",
      "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
      "is_required": true,
      "order_index": 0,
      "created_at": "2024-01-15T11:15:00.000Z",
      "updated_at": "2024-01-15T11:15:00.000Z"
    }
  }
}
```

### Create More Questions

**Checkbox Question:**
```http
POST /api/forms/456e7890-e89b-12d3-a456-426614174001/questions
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "title": "Which features do you use most? (Select all that apply)",
  "type": "checkbox",
  "options": ["Dashboard", "Reports", "Analytics", "Integrations", "API"],
  "is_required": false
}
```

**Short Answer Question:**
```http
POST /api/forms/456e7890-e89b-12d3-a456-426614174001/questions
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "title": "Any additional feedback?",
  "type": "short_answer",
  "is_required": false
}
```

### Submit a Response (Level 2)

**Request:**
```http
POST /api/forms/456e7890-e89b-12d3-a456-426614174001/submit
Content-Type: application/json
Authorization: Bearer <your_token>  # Optional

{
  "answers": [
    {
      "question_id": "789e0123-e89b-12d3-a456-426614174002",
      "value": "Very Satisfied"
    },
    {
      "question_id": "789e0123-e89b-12d3-a456-426614174003",
      "value": ["Dashboard", "Analytics"]
    },
    {
      "question_id": "789e0123-e89b-12d3-a456-426614174004",
      "value": "Great service, keep up the good work!"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Response submitted successfully.",
  "data": {
    "response_id": "abc12345-e89b-12d3-a456-426614174005",
    "form_id": "456e7890-e89b-12d3-a456-426614174001",
    "submitted_at": "2024-01-15T12:00:00.000Z",
    "answers_count": 3
  }
}
```

### Get Form Responses (Form Owner)

**Request:**
```http
GET /api/forms/456e7890-e89b-12d3-a456-426614174001/responses?page=1&limit=10
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Responses retrieved successfully.",
  "data": {
    "responses": [
      {
        "id": "abc12345-e89b-12d3-a456-426614174005",
        "form_id": "456e7890-e89b-12d3-a456-426614174001",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "submitted_at": "2024-01-15T12:00:00.000Z",
        "respondent_name": "John Doe",
        "respondent_email": "john@example.com"
      }
    ]
  },
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Update a Form

**Request:**
```http
PUT /api/forms/456e7890-e89b-12d3-a456-426614174001
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "title": "Updated Survey Title",
  "status": "published"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Form updated successfully.",
  "data": {
    "form": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "title": "Updated Survey Title",
      "description": "Help us improve our services",
      "status": "published",
      "is_published": true,
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

### Delete a Form

**Request:**
```http
DELETE /api/forms/456e7890-e89b-12d3-a456-426614174001
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Form deleted successfully.",
  "data": null
}
```

## 🚫 Business Constraints (Level 2)

### Overview

When a form has at least one submission, certain operations are restricted to maintain data integrity:

| Action | Allowed | Reason |
|--------|---------|--------|
| Delete Question | ❌ No | Would create incomplete response records |
| Change Question Type | ❌ No | Would invalidate existing answers |
| Remove Options from Choice Questions | ❌ No | Would invalidate existing answer selections |
| Add New Options | ✅ Yes | Doesn't affect existing data |
| Update Question Title | ✅ Yes | Doesn't affect answer validity |
| Update is_required | ✅ Yes | Only affects future submissions |

### Example Error: Delete Question with Submissions

**Request:**
```http
DELETE /api/forms/456e7890-e89b-12d3-a456-426614174001/questions/789e0123-e89b-12d3-a456-426614174002
Authorization: Bearer <your_token>
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Cannot delete question because this form already has submissions. Deleting questions would result in incomplete response data. Consider hiding the question instead or creating a new form."
}
```

### Example Error: Change Question Type with Submissions

**Request:**
```http
PUT /api/forms/456e7890-e89b-12d3-a456-426614174001/questions/789e0123-e89b-12d3-a456-426614174002
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "type": "short_answer"
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Cannot change question type because this form already has submissions. Changing the type would invalidate existing answers."
}
```

## ❌ Error Handling

### Validation Error Example

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "123"
    }
  ]
}
```

### Authentication Error Example

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

### Not Found Error Example

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Form not found."
}
```

### Forbidden Error Example

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "You do not have permission to update this form."
}
```

## ⚙️ Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | development | No |
| `PORT` | Server port | 5000 | No |
| `DB_HOST` | PostgreSQL host | localhost | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | No |
| `DB_NAME` | Database name | google_form_clone | Yes |
| `DB_USER` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | Secret key for JWT | - | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | 7d | No |
| `BCRYPT_SALT_ROUNDS` | Bcrypt hashing rounds | 12 | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

## 🧪 Testing with Postman

1. Import the endpoints into Postman
2. Create an environment with variable `baseUrl` = `http://localhost:5000`
3. After login/register, save the token to environment variable `token`
4. Use `{{token}}` in Authorization header for protected routes

### Example Postman Test Cases

#### 1. Form Filtering Test
```
// Test: Filter forms by status
GET {{baseUrl}}/api/forms?status=published

// Expected: Only forms with status "published" returned
pm.test("All forms have published status", function() {
    var jsonData = pm.response.json();
    jsonData.data.forms.forEach(function(form) {
        pm.expect(form.status).to.eql("published");
    });
});
```

#### 2. Question Creation Test
```
// Test: Create question with invalid type
POST {{baseUrl}}/api/forms/{{formId}}/questions
{
    "title": "Test Question",
    "type": "invalid_type"
}

// Expected: 400 Bad Request with validation error
pm.test("Invalid type returns 400", function() {
    pm.response.to.have.status(400);
});
```

#### 3. Response Submission Test
```
// Test: Submit response with invalid option
POST {{baseUrl}}/api/forms/{{formId}}/submit
{
    "answers": [
        {
            "question_id": "{{questionId}}",
            "value": "Invalid Option"
        }
    ]
}

// Expected: 400 Bad Request with validation error
pm.test("Invalid option returns 400", function() {
    pm.response.to.have.status(400);
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.contain("Validation failed");
});
```

#### 4. Business Constraint Test
```
// Test: Delete question after submission
// First submit a response, then try to delete a question
DELETE {{baseUrl}}/api/forms/{{formId}}/questions/{{questionId}}

// Expected: 409 Conflict
pm.test("Cannot delete question with submissions", function() {
    pm.response.to.have.status(409);
});
```

## 📈 Scaling Considerations

This backend is designed for scalability:

- **Connection Pooling**: Database pool with max 20 connections
- **Stateless Auth**: JWT tokens allow horizontal scaling
- **Indexed Queries**: Database indexes on frequently queried columns
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Pagination**: All list endpoints support pagination
- **Error Handling**: Graceful error handling prevents crashes
- **Transactions**: Response submission uses transactions for data consistency

For 10,000+ users, consider:
- Load balancer (nginx, HAProxy)
- Redis for session/rate limit storage
- Read replicas for database
- CDN for static assets (when frontend is added)
- Database connection pool tuning
- Horizontal scaling with multiple server instances

## 🔄 Edge Cases Handled

### Questions
- Duplicate options validation
- Empty options for choice types → returns error
- Options for short_answer → ignored (no error)
- Missing required fields → validation error

### Responses
- Duplicate answers for same question → validation error
- Answer value not in options → validation error
- Missing required question answer → validation error
- Empty answers array for form with no required questions → allowed
- Anonymous vs authenticated submissions → both supported

### Business Constraints
- Delete question with submissions → 409 Conflict
- Change question type with submissions → 409 Conflict
- Remove options with submissions → 409 Conflict
- Add new options with submissions → allowed
- Update question title with submissions → allowed

## 📄 License

ISC License
