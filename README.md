# AI Learning Map 🧠

An intelligent, interactive web application that transforms any topic into a structured, visual learning journey. Powered by AI (OpenAI GPT-4o) to help users explore complex subjects through interactive node-based maps.

![AI Learning Map](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-19.0-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688) ![MongoDB](https://img.shields.io/badge/MongoDB-4.5-47A248)

## 🌟 Features

### Core Functionality
- **AI-Powered Map Generation**: Generate comprehensive learning roadmaps instantly using OpenAI GPT-4o
- **Interactive Visualization**: Node-based maps with React Flow for intuitive exploration
- **Deep Exploration**: Click any node to expand and reveal subtopics with AI-generated content
- **Learning Levels**: Adjust complexity with Beginner, Intermediate, or Advanced filters
- **Learning Resources**: Get curated resources, articles, and guides for each topic

### User Features
- **Authentication System**: Secure JWT-based user registration and login
- **Save & Manage Maps**: Save your learning maps for future reference
- **Export Functionality**: Export maps as JSON files
- **Saved Maps Library**: Access and manage all your previously created learning maps
- **Dark/Light Theme**: Toggle between themes for comfortable viewing

### Technical Features
- **Real-time AI Integration**: Using OpenAI GPT-4o
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Modern UI**: Beautiful glass-morphism effects with Shadcn UI components
- **Interactive Nodes**: Hover, click, and explore with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd learning-map-app
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt

# Configure environment variables in backend/.env
# OPENAI_API_KEY=your-api-key-here
```

3. **Frontend Setup**
```bash
cd frontend
yarn install
```

4. **Run the application**

Backend:
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Frontend:
```bash
cd frontend
yarn start
```

The app will be available at `http://localhost:3000`

## 📋 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Learning Map Endpoints

#### Generate Learning Map
```http
POST /api/generate-map
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Web Development",
  "level": "Beginner"
}
```

#### Expand Node
```http
POST /api/expand-node
Authorization: Bearer <token>
Content-Type: application/json

{
  "node_label": "Frontend Development",
  "topic": "Web Development",
  "level": "Beginner"
}
```

#### Save Learning Map
```http
POST /api/maps/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Web Development",
  "level": "Beginner",
  "nodes": [...],
  "edges": [...]
}
```

#### Get All Saved Maps
```http
GET /api/maps
Authorization: Bearer <token>
```

#### Get Specific Map
```http
GET /api/maps/{map_id}
Authorization: Bearer <token>
```

#### Export Map
```http
GET /api/maps/{map_id}/export
Authorization: Bearer <token>
```

#### Delete Map
```http
DELETE /api/maps/{map_id}
Authorization: Bearer <token>
```

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19.0 with React Router
- ReactFlow for interactive node visualization
- Shadcn UI components with Radix UI
- Tailwind CSS for styling
- Axios for API calls
- Sonner for toast notifications

**Backend:**
- FastAPI (Python)
- MongoDB with Motor (async driver)
- OpenAI integration
- JWT for authentication
- Bcrypt for password hashing

**AI Integration:**
- OpenAI GPT-4o 
- Structured prompt engineering for consistent map generation
- JSON response parsing with error handling

### Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React contexts (Auth, Theme)
│   │   ├── pages/         # Page components
│   │   │   ├── LandingPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── MapViewer.js
│   │   │   └── SavedMaps.js
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🎨 Design Philosophy

### UI/UX Principles
- **Clean & Modern**: Minimalist design with focus on content
- **Intuitive Navigation**: Clear pathways through the application
- **Visual Hierarchy**: Proper spacing and typography (Space Grotesk + Manrope)
- **Accessible**: Semantic HTML and ARIA labels
- **Responsive**: Mobile-first approach with breakpoints

### Color Palette
- **Light Mode**: Soft gradients (blue-50, indigo-50, purple-50)
- **Dark Mode**: Deep slate colors (slate-900, slate-800)
- **Accents**: Blue and purple gradients for CTAs
- **Cards**: Glass-morphism effects with backdrop blur

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=learning_map_db
CORS_ORIGINS=*
OPENAI_API_KEY=your-api-key-here
JWT_SECRET=your-secret-key-here
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📝 Usage Examples

### Example 1: Generate a Learning Map for "Machine Learning"

1. Navigate to Dashboard
2. Enter "Machine Learning" as the topic
3. Select "Intermediate" level
4. Click "Generate Learning Map"
5. Explore the generated nodes and connections
6. Click any node to view details and resources
7. Click "Expand Node" to dive deeper into subtopics

### Example 2: Save and Export a Map

1. After generating a map, click "Save" in the map viewer
2. Navigate to "Saved Maps" from the dashboard
3. View all your saved maps
4. Click "Export" to download as JSON
5. Use the JSON file for external tools or future import


## 🤝 Code Quality & Best Practices

- **Modular Architecture**: Clean separation of concerns
- **Type Safety**: Pydantic models for data validation
- **Error Handling**: Comprehensive try-catch blocks
- **Security**: JWT authentication, password hashing with bcrypt
- **Performance**: Optimized React components, async database operations
- **Documentation**: Well-commented code with clear function purposes

## 📄 License

This project is created for demonstration purposes.

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- React Flow team for the excellent visualization library
- Shadcn for beautiful UI components
---

**Built with ❤️ using AI, React, and FastAPI**
