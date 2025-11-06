# Wisdom Graph 🧠

An intelligent, interactive web application that transforms any topic into a structured, visual learning journey. Powered by AI (OpenAI GPT-4o) to help users explore complex subjects through interactive node-based maps with drag-and-drop customization.

![Wisdom Graph](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-19.0-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688) ![MongoDB](https://img.shields.io/badge/MongoDB-4.5-47A248)

## 🌐 Live Demo

**[Try Wisdom Graph Now →](https://wisdom-graph.vercel.app)**

## 🌟 Features

- **AI-Powered Map Generation**: Generate comprehensive learning roadmaps instantly using OpenAI GPT-4o
- **Interactive Visualization**: Node-based maps with React Flow for intuitive exploration
- **Drag & Drop Customization**: Rearrange nodes freely with smart auto-layout that prevents overlapping
- **Deep Exploration**: Click any node to expand and reveal AI-generated subtopics
- **Learning Levels**: Adjust complexity with Beginner, Intermediate, or Advanced filters
- **Learning Resources**: Get curated resources, articles, and guides for each topic
- **Authentication System**: Secure JWT-based user registration and login
- **Save & Manage Maps**: Save, export (JSON), and manage your learning maps
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Pan & Zoom**: Navigate large maps with smooth controls and mini-map navigation

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **Yarn** (or npm)
- **Python** 3.11+
- **MongoDB** 4.5+
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ankur-kalita/Wisdom-Graph.git
cd Wisdom-Graph
```

2. **Backend Setup**

```bash
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

Create `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=learning_map_db
CORS_ORIGINS=*
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-secret-jwt-key-here-min-32-chars
```

3. **Frontend Setup**
```bash
cd frontend
yarn install
```

Create `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

4. **Start MongoDB**
```bash
# Mac (homebrew):
brew services start mongodb-community

# Linux (systemctl):
sudo systemctl start mongod
```

5. **Run the application**

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

Access the app at `http://localhost:3000` and API docs at `http://localhost:8001/docs`

## 📋 API Documentation

### Authentication

**Register:**
```http
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login:**
```http
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Learning Maps

**Generate Map:**
```http
POST /api/generate-map
Authorization: Bearer <token>
{
  "topic": "Machine Learning",
  "level": "Intermediate"
}
```

**Expand Node:**
```http
POST /api/expand-node
Authorization: Bearer <token>
{
  "node_label": "Neural Networks",
  "topic": "Machine Learning",
  "level": "Intermediate"
}
```

**Save Map:**
```http
POST /api/maps/save
Authorization: Bearer <token>
{
  "topic": "Machine Learning",
  "level": "Intermediate",
  "nodes": [...],
  "edges": [...]
}
```

**Get All Maps:** `GET /api/maps`  
**Get Specific Map:** `GET /api/maps/{map_id}`  
**Delete Map:** `DELETE /api/maps/{map_id}`

## 🎮 How to Use

1. **Sign Up/Login** - Create an account or login
2. **Generate a Map** - Enter a topic and select your knowledge level
3. **Explore** - View, drag, zoom, and pan through your learning path
4. **Expand Topics** - Click nodes to view details and generate subtopics
5. **Save & Export** - Save to your library or export as JSON

**Pro Tips:**
- Use the mini-map for quick navigation of large maps
- Switch themes for better visibility
- Expand multiple nodes to create comprehensive learning trees

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19.0, React Router, ReactFlow
- Shadcn UI, Tailwind CSS
- Axios, Sonner, Lucide React

**Backend:**
- FastAPI, MongoDB, Motor
- OpenAI GPT-4o
- JWT, Bcrypt, Pydantic

### Project Structure

```
learning-map-app/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/ui/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.js
│   ├── package.json
│   └── .env
└── README.md
```

## 🎨 Design Philosophy

- **Clean & Modern**: Minimalist design focusing on content
- **Responsive**: Mobile-first with fluid breakpoints
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigation
- **Performance**: Optimized bundle, lazy loading, memoization

## 🐛 Troubleshooting

**Module not found:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

**MongoDB connection errors:**
```bash
# Check status
brew services list | grep mongodb  # Mac
sudo systemctl status mongod       # Linux

# Start MongoDB
brew services start mongodb-community  # Mac
sudo systemctl start mongod            # Linux
```

**OpenAI API errors:**
- Verify API key in `backend/.env`
- Check account credits and GPT-4o access

**Frontend connection issues:**
- Verify `REACT_APP_BACKEND_URL` in `frontend/.env`
- Ensure backend runs on port 8001

## 🔐 Security Features

- Password hashing with Bcrypt
- JWT authentication
- Protected routes with guards
- Input validation with Pydantic
- CORS configuration
- XSS protection (React built-in)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- React Flow team for visualization library
- Shadcn for UI components
- FastAPI team for the framework

---

**Built with ❤️ using AI, React, FastAPI, and MongoDB**

*Transform any topic into an interactive learning journey* 🚀