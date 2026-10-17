# ✨ LifeQuestAI — Your Life, Your Choices, Your Story

**An AI-powered life simulation where every decision shapes your journey.**

LifeQuestAI transforms personal growth into an interactive adventure. Make choices, face consequences, build skills, manage your energy, and explore different paths with the help of AI.

Instead of simply planning your future, experience the possibilities through a game-like world where your decisions influence what happens next.

---

## 🌟 Overview

LifeQuestAI combines the imagination of a fantasy adventure with the possibilities of generative AI. Players begin their journey with a goal and make decisions that influence their progress, resources, and future scenarios.

The project aims to make self-improvement more engaging by turning everyday decisions into an interactive experience.

### ✨ Key Features

- 🎮 **Interactive Life Simulation** — Make choices and progress through evolving scenarios.
- 🤖 **AI-Generated Stories** — Use Google's Gemma model to generate scenarios and consequences.
- 📊 **Dynamic Player Stats** — Track skills, energy, happiness, and money.
- 🔄 **Decision-Based Progression** — Experience consequences and move through successive days.
- 📜 **Adventure History** — Record decisions and their consequences in a chronicle.
- 🗺️ **Fantasy-Inspired Interface** — Explore an immersive world with locations, quests, and interactive elements.
- 🧠 **AI Engine** — Organize intelligent features such as task prioritization and planning as the project evolves.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | Styling and fantasy-inspired interface |
| JavaScript | Interactive gameplay and API integration |
| Python | Backend logic and AI services |
| FastAPI | REST API and backend endpoints |
| Google Gemma | Generative AI for scenarios and consequences |
| Uvicorn | Local ASGI server |
| Git & GitHub | Version control and team collaboration |

---

## 🏗️ Project Architecture

```text
LifeQuestAI/
├── ai_engine/
│   └── task_planner.py
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── game.py
│   │   └── ai_service.py
│   ├── test_gemma.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── assets/
├── .gitignore
└── README.md
```

*Note: `.env` contains local secrets and should not be committed to GitHub. The tree represents the main project structure; additional files may exist.*

### 🔄 How It Works

1. **Start the journey:** The player begins a new simulation and sets a goal.
2. **Generate a scenario:** The backend prepares a scenario for the current day.
3. **Make a decision:** The player chooses one of the available actions.
4. **Process the outcome:** The backend updates the game state and generates a consequence.
5. **Update progress:** Player statistics, the story, and the decision history are updated.
6. **Continue the adventure:** The next scenario presents another decision.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Python 3.10 or later
- Git
- Visual Studio Code
- A Google AI API key with access to the configured Gemma model

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd LifeQuestAI
```

Replace the placeholder with your repository's actual clone URL.

### 2. Create a Python virtual environment

From the project root:

**Windows PowerShell**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can use the environment's Python executable directly instead.

### 3. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the `backend/` directory:

```env
GEMMA_API_KEY=your_google_ai_api_key
```

Replace the placeholder with your own API key. Keep `.env` private and never commit it.

### 5. Start the backend

From the `backend/` directory, run:

```powershell
python -m uvicorn app.main:app --reload
```

The API should be available at:

- **Backend:** http://127.0.0.1:8000
- **Interactive API documentation:** http://127.0.0.1:8000/docs

### 6. Launch the frontend

Open the project in VS Code, install the **Live Server** extension if needed, and launch `frontend/index.html` using Live Server.

The frontend and backend must both be running for API-powered gameplay to work.

---

## 🔌 API Endpoints

The game API currently uses the `/api/game` prefix.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/game/start` | Start a new game |
| GET | `/api/game/{game_id}` | Retrieve a game's state |
| GET | `/api/game/{game_id}/history` | Retrieve game history |
| POST | `/api/game/{game_id}/decision` | Submit a decision and advance the game |

You can explore and test the endpoints through the FastAPI Swagger interface at `/docs`.

---

## 🔐 Security and Configuration

- Store API keys in environment variables.
- Keep `.env` out of version control.
- Use `.env.example` to document required configuration without exposing secrets.
- Configure CORS appropriately for your frontend origin.
- Do not expose private API credentials in frontend JavaScript.

---

## 🧪 Testing

To test the configured Gemma integration, run the available test script from the backend directory:

```powershell
python test_gemma.py
```

You can also use the Swagger UI at `/docs` to test the game endpoints.

---

## 👥 Team Collaboration

LifeQuestAI is developed collaboratively using Git and GitHub.

Team members can contribute to areas such as:

- Frontend design and user experience
- Backend APIs and game logic
- Generative AI integration
- Task planning and AI engine development
- Testing, documentation, and deployment

Please coordinate changes through feature branches and pull requests to reduce merge conflicts.

---

## 🔮 Future Enhancements

Potential improvements include:

- Personalized AI-generated life paths
- Smarter task planning and prioritization
- Long-term goals and milestones
- Persistent player profiles and saved games
- More meaningful consequences based on previous decisions
- Learning roadmaps and productivity insights
- Deployment with a hosted backend and frontend

---

## 💡 Why LifeQuestAI?

Real-life growth involves uncertainty, trade-offs, and consequences. LifeQuestAI explores how AI can turn those choices into an interactive experience that encourages reflection, experimentation, and continuous improvement.

**Your choices shape your journey. Your journey shapes your story.**

---

## 📄 License

Choose and add an appropriate open-source license before distributing the project publicly.

---

*Built with curiosity, creativity, and AI.*
