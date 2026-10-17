from app.ai_service import generate_text, API_KEY, MODEL_NAME, client

print("key loaded:", bool(API_KEY))
print("model:", MODEL_NAME)

print("--- available models ---")
for m in client.models.list():
    print(m.name)

print("--- test call ---")
print(generate_text("Say hi in one line"))