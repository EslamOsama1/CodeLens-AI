# 🔍 CodeLens AI

> **AI-powered code review REST API that analyzes source code, detects potential issues, and provides intelligent improvement suggestions.**

CodeLens AI is a backend REST API for an AI-powered code review platform. It allows developers to submit source code from different sources and receive automated code analysis, including potential bugs, security issues, severity levels, suggestions, and an overall code quality score.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Secure password hashing with bcrypt
* Forgot password functionality
* Reset password functionality
* Update password
* Update user profile
* Delete account
* Get current user
* Role-based authorization
* Admin user management
* Google OAuth authentication
* GitHub OAuth authentication

### 🐙 GitHub Integration

* Connect a GitHub account using OAuth 2.0
* Retrieve the authenticated user's repositories
* Access repository contents
* Recursively retrieve files from repositories
* Use GitHub repositories as a source for code reviews
* Store GitHub access tokens securely for authenticated requests

### 📝 Code Submission

CodeLens AI supports multiple ways to submit code:

* Upload source-code files
* Paste code directly
* Analyze code from GitHub repositories

Supported file extensions include:

* `.js`
* `.ts`
* `.py`
* `.java`
* `.cpp`
* `.c`

### 🤖 AI Code Review

The AI review system analyzes submitted source code and provides:

* Code quality analysis
* Potential bugs
* Security issues
* Code improvement suggestions
* Issue severity
* Overall code score
* General code summary

Issues can have the following severity levels:

* Low
* Medium
* High
* Critical

---

## 🛠️ Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT**
* **Passport.js**
* **Axios**
* **Multer**
* **Groq SDK**
* **Nodemailer**

### Authentication

* JSON Web Tokens (JWT)
* Passport.js
* GitHub OAuth 2.0
* Google OAuth 2.0
* bcrypt

### Security

* Helmet
* CORS
* Express Rate Limit
* HPP
* bcrypt
* JWT authentication
* Role-based access control

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      Client         │
                    │ Postman / Frontend  │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST
                               ▼
                    ┌─────────────────────┐
                    │    Express.js API   │
                    │                     │
                    │  Authentication     │
                    │  GitHub Integration │
                    │  Code Review        │
                    └──────┬───────┬──────┘
                           │       │
                           │       │
                           ▼       ▼
                    ┌──────────┐  ┌──────────────┐
                    │ MongoDB  │  │  GitHub API  │
                    └──────────┘  └──────────────┘
                                   │
                                   ▼
                             ┌─────────────┐
                             │  AI Model   │
                             └─────────────┘
```

---

## 📂 Project Structure

```text
codelens-ai/
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── reviewController.js
│   └── ...
│
├── models/
│   ├── userModel.js
│   ├── reviewModel.js
│   └── ...
│
├── Routes/
│   ├── authRoute.js
│   ├── userRoute.js
│   ├── reviewRoute.js
│   ├── githubRoute.js
│   └── ...
│
├── OAuth/
│   ├── googleStrategy.js
│   ├── githubStrategy.js
│   └── ...
│
├── utils/
│   ├── appErorr.js
│   └── ...
│
├── app.js
├── server.js
├── package.json
├── package-lock.json
└── config.env
```

---

## 🔑 Authentication Flow

### Local Authentication

```text
Client
  │
  ▼
POST /signup
  │
  ▼
Create User
  │
  ▼
MongoDB
  │
  ▼
JWT
  │
  ▼
Authenticated Client
```

### GitHub OAuth

```text
Client
  │
  ▼
GitHub OAuth
  │
  ▼
GitHub Authorization
  │
  ▼
OAuth Callback
  │
  ▼
Find / Create User
  │
  ▼
Generate JWT
  │
  ▼
Authenticated User
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| POST   | `/api/v1/users/signup`               | Register a new user    |
| POST   | `/api/v1/users/login`                | Login                  |
| POST   | `/api/v1/users/forgotPassword`       | Request password reset |
| PATCH  | `/api/v1/users/resetPassword/:token` | Reset password         |
| PATCH  | `/api/v1/users/updateMyPassword`     | Update password        |
| PATCH  | `/api/v1/users/updateMe`             | Update profile         |
| GET    | `/api/v1/users/me`                   | Get current user       |
| POST   | `/api/v1/users/logout`               | Logout                 |

### OAuth

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| GET    | `/api/v1/auth/google`          | Start Google OAuth    |
| GET    | `/api/v1/auth/google/callback` | Google OAuth callback |
| GET    | `/api/v1/auth/github`          | Start GitHub OAuth    |
| GET    | `/api/v1/auth/github/callback` | GitHub OAuth callback |

### GitHub

| Method | Endpoint               | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| GET    | `/api/v1/github/repos` | Get authenticated user's repositories |

### Code Review

The Code Review API supports submitting code through file uploads, pasted code, and GitHub repositories.

---

## ⚙️ Environment Variables

Create a `config.env` file:

```env
NODE_ENV=development

PORT=5000

DATABASE=mongodb://...

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

GROQ_API_KEY=your_groq_api_key

EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
```

> **Never commit ****`config.env`**** to GitHub.**

Make sure it is included in `.gitignore`:

```gitignore
config.env
.env
.env.*
node_modules/
```

---

## 💻 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/codelens-ai.git
cd codelens-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
config.env
```

and add your MongoDB, JWT, OAuth, AI, and email credentials.

### 4. Start the development server

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

---

## ❤️ Health Check

You can verify that the API is running using:

```http
GET /health
```

Example response:

```json
{
  "status": "success",
  "message": "CodeLens AI API is running"
}
```

---

## 🧪 API Testing

The API can be tested using:

* Postman
* Insomnia
* Any REST API client

Example authenticated request:

```http
GET /api/v1/users/me
Authorization: Bearer <JWT>
```

---

## 🔒 Security

CodeLens AI implements several security mechanisms:

* JWT authentication
* Password hashing with bcrypt
* Helmet security headers
* CORS
* Rate limiting
* HPP protection
* Input validation
* Role-based access control
* OAuth 2.0 authentication
* Environment-based secret management

Sensitive credentials such as:

* JWT secrets
* Database credentials
* OAuth client secrets
* AI API keys
* GitHub access tokens

should never be exposed publicly.

---

## 🌐 Deployment

The backend is designed to be deployable on cloud platforms such as Railway.

For production deployment, configure:

* MongoDB connection
* Environment variables
* CORS
* GitHub OAuth callback URL
* Google OAuth callback URL
* JWT configuration
* AI API credentials

Example production API:

```text
https://your-api-domain.com
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

To contribute:

```bash
git fork
git clone <your-fork>
git checkout -b feature/your-feature
```

Make your changes and submit a pull request.

---

## 👨‍💻 Author

**Eslam Osama**

Junior Backend Developer
Node.js & Express.js

GitHub: **@EslamOsama1**

---

## 📄 License

This project is licensed under the ISC License.

---

⭐ If you find CodeLens AI useful, consider giving the repository a star!
