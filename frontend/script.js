const API_BASE = "http://127.0.0.1:8000";

let currentGameId = null;
let currentGame = null;


const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const SAVE_KEY = "lifequest-ai-save-v2";

const defaults = {
  xp: 120,
  wisdom: 60,
  energy: 70,
  time: 20,
  gold: 250,
  selected: "village",
  history: [],
  completed: [],
  choicesMade: 0
};

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");

    if (!saved || typeof saved !== "object") {
      return { ...defaults };
    }

    return {
      ...defaults,
      ...saved,
      history: Array.isArray(saved.history) ? saved.history : [],
      completed: Array.isArray(saved.completed) ? saved.completed : [],
      selected: ["village", "castle", "forest", "ruins"].includes(saved.selected)
        ? saved.selected
        : "village"
    };
  } catch {
    return { ...defaults };
  }
}

const state = loadGame();


async function startBackendGame() {
  try {
    const response = await fetch(`${API_BASE}/api/game/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        character_name: "LifeQuest Hero",
        goal: "Grow skills, wisdom, and complete quests"
      })
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    currentGame = await response.json();
    currentGameId = currentGame.game_id;

    console.log("Backend game started:", currentGame);
    notify("AI Connected", "Your LifeQuest adventure is ready.");
    return currentGame;
  } catch (error) {
    console.error("Could not start backend game:", error);
    notify("Connection issue", "Check that your FastAPI backend is running.");
    return null;
  }
}


/* Everyday activities for LifeQuestAI.
   Existing keys and HTML IDs are kept for compatibility. */

const places = {
  village: {
    title: "Help Someone Out",
    name: "Helping a Friend",
    desc: "A friend needs help today. Think about whether you can make time for them while keeping your own plans in mind.",
    reward: "Build helpful habits",
    prompt: "A friend asks you for help.",
    story: "You have your own tasks to finish, but your friend could use some support. What will you do?"
  },

  castle: {
    title: "Study Session",
    name: "Study Time",
    desc: "You have an exam or assignment coming up. A focused study session can help you make progress, but remember to manage your energy.",
    reward: "Build knowledge",
    prompt: "You have time to study.",
    story: "You could review a topic, practise questions, or finish an assignment. How will you spend your time?"
  },

  forest: {
    title: "Take a Break",
    name: "Rest and Recharge",
    desc: "You have been working for a while. A short break may help you feel refreshed before you return to your tasks.",
    reward: "Support your energy",
    prompt: "You could use a break.",
    story: "You still have things to do, but taking a little time to recharge may help. What will you do next?"
  },

  ruins: {
    title: "Build a Better Routine",
    name: "Daily Habits",
    desc: "Review your routine and choose a small habit to work on next.",
    reward: "Available at Level 4",
    prompt: "Review your daily routine.",
    story: "Think about one small habit that could make your day easier. This activity unlocks at Level 4."
  }
};

const actions = {
  help: {
    title: "You made time to help",
    description: "You chose to support your friend. Helping others can be worthwhile, as long as you also leave enough time for your own responsibilities.",
    reward: "+15 XP · +10 Wisdom",
    changes: {
      xp: 15,
      wisdom: 10,
      energy: -12,
      time: -2,
      gold: 5
    },
    note: "Helped a friend"
  },

  study: {
    title: "Study session completed",
    description: "You spent time learning. Your energy went down a little, but you made progress towards your academic goals.",
    reward: "+20 XP · +15 Wisdom",
    changes: {
      xp: 20,
      wisdom: 15,
      energy: -8,
      time: -3,
      gold: 0
    },
    note: "Studied for an exam or assignment"
  },

  rest: {
    title: "You took time to recharge",
    description: "You paused to rest. Taking breaks can help you return to your tasks with more energy.",
    reward: "+8 XP · +20 Energy",
    changes: {
      xp: 8,
      wisdom: 0,
      energy: 20,
      time: -1,
      gold: 0
    },
    note: "Took a break"
  }
};

function level() {
  return Math.floor(state.xp / 100) + 1;
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));

    if ($("#saveState")) {
      $("#saveState").textContent = "Saved in this browser";
    }
  } catch {
    if ($("#saveState")) {
      $("#saveState").textContent = "Session only · save unavailable";
    }
  }
}

function renderStats() {
  if ($("#xp")) $("#xp").textContent = state.xp;
  if ($("#wisdom")) $("#wisdom").textContent = state.wisdom;
  if ($("#energy")) $("#energy").textContent = state.energy;
  if ($("#time")) $("#time").textContent = `${state.time}h`;
  if ($("#gold")) $("#gold").textContent = state.gold;

  if ($("#level")) {
    $("#level").textContent = String(level()).padStart(2, "0");
  }

  const progress = state.xp % 100;

  if ($("#xpBar")) {
    $("#xpBar").style.width = `${progress}%`;
  }

  if ($("#xpProgress")) {
    $("#xpProgress").textContent = `${progress} / 100 XP`;
  }

  if ($("#questCount")) {
    $("#questCount").textContent = [
      "village",
      "castle",
      "forest",
      "ruins"
    ].filter(key => !state.completed.includes(key)).length;
  }

  if ($("#ruinsLabel")) {
    $("#ruinsLabel").textContent =
      level() >= 4 ? "AVAILABLE" : "AVAILABLE AT LEVEL 4";
  }

  saveGame();
}

let toastTimer;

function notify(title, message) {
  if (!$("#toastTitle") || !$("#toastText") || !$("#toast")) {
    return;
  }

  $("#toastTitle").textContent = title;
  $("#toastText").textContent = message;
  $("#toast").classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    $("#toast").classList.remove("show");
  }, 3500);
}

function openModal(title, text, reward, eyebrow = "ACTIVITY UPDATED") {
  if (
    !$("#modalTitle") ||
    !$("#modalText") ||
    !$("#modalReward") ||
    !$("#modalEyebrow") ||
    !$("#modal")
  ) {
    return;
  }

  $("#modalTitle").textContent = title;
  $("#modalText").textContent = text;

  $("#modalText").classList.toggle(
    "long-content",
    text.length > 150
  );

  $("#modalReward").textContent = reward;
  $("#modalEyebrow").textContent = eyebrow;
  $("#modal").classList.add("open");
}

function closeModal() {
  if ($("#modal")) {
    $("#modal").classList.remove("open");
  }
}

function selectPlace(key, silent = false) {
  if (!places[key]) return;

  if (key === "ruins" && level() < 4) {
    notify(
      "Not available yet",
      `Reach Level 4 to unlock Daily Habits. Your current level is ${level()}.`
    );
    return;
  }

  state.selected = key;

  const place = places[key];

  $$(".map-point").forEach(button => {
    const active = button.dataset.place === key;

    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if ($("#questTitle")) {
    $("#questTitle").textContent = place.title;
  }

  if ($("#questDescription")) {
    $("#questDescription").textContent = place.desc;
  }

  if ($("#questReward")) {
    $("#questReward").textContent = place.reward;
  }

  if ($("#decisionTitle")) {
    $("#decisionTitle").textContent = place.prompt;
  }

  if ($("#decisionText")) {
    $("#decisionText").textContent = place.story;
  }

  if ($("#outcome")) {
    $("#outcome").textContent = "";
  }

  renderChoices();
  saveGame();

  if (!silent) {
    notify(place.name, "This is your selected activity.");
  }
}

function renderChoices() {
  const container = $("#choices");

  if (!container) return;

  container.innerHTML = "";

  if (state.selected === "ruins" && level() < 4) {
    const message = document.createElement("p");

    message.className = "outcome";
    message.textContent =
      "Reach Level 4 to unlock the daily habits activity.";

    container.appendChild(message);
    return;
  }

  const choices = [
    [
      "help",
      "Help a friend",
      "Use time and energy to help someone",
      "✧"
    ],
    [
      "study",
      "Study for an exam",
      "Build knowledge and use some time",
      "▤"
    ],
    [
      "rest",
      "Take a break",
      "Recover energy and use a little time",
      "☾"
    ]
  ];

  choices.forEach(([key, title, description, glyph], index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className =
      `choice-button ${index === 0 ? "recommended" : ""}`;

    const icon = document.createElement("span");
    icon.className = "choice-icon";
    icon.textContent = glyph;

    const copy = document.createElement("span");

    const bold = document.createElement("b");
    bold.textContent = title;

    const small = document.createElement("small");
    small.textContent = description;

    copy.append(bold, small);

    const arrow = document.createElement("span");
    arrow.textContent = "→";

    button.append(icon, copy, arrow);

    button.addEventListener("click", () => {
      makeChoice(key);
    });

    container.appendChild(button);
  });
}

function makeChoice(key) {
  const action = actions[key];

  if (!action) return;

  const oldLevel = level();

  for (const [stat, amount] of Object.entries(action.changes)) {
    if (stat === "energy") {
      state.energy = Math.max(
        0,
        Math.min(100, state.energy + amount)
      );
    } else if (stat === "time") {
      state.time = Math.max(0, state.time + amount);
    } else {
      state[stat] = Math.max(0, state[stat] + amount);
    }
  }

  state.choicesMade++;

  state.history.unshift({
    location: places[state.selected].name,
    note: action.note,
    title: action.title,
    reward: action.reward,
    date: new Date().toLocaleString()
  });

  state.history = state.history.slice(0, 50);

  if (!state.completed.includes(state.selected)) {
    state.completed.push(state.selected);
  }

  const levelUp =
    level() > oldLevel
      ? `\n\nYou reached Level ${level()}!`
      : "";

  renderStats();

  if ($("#outcome")) {
    $("#outcome").textContent = action.reward;
  }

  if ($("#decisionTitle")) {
    $("#decisionTitle").textContent = action.title;
  }

  if ($("#decisionText")) {
    $("#decisionText").textContent =
      `${places[state.selected].name}: ${action.description}`;
  }

  renderChoices();
  saveGame();

  notify("Choice saved", `${action.reward}${levelUp}`);

  openModal(
    action.title,
    `${places[state.selected].name}\n\n${action.description}${levelUp}`,
    action.reward
  );
}

function openJournal() {
  const text = ["village", "castle", "forest", "ruins"]
    .map(key => {
      const status =
        key === "ruins" && level() < 4
          ? "NOT YET AVAILABLE"
          : state.completed.includes(key)
            ? "COMPLETED"
            : state.selected === key
              ? "SELECTED"
              : "AVAILABLE";

      return `${status} — ${places[key].name}\n${places[key].desc}`;
    })
    .join("\n\n");

  openModal(
    "My Tasks",
    `${text}\n\nChoices made: ${state.choicesMade}`,
    "Keep making steady progress.",
    "YOUR ACTIVITIES"
  );
}

function openChronicle() {
  const text = state.history.length
    ? state.history
        .map((entry, index) =>
          `${index + 1}. ${entry.location}\n${entry.note}\n${entry.reward}\n${entry.date}`
        )
        .join("\n\n")
    : "You haven't recorded any choices yet. Choose an activity and your history will appear here.";

  openModal(
    "Activity History",
    `${text}\n\nTotal choices: ${state.choicesMade}`,
    "Review the choices you've made.",
    "YOUR HISTORY"
  );
}

function setTab(tab) {
  $$(".nav-item").forEach(button => {
    const active = button.dataset.tab === tab;

    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
}

$$(".map-point").forEach(button => {
  button.addEventListener("click", () => {
    selectPlace(button.dataset.place);
  });
});

$$(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    setTab(tab);

    if (tab === "map") {
      closeModal();

      if ($("#pageTitle")) {
        $("#pageTitle").textContent = "Plan your next activity";
      }

      if ($("#map")) {
        $("#map").scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      notify("Activities", "Choose an activity to get started.");
    }

    if (tab === "quests") {
      openJournal();
    }

    if (tab === "chronicle") {
      openChronicle();
    }
  });
});



$("#beginBtn").addEventListener("click", async () => {
  const game = await startBackendGame();

  if (!game) return;

  $("#decision").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});


$("#travelBtn").addEventListener("click",() => {
  if (state.selected === "ruins" && level() < 4) {
    notify("Gate sealed","Reach Level 4 to unlock this location.");
    return;

if ($("#beginBtn")) {
  $("#beginBtn").addEventListener("click", async () => {
    const game = await startBackendGame();

    if (!game) return;

    if ($("#decision")) {
      $("#decision").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
}

if ($("#travelBtn")) {
  $("#travelBtn").addEventListener("click", () => {
    if (state.selected === "ruins" && level() < 4) {
      notify(
        "Not available yet",
        "Reach Level 4 to unlock Daily Habits."
      );
      return;
    }

    if ($("#decision")) {
      $("#decision").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    notify(
      "Activity selected",
      `${places[state.selected].name} is selected.`
    );
  });
}

if ($("#closeModal")) {
  $("#closeModal").addEventListener("click", closeModal);
}

if ($("#continueBtn")) {
  $("#continueBtn").addEventListener("click", closeModal);
}

if ($("#toastClose")) {
  $("#toastClose").addEventListener("click", () => {
    $("#toast")?.classList.remove("show");
  });
}

if ($("#modal")) {
  $("#modal").addEventListener("click", event => {
    if (event.target.id === "modal") {
      closeModal();
    }
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();

});

if ($("#soundToggle")) {
  $("#soundToggle").addEventListener("click", () => {
    notify(
      "Audio not enabled",
      "Sound is not connected in this version."
    );
  });
}

renderStats();
selectPlace(state.selected, true);
setTab("map");
