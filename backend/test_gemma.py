
from dotenv import load_dotenv
from app.ai_service import generate_text

load_dotenv()

try:
    result = generate_text("Write one short sentence about learning programming.")
    print("SUCCESS:", result)
except Exception as error:
    print("FAILED:", type(error).__name__, error)
