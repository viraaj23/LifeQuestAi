
from fastapi import FastAPI
from app.game import router as game_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="LifeQuest AI",
    description="AI-powered life decision simulator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game_router)


@app.get("/")
def home():
    return {
        "message": "Life Quest AI backend is running!",
        "status": "success",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "LifeQuest AI",
    }
