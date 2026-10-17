const API_BASE = "http://127.0.0.1:8000";

let currentGameId = null;
let currentGame = null;


const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const SAVE_KEY = "lifequest-ai-save-v2";

const defaults = {
  xp:120, wisdom:60, energy:70, time:20, gold:250,
  selected:"village", history:[], completed:[], choicesMade:0
};

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (!saved || typeof saved !== "object") return {...defaults};
    return {
      ...defaults, ...saved,
      history:Array.isArray(saved.history) ? saved.history : [],
      completed:Array.isArray(saved.completed) ? saved.completed : [],
      selected:["village","castle","forest","ruins"].includes(saved.selected) ? saved.selected : "village"
    };
  } catch {
    return {...defaults};
  }
}

const state = loadGame();


function renderStats() {
  const xpElement = $("#xp");
  const wisdomElement = $("#wisdom");
  const energyElement = $("#energy");
  const goldElement = $("#gold");

  if (xpElement) xpElement.textContent = state.xp;
  if (wisdomElement) wisdomElement.textContent = state.wisdom;
  if (energyElement) energyElement.textContent = state.energy;
  if (goldElement) goldElement.textContent = state.gold;
}




function displayBackendScenario(game) {
  if (!game) {
    console.error("No game data received.");
    return;
  }

  console.log("Displaying game:", game);

  // Update the existing quest information.
  const questTitle = $("#questTitle");
  const questDescription = $("#questDescription");
  const decisionTitle = $("#decisionTitle");
  const decisionText = $("#decisionText");
  const outcome = $("#outcome");
  const container = $("#choices");

  if (questTitle) {
    questTitle.textContent = `DAY ${game.day ?? 1}`;
  }

  if (questDescription) {
    questDescription.textContent = `Your goal: ${game.goal ?? "Your adventure awaits"}`;
  }

  if (decisionTitle) {
    decisionTitle.textContent = "Your next decision";
  }

  if (decisionText) {
    decisionText.textContent =
      game.scenario ?? "Your next adventure is being prepared...";
  }

  if (outcome) {
    outcome.textContent = "";
  }

  if (!container) {
    console.error('Could not find the element with id="choices".');
    return;
  }

  container.replaceChildren();

  if (!Array.isArray(game.choices)) {
    console.error("Expected game.choices to be an array:", game);
    return;
  }

  game.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      `choice-button ${index === 0 ? "recommended" : ""}`;

    const icon = document.createElement("span");
    icon.className = "choice-icon";
    icon.textContent = ["✧", "▤", "☾"][index] || "✦";

    const copy = document.createElement("span");
    const bold = document.createElement("b");
    bold.textContent = choice;

    const small = document.createElement("small");
    small.textContent = "Choose this path";

    copy.append(bold, small);

    const arrow = document.createElement("span");
    arrow.textContent = "↗";

    button.append(icon, copy, arrow);

    button.addEventListener("click", () => {
      makeBackendChoice(choice);
    });

    container.appendChild(button);
  });

  // Synchronize the existing UI stats with the backend.
  if (game.stats) {
    state.xp = game.stats.skills;
    state.wisdom = game.stats.happiness;
    state.energy = game.stats.energy;
    state.gold = game.stats.money;

    if (typeof renderStats === "function") {
      renderStats();
    }
  }
}





async function startBackendGame() {
  const beginButton = $("#beginBtn");

  if (currentGameId) {
    displayBackendScenario(currentGame);
    $("#decision").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return currentGame;
  }

  if (beginButton) beginButton.disabled = true;

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

    // The start endpoint returns the game object directly.
    const game = await response.json();

    if (!game.game_id) {
      throw new Error("The backend response is missing game_id.");
    }

    currentGame = game;
    currentGameId = game.game_id;

    displayBackendScenario(currentGame);

    console.log("Backend game started:", currentGame);
    notify("Adventure started", "Your LifeQuest journey begins.");

    $("#decision").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    return currentGame;
  } catch (error) {
    console.error("Could not start backend game:", error);
    notify(
      "Connection issue",
      "Could not start the game. Check the backend and try again."
    );
    return null;
  } finally {
    if (beginButton) beginButton.disabled = false;
  }
}






async function makeBackendChoice(choice) {
  if (!currentGameId) {
    notify("No active game", "Click Continue your journey first.");
    return;
  }

  const buttons = $$("#choices button");
  buttons.forEach(button => {
    button.disabled = true;
  });

  try {
    const response = await fetch(
      `${API_BASE}/api/game/${currentGameId}/decision`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ choice })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Backend returned ${response.status}: ${errorText}`
      );
    }

    const result = await response.json();

    if (!result.game || !result.game.game_id) {
      throw new Error("Decision response is missing game data.");
    }

    // Update the current game.
    currentGame = result.game;
    currentGameId = currentGame.game_id;

    // Display the next day, story, and choices.
    displayBackendScenario(currentGame);

    // Sync backend stats with the frontend.
    state.xp = currentGame.stats.skills;
    state.wisdom = currentGame.stats.happiness;
    state.energy = currentGame.stats.energy;
    state.gold = currentGame.stats.money;

    if (typeof renderStats === "function") {
      renderStats();
    }

    // Display the consequence of the player's choice.
    const outcome = $("#outcome");
    if (outcome) {
      outcome.textContent =
        result.consequence ||
        "Your decision has shaped your journey.";
    }

    // Record the decision in the local journal.
    state.choicesMade = (state.choicesMade || 0) + 1;

    if (!Array.isArray(state.history)) {
      state.history = [];
    }

    state.history.unshift({
      location: "LifeQuest Adventure",
      note: `Day ${Math.max(1, currentGame.day - 1)}: ${choice}`,
      title: "Your decision",
      reward: result.consequence || "Decision recorded.",
      date: new Date().toLocaleString()
    });

    state.history = state.history.slice(0, 50);

    if (typeof saveGame === "function") {
      saveGame();
    }

    console.log("Decision result:", result);
    notify("Choice recorded", "Your adventure has progressed.");

    // Scroll to the updated decision section.
    $("#decision")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  } catch (error) {
    console.error("Decision failed:", error);

    buttons.forEach(button => {
      button.disabled = false;
    });

    notify(
      "Decision failed",
      "Check the backend terminal and try again."
    );
  }
}




const places = {
  village:{
    title:"A New Beginning", name:"Riverside Village",
    desc:"A traveller has arrived at Riverside Village. A small act of kindness could become the beginning of an unexpected adventure.",
    reward:"+15 XP · +10 Wisdom",
    prompt:"A stranger asks for your help.",
    story:"I have lost my companion on the road. Will you help me search before night falls?"
  },
  castle:{
    title:"The Royal Archive", name:"Eldermere Castle",
    desc:"Inside the royal archive, old books and experienced scholars offer an opportunity to learn and grow.",
    reward:"+20 XP · +15 Wisdom",
    prompt:"A scholar offers you a place at the archive.",
    story:"An hour of focused study could reveal something valuable. Will you use your time wisely?"
  },
  forest:{
    title:"The Unmapped Path", name:"Whispering Forest",
    desc:"A mysterious trail disappears between ancient trees. Exploration may reveal a secret, but the outcome is uncertain.",
    reward:"+25 XP · Discovery",
    prompt:"A narrow trail leads beyond the old watchtower.",
    story:"You cannot know what lies beyond the trees until you take the first step."
  },
  ruins:{
    title:"The Shadow Ruins", name:"Shadow Ruins",
    desc:"Ancient secrets are hidden behind a sealed gate. Gather enough experience before entering.",
    reward:"Unlock at Level 4",
    prompt:"The old gate stands before you.",
    story:"The gate will open only when you have gained enough experience."
  }
};

const actions = {
  help:{
    title:"Kindness changed the path.",
    description:"You helped someone in need. The task took effort, but you gained experience and earned a little trust.",
    reward:"+15 XP · +10 Wisdom",
    changes:{xp:15,wisdom:10,energy:-12,time:-2,gold:5},
    note:"Helped someone in need"
  },
  study:{
    title:"Knowledge is its own reward.",
    description:"You spent time learning. Your energy decreased slightly, but you gained useful knowledge.",
    reward:"+20 XP · +15 Wisdom",
    changes:{xp:20,wisdom:15,energy:-8,time:-3,gold:0},
    note:"Spent time studying"
  },
  rest:{
    title:"Even heroes need rest.",
    description:"You paused to recover. The world kept moving, but you are now better prepared for the next challenge.",
    reward:"+8 XP · +20 Energy",
    changes:{xp:8,wisdom:0,energy:20,time:-1,gold:0},
    note:"Rested and recovered"
  }
};

function level() {
  return Math.floor(state.xp / 100) + 1;
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    $("#saveState").textContent = "✦ SAVED IN THIS BROWSER";
  } catch {
    $("#saveState").textContent = "SESSION ONLY · SAVE UNAVAILABLE";
  }
}

function renderStats() {
  $("#xp").textContent = state.xp;
  $("#wisdom").textContent = state.wisdom;
  $("#energy").textContent = state.energy;
  $("#time").textContent = `${state.time}h`;
  $("#gold").textContent = state.gold;
  $("#level").textContent = String(level()).padStart(2, "0");

  const progress = state.xp % 100;
  $("#xpBar").style.width = `${progress}%`;
  $("#xpProgress").textContent = `${progress} / 100 XP`;

  $("#questCount").textContent =
    ["village", "castle", "forest", "ruins"]
      .filter(key => !state.completed.includes(key)).length;

  $("#ruinsLabel").textContent =
    level() >= 4 ? "UNLOCKED" : "LOCKED · LV. 4";

  saveGame();
}

let toastTimer;

function notify(title,message) {
  $("#toastTitle").textContent = title;
  $("#toastText").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"),3500);
}

function openModal(title,text,reward,eyebrow="CHAPTER UPDATED") {
  $("#modalTitle").textContent = title;
  $("#modalText").textContent = text;
  $("#modalText").classList.toggle("long-content",text.length > 150);
  $("#modalReward").textContent = reward;
  $("#modalEyebrow").textContent = eyebrow;
  $("#modal").classList.add("open");
}

function closeModal() {
  $("#modal").classList.remove("open");
}

function selectPlace(key,silent=false) {
  if (!places[key]) return;

  if (key === "ruins" && level() < 4) {
    notify("The gate is sealed",`Reach Level 4 to unlock the Shadow Ruins. Current level: ${level()}.`);
    return;
  }

  state.selected = key;
  const place = places[key];

  $$(".map-point").forEach(button => {
    const active = button.dataset.place === key;
    button.classList.toggle("selected",active);
    button.setAttribute("aria-pressed",String(active));
  });

  $("#questTitle").textContent = place.title;
  $("#questDescription").textContent = place.desc;
  $("#questReward").textContent = place.reward;
  $("#decisionTitle").textContent = place.prompt;
  $("#decisionText").textContent = place.story;
  $("#outcome").textContent = "";

  $("#questImage").style.backgroundPosition =
    key === "castle" ? "center 30%" :
    key === "forest" ? "right center" :
    key === "ruins" ? "left center" : "center 55%";

  renderChoices();
  saveGame();

  if (!silent) notify(place.name,"Your active quest has changed.");
}

function renderChoices() {
  const container = $("#choices");
  container.innerHTML = "";

  if (state.selected === "ruins" && level() < 4) {
    const message = document.createElement("p");
    message.className = "outcome";
    message.textContent = "This gate is locked. Reach Level 4 to continue.";
    container.appendChild(message);
    return;
  }

  const choices = [
    ["help","Help the traveller","Gain wisdom · Spend energy","✧"],
    ["study","Study at the archive","Build skills · Use some time","▤"],
    ["rest","Rest until morning","Restore energy · Spend time","☾"]
  ];

  choices.forEach(([key,title,description,glyph],index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-button ${index === 0 ? "recommended" : ""}`;

    const icon = document.createElement("span");
    icon.className = "choice-icon";
    icon.textContent = glyph;

    const copy = document.createElement("span");
    const bold = document.createElement("b");
    bold.textContent = title;
    const small = document.createElement("small");
    small.textContent = description;
    copy.append(bold,small);

    const arrow = document.createElement("span");
    arrow.textContent = "↗";

    button.append(icon,copy,arrow);
    button.addEventListener("click",() => makeChoice(key));
    container.appendChild(button);
  });
}

function makeChoice(key) {
  const action = actions[key];
  if (!action) return;

  const oldLevel = level();

  for (const [stat,amount] of Object.entries(action.changes)) {
    if (stat === "energy") {
      state.energy = Math.max(0,Math.min(100,state.energy + amount));
    } else if (stat === "time") {
      state.time = Math.max(0,state.time + amount);
    } else {
      state[stat] = Math.max(0,state[stat] + amount);
    }
  }

  state.choicesMade++;
  state.history.unshift({
    location:places[state.selected].name,
    note:action.note,
    title:action.title,
    reward:action.reward,
    date:new Date().toLocaleString()
  });
  state.history = state.history.slice(0,50);

  if (!state.completed.includes(state.selected)) {
    state.completed.push(state.selected);
  }

  const levelUp = level() > oldLevel ? `\n\nLevel up! You are now Level ${level()}.` : "";

  renderStats();
  $("#outcome").textContent = `✦ ${action.reward}`;
  $("#decisionTitle").textContent = action.title;
  $("#decisionText").textContent = `${places[state.selected].name}: ${action.description}`;
  renderChoices();
  saveGame();

  notify("Choice recorded",`${action.reward}${levelUp}`);
  openModal(action.title,`${places[state.selected].name}\n\n${action.description}${levelUp}`,action.reward);
}

function openJournal() {
  const text = ["village","castle","forest","ruins"].map(key => {
    const status = key === "ruins" && level() < 4 ? "LOCKED" :
      state.completed.includes(key) ? "COMPLETED" :
      state.selected === key ? "ACTIVE" : "AVAILABLE";
    return `${status} — ${places[key].name}\n${places[key].desc}`;
  }).join("\n\n");

  openModal("Quest Journal",`${text}\n\nChoices made: ${state.choicesMade}`,"Explore the realm to continue.","YOUR QUESTS");
}

function openChronicle() {
  const text = state.history.length
    ? state.history.map((entry,i) => `${i+1}. ${entry.location}\n${entry.note}\n${entry.reward}\n${entry.date}`).join("\n\n")
    : "Your chronicle is empty. Make your first decision and your story will appear here.";

  openModal("The Chronicle of You",`${text}\n\nTotal choices: ${state.choicesMade}`,"Every decision leaves a mark.","YOUR CHRONICLE");
}

function setTab(tab) {
  $$(".nav-item").forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("active",active);
    button.setAttribute("aria-current",active ? "page" : "false");
  });
}

$$(".map-point").forEach(button => {
  button.addEventListener("click",() => selectPlace(button.dataset.place));
});

$$(".nav-item").forEach(button => {
  button.addEventListener("click",() => {
    const tab = button.dataset.tab;
    setTab(tab);

    if (tab === "map") {
      closeModal();
      $("#pageTitle").textContent = "Choose your next chapter.";
      $("#map").scrollIntoView({behavior:"smooth",block:"center"});
      notify("Realm map","Choose a location to explore.");
    }
    if (tab === "quests") openJournal();
    if (tab === "chronicle") openChronicle();
  });
});


$("#beginBtn").addEventListener("click", async () => {
  const game = await startBackendGame();

  if (game) {
    $("#decision").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
});


$("#travelBtn").addEventListener("click",() => {
  if (state.selected === "ruins" && level() < 4) {
    notify("Gate sealed","Reach Level 4 to unlock this location.");
    return;
  }
  $("#decision").scrollIntoView({behavior:"smooth",block:"center"});
  notify("Chapter entered",`${places[state.selected].name} is your active quest.`);
});

$("#closeModal").addEventListener("click",closeModal);
$("#continueBtn").addEventListener("click",closeModal);
$("#toastClose").addEventListener("click",() => $("#toast").classList.remove("show"));
$("#modal").addEventListener("click",event => {
  if (event.target.id === "modal") closeModal();
});
document.addEventListener("keydown",event => {
  if (event.key === "Escape") closeModal();
});

$("#soundToggle").addEventListener("click",() => {
  notify("Ambient mode","Visual effects are active. Audio has not been connected yet.");
});

renderStats();
selectPlace(state.selected,true);
setTab("map");
