
from app.ai_service import generate_text

prompt = """
You are the narrator of LifeQuestAI.

A college student wants to improve their programming skills.
Create one short life scenario and provide three possible choices.
Keep the response under 120 words.
"""

try:
    print(generate_text(prompt))
except Exception as error:
    print(f"Gemma test failed: {error}")
