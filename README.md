# Forest Notes 🌿

A full-stack MERN (MongoDB-alternative with PostgreSQL) note-taking application with a beautiful nature-inspired design. Built as part of the 10Pearls internship program.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.3.1-blue)](https://reactjs.org/)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Acknowledgments](#acknowledgments)
- [Developer](#developer)

## Overview

Forest Notes is a modern, full-stack note-taking application that combines powerful functionality with an elegant, nature-inspired user interface. The application features secure user authentication, rich text editing capabilities, and a comprehensive search system, all wrapped in a calming, forest-themed design.

**Internship Project**: This application was developed as part of the 10Pearls internship program, demonstrating proficiency in full-stack development, RESTful API design, database management, and modern frontend development practices.

## Features

### User Management
- **Secure Authentication**: JWT-based authentication system
- **User Registration**: Complete signup flow with validation
- **Password Recovery**: Email-based OTP system for password reset
- **Profile Management**: Update username, email, and password
- **Session Management**: Persistent login with token storage

### Note Management
- **Rich Text Editor**: Full-featured WYSIWYG editor with formatting options
  - Bold, Italic, Underline, Strikethrough
  - Headings (H1, H2, H3)
  - Lists (Ordered & Unordered)
  - Text alignment
  - Blockquotes and code blocks
  - Link insertion
- **CRUD Operations**: Create, Read, Update, and Delete notes
- **Search Functionality**: Real-time search across note titles and content
- **Responsive Design**: Seamless experience across desktop and mobile devices

### User Experience
- **Nature-Inspired UI**: Calming sage and forest green color palette
- **Smooth Animations**: Fade-in effects and gentle transitions
- **Loading States**: Clear feedback during async operations
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful guidance when no content exists

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Email Service**: Nodemailer
- **Testing**: Mocha, Chai, chai-http

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (custom configuration)
- **Icons**: Lucide React
- **HTTP Client**: Fetch API
- **Testing**: Jest, React Testing Library

### DevOps & Tools
- **Version Control**: Git
- **Environment Variables**: dotenv
- **CORS**: cors middleware
- **Code Quality**: ESLint

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/forest-notes.git
cd forest-notes
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=notes_db

# Test Database (Optional)
DB_TEST_NAME=notes_test_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. Setup Database

Create the PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE notes_db;
\q
```

The application will automatically create tables on first run using the `init-db.sql` schema.

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend in Production

```bash
cd backend
NODE_ENV=production npm start
```

## Testing

### Backend Tests (Integration Tests)

The backend includes 20 comprehensive integration tests covering authentication and notes functionality.

```bash
cd backend
npm test
```

**Test Coverage**:
- Authentication API: 10 tests
  - User registration
  - User login
  - Protected routes
  - Password change
  - Email validation
  - Duplicate prevention
- Notes API: 10 tests
  - CRUD operations
  - User isolation
  - Authorization checks
  - Validation

### Frontend Tests (Component Tests)

```bash
cd frontend
npm test
```

**Test Coverage**:
- Login Component: 3 tests
- SignUp Component: 2 tests
- NotesContainer: 3 tests
- Notes CRUD: 2 tests
- RichTextEditor: 2 tests
- ProfileModal: 1 test

### Run All Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### Forgot Password (Request OTP)
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### Notes Endpoints

#### Get All Notes
```http
GET /api/notes
Authorization: Bearer <token>
```

#### Get Single Note
```http
GET /api/notes/:id
Authorization: Bearer <token>
```

#### Create Note
```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "<p>Note content in HTML</p>"
}
```

#### Update Note
```http
PUT /api/notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "<p>Updated content</p>"
}
```

#### Delete Note
```http
DELETE /api/notes/:id
Authorization: Bearer <token>
```

## Project Structure

```
forest-notes/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database configuration
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   └── notes.js             # Notes CRUD routes
│   │   ├── init-db.sql              # Database schema
│   │   └── server.js                # Express app setup
│   ├── tests/
│   │   ├── helpers/
│   │   │   └── testDb.js            # Test database utilities
│   │   ├── integration/
│   │   │   ├── auth.test.js         # Auth integration tests
│   │   │   └── notes.test.js        # Notes integration tests
│   │   └── setup.js                 # Test configuration
│   ├── .env                          # Environment variables (create this)
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NoteEditor.jsx       # Rich text note editor
│   │   │   ├── NotesContainer.jsx   # Main notes management
│   │   │   ├── NotesList.jsx        # Notes grid display
│   │   │   ├── ProfileModal.jsx     # User profile management
│   │   │   └── RichTextEditor.jsx   # WYSIWYG editor
│   │   ├── services/
│   │   │   └── api.js               # API service functions
│   │   ├── tests/
│   │   │   ├── Component/           # Component tests
│   │   │   └── Utils/               # Test utilities
│   │   ├── App.jsx                  # Main app component
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # App entry point
│   ├── .env                          # Environment variables (optional)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
└── README.md                         # This file
```

## Acknowledgments

- **10Pearls**: For providing the internship opportunity and mentorship
- **Design Inspiration**: Nature and minimalist design principles
- **Open Source Community**: For the amazing tools and libraries used in this project

## Developer

**Jawairia Hammad**  
10Pearls Internship Program

---

**Project Status**: Active Development  
**Last Updated**: February 2026

For questions or support, please open an issue in the GitHub repository.
