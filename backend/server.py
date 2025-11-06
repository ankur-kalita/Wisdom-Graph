from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from openai import AsyncOpenAI
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# OpenAI Configuration
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ===== MODELS =====

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class NodeData(BaseModel):
    id: str
    type: str = "default"
    data: Dict[str, Any]
    position: Dict[str, float]


class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    type: str = "smoothstep"


class LearningMap(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    topic: str
    level: str  # Beginner, Intermediate, Advanced
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GenerateMapRequest(BaseModel):
    topic: str
    level: str = "Beginner"  # Beginner, Intermediate, Advanced


class ExpandNodeRequest(BaseModel):
    node_label: str
    topic: str
    level: str


class SaveMapRequest(BaseModel):
    topic: str
    level: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


# ===== HELPER FUNCTIONS =====

def create_access_token(user_id: str, email: str) -> str:
    """Create JWT access token"""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {
        "sub": user_id,
        "email": email,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


async def generate_learning_map_with_ai(topic: str, level: str) -> Dict[str, Any]:
    """Generate learning map using OpenAI"""
    try:
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        system_message = """You are an expert learning path designer. Generate structured learning maps that help users explore complex subjects.
Return ONLY valid JSON without any markdown formatting, code blocks, or explanations.

Format your response as:
{
  "nodes": [
    {"id": "unique-id", "label": "Topic Name", "description": "Brief description", "resources": ["resource1", "resource2"]},
    ...
  ],
  "edges": [
    {"from": "node-id", "to": "node-id"},
    ...
  ]
}"""

        prompt = f"""Create a {level}-level learning map for: "{topic}"

Generate a comprehensive learning roadmap with:
- Main concepts and subtopics
- Logical learning progression
- Key areas to master
- Practical learning resources

Return ONLY the JSON object, no markdown or code blocks."""

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Clean markdown if present
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        map_data = json.loads(response_text)
        return map_data
    
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Error generating learning map: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate learning map: {str(e)}")


async def expand_node_with_ai(node_label: str, topic: str, level: str) -> List[Dict[str, Any]]:
    """Expand a specific node with subtopics using AI"""
    try:
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        prompt = f"""Expand the topic "{node_label}" in the context of learning "{topic}" at {level} level.

Provide 3-6 subtopics with:
- Clear, specific labels
- Brief descriptions
- 2-3 learning resources each

Return ONLY JSON, no markdown:
{{"subtopics": [...]}}"""

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content.strip()
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        data = json.loads(response_text)
        return data.get('subtopics', [])
    
    except Exception as e:
        logger.error(f"Error expanding node: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to expand node: {str(e)}")


# ===== ROUTES =====

@api_router.get("/")
async def root():
    return {"message": "Wisdom Graph API"}


# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    password_hash = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=password_hash
    )
    
    # Save to database
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(user.id, user.email)
    
    return TokenResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    )


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    # Find user
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(user['id'], user['email'])
    
    return TokenResponse(
        access_token=access_token,
        user={
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    )


@api_router.get("/auth/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    """Get current user info"""
    return current_user


# Learning Map Routes
@api_router.post("/generate-map")
async def generate_map(
    request: GenerateMapRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Generate a new learning map using AI"""
    try:
        map_data = await generate_learning_map_with_ai(request.topic, request.level)
        return {
            "success": True,
            "data": map_data
        }
    except Exception as e:
        logger.error(f"Error in generate_map: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@api_router.post("/expand-node")
async def expand_node(
    request: ExpandNodeRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Expand a specific node with subtopics"""
    try:
        subtopics = await expand_node_with_ai(
            request.node_label,
            request.topic,
            request.level
        )
        return {
            "success": True,
            "subtopics": subtopics
        }
    except Exception as e:
        logger.error(f"Error in expand_node: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@api_router.post("/maps/save")
async def save_map(
    map_request: SaveMapRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Save a learning map"""
    try:
        learning_map = LearningMap(
            user_id=current_user['id'],
            topic=map_request.topic,
            level=map_request.level,
            nodes=map_request.nodes,
            edges=map_request.edges
        )
        
        map_dict = learning_map.model_dump()
        map_dict['created_at'] = map_dict['created_at'].isoformat()
        map_dict['updated_at'] = map_dict['updated_at'].isoformat()
        
        await db.learning_maps.insert_one(map_dict)
        
        return {
            "success": True,
            "message": "Learning map saved successfully",
            "map_id": learning_map.id
        }
    except Exception as e:
        logger.error(f"Error saving map: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save map: {str(e)}"
        )


@api_router.get("/maps")
async def get_maps(current_user: Dict = Depends(get_current_user)):
    """Get all saved maps for current user"""
    try:
        maps = await db.learning_maps.find(
            {"user_id": current_user['id']},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {
            "success": True,
            "maps": maps
        }
    except Exception as e:
        logger.error(f"Error fetching maps: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch maps: {str(e)}"
        )


@api_router.get("/maps/{map_id}")
async def get_map(
    map_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get a specific learning map"""
    try:
        learning_map = await db.learning_maps.find_one(
            {"id": map_id, "user_id": current_user['id']},
            {"_id": 0}
        )
        
        if not learning_map:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning map not found"
            )
        
        return {
            "success": True,
            "map": learning_map
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching map: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch map: {str(e)}"
        )


@api_router.delete("/maps/{map_id}")
async def delete_map(
    map_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a learning map"""
    try:
        result = await db.learning_maps.delete_one(
            {"id": map_id, "user_id": current_user['id']}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning map not found"
            )
        
        return {
            "success": True,
            "message": "Learning map deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting map: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete map: {str(e)}"
        )


@api_router.get("/maps/{map_id}/export")
async def export_map(
    map_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Export a learning map as JSON"""
    try:
        learning_map = await db.learning_maps.find_one(
            {"id": map_id, "user_id": current_user['id']},
            {"_id": 0}
        )
        
        if not learning_map:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning map not found"
            )
        
        return learning_map
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting map: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export map: {str(e)}"
        )

@api_router.get("/healthz")
async def health_check():
    try:
        # Ping MongoDB
        await db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Database not reachable")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
