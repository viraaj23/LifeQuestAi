
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.ai_service import generate_text

router = APIRouter(prefix="/api/game", tags=["Game"])

# Temporary in-memory storage.
# Games reset when the server restarts.
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


def generate_scenario(game):
    """Ask Gemma to create a scenario for the player."""
    
    prompt = f"""
Create a realistic 2-sentence life simulator scenario.
Character: {game['character_name']}
Goal: {game['goal']}
Day: {game['day']}
Return only the scenario text.
"""

    try:
        return generate_text(prompt)
    except Exception as error:
        print(f"Scenario generation failed: {error}")
        return (
            f"Day {game['day']}: You are working toward "
            f"{game['goal']}. How will you use today "
            "to make progress?"
        )


def generate_consequence(game, choice, stat_changes):
    """Ask Gemma to narrate the result of a decision."""
    prompt = f"""
You are the narrator of LifeQuestAI, a life simulator.

Character: {game['character_name']}
Goal: {game['goal']}
Day: {game['day']}
Player's decision: {choice}
Actual stat changes: {stat_changes}
Updated stats: {game['stats']}

Describe the realistic consequence of this decision
in 2-3 sentences. Make it engaging and specific to
the player's goal. Do not invent or change any stats.
Return only the consequence text.
"""
    try:
        return generate_text(prompt)
    except Exception as error:
        print(f"Consequence generation failed: {error}")
        return (
            f"You chose to {choice.lower()}. "
            "Your actions have shaped today's progress "
            "toward your goal."
        )


@router.post("/start")
def start_game(request: StartGameRequest):
    game_id = str(uuid4())

    game = {
        "game_id": game_id,
        "character_name": request.character_name.strip(),
        "goal": request.goal.strip(),
        "day": 1,
        "stats": {
            "skills": 20,
            "money": 100,
            "energy": 100,
            "happiness": 70,
        },
        "history": [],
        "scenario": "",
        "choices": CHOICES.copy(),
    }

    game["scenario"] = generate_scenario(game)
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
    choice = request.choice
    stat_changes = {}

    # Python controls the actual game mechanics.
    if choice == CHOICES[0]:
        old_skills = stats["skills"]
        old_energy = stats["energy"]

        stats["skills"] = min(100, old_skills + 10)
        stats["energy"] = max(0, old_energy - 15)

        stat_changes = {
            "skills": stats["skills"] - old_skills,
            "energy": stats["energy"] - old_energy,
        }

    elif choice == CHOICES[1]:
        old_skills = stats["skills"]
        old_energy = stats["energy"]

        stats["skills"] = min(100, old_skills + 8)
        stats["energy"] = max(0, old_energy - 10)

        stat_changes = {
            "skills": stats["skills"] - old_skills,
            "energy": stats["energy"] - old_energy,
        }

    else:
        old_energy = stats["energy"]
        old_happiness = stats["happiness"]

        stats["energy"] = min(100, old_energy + 15)
        stats["happiness"] = min(100, old_happiness + 5)

        stat_changes = {
            "energy": stats["energy"] - old_energy,
            "happiness": stats["happiness"] - old_happiness,
        }

    consequence = generate_consequence(
        game,
        choice,
        stat_changes,
    )

    game["history"].append({
        "day": game["day"],
        "scenario": previous_scenario,
        "choice": choice,
        "consequence": consequence,
        "stats_after_decision": stats.copy(),
    })

    game["day"] += 1
    game["scenario"] = generate_scenario(game)

    return {
        "consequence": consequence,
        "game": game,
    }
