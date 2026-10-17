
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/game", tags=["Game"])

# Temporary storage for the prototype.
# Games will reset when the server restarts.
games = {}

CHOICES = [
    "Study DSA for two hours",
    "Build a small project",
    "Relax and recharge",
]


class StartGameRequest(BaseModel):
    character_name: str = Field(min_length=1, max_length=30)
    goal: str = Field(min_length=1, max_length=100)


class DecisionRequest(BaseModel):
    choice: str = Field(min_length=1, max_length=200)


@router.post("/start")
def start_game(request: StartGameRequest):
    game_id = str(uuid4())

    game = {
        "game_id": game_id,
        "character_name": request.character_name,
        "goal": request.goal,
        "day": 1,
        "stats": {
            "skills": 20,
            "money": 100,
            "energy": 100,
            "happiness": 70,
        },
        "history": [],
        "scenario": (
            f"You want to {request.goal}. "
            "How will you spend your first day?"
        ),
        "choices": CHOICES.copy(),
    }

    games[game_id] = game
    return game


@router.get("/{game_id}")
def get_game(game_id: str):
    game = games.get(game_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return game


@router.get("/{game_id}/history")
def get_history(game_id: str):
    game = games.get(game_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return {
        "game_id": game_id,
        "history": game["history"],
    }


@router.post("/{game_id}/decision")
def make_decision(
    game_id: str,
    request: DecisionRequest,
):
    game = games.get(game_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    if request.choice not in game["choices"]:
        raise HTTPException(
            status_code=400,
            detail="Choose one of the available options",
        )

    previous_scenario = game["scenario"]
    stats = game["stats"]

    if request.choice == CHOICES[0]:
        stats["skills"] = min(100, stats["skills"] + 10)
        stats["energy"] = max(0, stats["energy"] - 15)
        consequence = (
            "Your problem-solving skills improved, "
            "but studying used some of your energy."
        )

    elif request.choice == CHOICES[1]:
        stats["skills"] = min(100, stats["skills"] + 8)
        stats["energy"] = max(0, stats["energy"] - 10)
        consequence = (
            "You gained practical project experience "
            "and made progress toward your goal."
        )

    else:
        stats["energy"] = min(100, stats["energy"] + 15)
        stats["happiness"] = min(
            100, stats["happiness"] + 5
        )
        consequence = (
            "You recharged your energy and improved "
            "your happiness."
        )

    game["history"].append({
        "day": game["day"],
        "scenario": previous_scenario,
        "choice": request.choice,
        "consequence": consequence,
        "stats_after_decision": stats.copy(),
    })

    game["day"] += 1
    game["scenario"] = (
        f"Day {game['day']}: {consequence} "
        "What will you prioritize next?"
    )

    return {
        "consequence": consequence,
        "game": game,
    }
