
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


def generate_text(prompt: str) -> str:
    """Generate text using Gemma."""

    if client is None:
        raise RuntimeError(
            "GEMMA_API_KEY is missing. Check backend/.env"
        )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    if not response.text:
        raise RuntimeError("Gemma returned an empty response.")

    return response.text.strip()
