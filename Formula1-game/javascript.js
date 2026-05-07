// ===== TEACHABLE MACHINE =====
const URL = "./tm-model/";

let model, webcam, labelContainer, maxPredictions;
let detectedTeam = null;
let cooldownActive = false;

const TEAM_CHANGE_DELAY = 2000; // 2 seconden

let currentTeam = "Ferrari"; // tijdelijk vast, later wisselen

const teams = ["Ferrari", "RedBull", "Mercedes", "McLaren"];

// ===== TEAM COLORS =====
const teamColors = {
  Ferrari: "red",
  RedBull: "blue",
  Mercedes: "turquoise",
  McLaren: "orange",
};

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(200, 200, true);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");

  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  updateCurrentTeamUI();
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let bestProb = 0;

  for (let i = 0; i < maxPredictions; i++) {
    const prob = prediction[i].probability;
    labelContainer.childNodes[i].innerHTML =
      prediction[i].className + ": " + prob.toFixed(2);

    if (prob > bestProb) {
      bestProb = prob;
      detectedTeam = prediction[i].className;
    }
  }

  const detectEl = document.getElementById("detected-team");
  if (bestProb > 0.8) {
    detectEl.innerText =
      "Detected: " + detectedTeam + " (" + bestProb.toFixed(2) + ")";
    console.log(
      "Match check - Current:",
      currentTeam,
      "| Detected:",
      detectedTeam,
      "| Equal:",
      currentTeam === detectedTeam,
    );
  } else {
    detectedTeam = null;
    detectEl.innerText = "Detected: geen team (" + bestProb.toFixed(2) + ")";
  }

  // Intro: countdown starten
  if (gameState === "intro" && detectedTeam !== null) {
    gameState = "countdown";
    startCountdown();
  }

  // Playing: score verhogen
  if (gameState === "playing" && detectedTeam !== null) {
    if (detectedTeam === currentTeam) {
      score++;
      updateScore();
      showFeedback(true);
    } else {
      showFeedback(false);
    }

    gameState = "cooldown";
    lastScoreTime = now;
  }

  // Cooldown: wachten tot object weg is
  if (gameState === "cooldown" && detectedTeam === null && !cooldownActive) {
    cooldownActive = true;

    setTimeout(() => {
      pickNewTeam();
      gameState = "playing";
      cooldownActive = false;
    }, TEAM_CHANGE_DELAY);
  }
}

function pickNewTeam() {
  const randomIndex = Math.floor(Math.random() * teams.length);
  currentTeam = teams[randomIndex];
  updateCurrentTeamUI();
}

function updateCurrentTeamUI() {
  const teamEl = document.getElementById("current-team");
  teamEl.innerText = "Current team: " + currentTeam;

  const color = teamColors[currentTeam];
  teamEl.style.color = color;
}

function showFeedback(isCorrect) {
  const teamEl = document.getElementById("current-team");

  if (isCorrect) {
    teamEl.classList.add("correct");
  } else {
    teamEl.classList.add("wrong");
  }

  setTimeout(() => {
    teamEl.classList.remove("correct");
    teamEl.classList.remove("wrong");
  }, 1000);
}

// ===== GAME STATE =====
let gameState = "intro";

// ===== START COUNTDOWN (5 sec) =====
let startCountdownTime = 5;
let startCountdownInterval = null;

function startCountdown() {
  gameState = "countdown";

  const countdownEl = document.getElementById("countdown");
  countdownEl.style.display = "block";

  startCountdownTime = 5;

  startCountdownInterval = setInterval(() => {
    countdownEl.innerText = "Game will start in " + startCountdownTime + "s";

    startCountdownTime--;

    if (startCountdownTime < 0) {
      clearInterval(startCountdownInterval);
      countdownEl.style.display = "none";
      startGame();
    }
  }, 1000);
}

// ===== GAME TIMER (30 sec) =====
let gameTime = 30;
let gameTimerInterval = null;
let score = 0;

function startGame() {
  gameState = "playing";
  gameTime = 30;
  score = 0;

  updateScore();

  const timeEl = document.getElementById("time");
  timeEl.innerText = "Time left: 30s";

  gameTimerInterval = setInterval(() => {
    gameTime--;
    timeEl.innerText = "Time left: " + gameTime + "s";

    if (gameTime <= 0) {
      clearInterval(gameTimerInterval);
      endGame();
    }
  }, 1000);
}

// ===== GAME OVER =====
function endGame() {
  gameState = "gameover";

  alert("Game Over!\nYour score: " + score);

  // hier kan je later:
  // - QR-code tonen
  // - eindscore opslaan
}

// ===== SCORE UPDATEN =====
function updateScore() {
  document.getElementById("score").innerText = "Your score: " + score;
}
