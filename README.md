# 🤖 Askify Backend API

This is the server-side application for **Askify**, an AI-powered chatbot capable of context-aware conversations and secure user management. It handles authentication, database persistence, and communication with the Google Gemini AI model.

> **⚠️ Frontend Repository:** The React frontend for this project is located in the repository **[`/askify`](https://github.com/purvawebdev/askify)**.

## 🚀 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **AI Model:** Google Gemini Pro
* **Authentication:** JWT (JSON Web Tokens) & BCrypt
* **Tools:** Nodemon, Dotenv, Cors

## ✨ Key Features

* **Secure Authentication:** User registration and login with hashed passwords and JWT issuance.
* **Persistent Chat History:** Stores user conversations in MongoDB, referenced by User ID.
* **Context-Aware AI:** Sends previous chat context to Gemini for coherent, multi-turn conversations.
* **Protected Routes:** Middleware to ensure only authenticated users can access or modify their data.
* **Optimized Data Fetching:** Separate endpoints for lightweight history lists (Sidebar) vs. full chat details (Chat Window).

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/purvawebdev/askify-backend.git
cd askify-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Run the Server

We use nodemon for development to auto-restart on changes.

```bash
# Development Mode
npm run dev

# Production Mode
npm start
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |

### Chat Operations (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Get list of all conversation threads (lightweight) |
| GET | `/api/chat/:id` | Get full message history for a specific chat |
| POST | `/api/chat` | Send a message to Gemini and save response |

## 📂 Project Structure

```
server/
├── src/
│   ├── config/         # Database connection logic
│   ├── controllers/    # Route logic (Auth, Chat)
│   ├── middleware/     # JWT Authentication middleware
│   ├── models/         # Mongoose Schemas (User, Chat)
│   ├── routes/         # API Route definitions
│   └── index.js        # Entry point
├── .env                # Environment variables (Ignored by Git)
└── package.json        # Dependencies and Scripts
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
