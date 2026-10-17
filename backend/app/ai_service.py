
import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMMA_API_KEY")
MODEL_NAME = os.getenv(
    "GEMMA_MODEL",
    "gemma-4-26b-a4b-it",
)

client = genai.Client(api_key=API_KEY) if API_KEY else None



import time

def generate_text(prompt: str) -> str:
    """Generate text using Gemma, retrying temporary API errors."""

    if client is None:
        raise RuntimeError(
            "GEMMA_API_KEY is missing. Check backend/.env"
        )

    last_error = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
            )

            if not response.text:
                raise RuntimeError("Gemma returned an empty response.")

            return response.text.strip()

        except Exception as error:
            last_error = error
            print(f"Gemma attempt {attempt + 1} failed: {error}")

            if attempt < 2:
                time.sleep(2)

    raise RuntimeError(
        f"Gemma failed after 3 attempts: {last_error}"
    )



    if not response.text:
        raise RuntimeError("Gemma returned an empty response.")

    return response.text.strip()
