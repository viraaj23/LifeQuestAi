
import os
from google import genai

MODEL_NAME = "gemma-4-26b-a4b-it"


def generate_coach_plan(tasks, available_minutes, student_goal):
    client = genai.Client(
        api_key=os.environ["GEMINI_API_KEY"]
    )

    prompt = f"""
    You are the AI coach in LifeQuest AI, a gamified
    student productivity application.

    Student goal: {student_goal}
    Available time: {available_minutes} minutes
    Tasks: {tasks}

    Create a realistic study plan.
    - Prioritize urgent tasks.
    - Skip completed tasks.
    - Keep total study time within the available time.
    - Include task durations and short breaks.
    - Mention tasks that cannot fit.
    - End with an encouraging message.
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return response.text


if __name__ == "__main__":
    tasks = [
        {"name": "Math assignment", "duration": 60,
         "priority": "high", "status": "pending"},
        {"name": "Python practice", "duration": 45,
         "priority": "medium", "status": "pending"}
    ]

    result = generate_coach_plan(
        tasks, 120, "Improve grades and learn Python"
    )

    print(result)
