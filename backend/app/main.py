from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.game import router as game_router

app = FastAPI(
    title="LifeQuest AI",
    description="AI-powered life decision simulator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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