
from fastapi import FastAPI

from app.game import router as game_router

app = FastAPI(
    title="LifeQuest AI",
    description="AI-powered life decision simulator",
    version="1.0.0",
)

app.include_router(game_router)


@app.get("/")
def home():
    return {
        "message": "LifeQuest AI backend is running!",
        "status": "success",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "LifeQuest AI",
    }
