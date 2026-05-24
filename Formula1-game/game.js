// ===== GAME DATA & UI =====
let detectedTeam = null;
let currentDriver = null;
let cooldownActive = false;
const TEAM_CHANGE_DELAY = 2000; // 2 seconden

let currentTeam = "Ferrari"; // tijdelijk vast, later wisselen

const teamColors = {
  Ferrari: "red",
  RedBull: "blue",
  Mercedes: "turquoise",
  McLaren: "orange",
};

const drivers = [
  // ===== FERRARI =====
  { name: "Charles Leclerc", team: "Ferrari", img: "images/leclerc.jpg" },
  { name: "Lewis Hamilton", team: "Ferrari", img: "images/hamilton.jpg" },
  { name: "Niki Lauda", team: "Ferrari", img: "images/lauda.jpg" },
  { name: "Michael Schumacher", team: "Ferrari", img: "images/schumacher.jpg" },
  { name: "Italië", team: "Ferrari", img: "images/italië.jpg" },

  // ===== MERCEDES =====
  { name: "George Russell", team: "Mercedes", img: "images/russell.jpg" },
  { name: "Kimi Antonelli", team: "Mercedes", img: "images/antonelli.jpg" },
  { name: "Juan Manuel Fangio", team: "Mercedes", img: "images/fangio.jpg" },
  { name: "Nico Rosberg", team: "Mercedes", img: "images/rosberg.jpg" },
  { name: "Duitsland", team: "Mercedes", img: "images/duitsland.jpg" },

  // ===== RED BULL =====
  { name: "Max Verstappen", team: "RedBull", img: "images/verstappen.jpg" },
  { name: "Mark Webber", team: "RedBull", img: "images/webber.jpg" },
  { name: "Sebastian Vettel", team: "RedBull", img: "images/vettel.jpg" },
  { name: "Isack Hadjar", team: "RedBull", img: "images/hadjar.jpg" },
  { name: "Oostenrijk", team: "RedBull", img: "images/oostenrijk.jpg" },

  // ===== McLAREN =====
  { name: "Lando Norris", team: "McLaren", img: "images/norris.jpg" },
  { name: "Oscar Piastri", team: "McLaren", img: "images/piastri.jpg" },
  { name: "James Hunt", team: "McLaren", img: "images/hunt.jpg" },
  { name: "Ayrton Senna", team: "McLaren", img: "images/senna.jpg" },
  { name: "Verenigd Koninkrijk", team: "McLaren", img: "images/verenigd_koninkrijk.jpg" },
];



function updateCurrentTeamUI() {
  const teamEl = document.getElementById("current-team");
  teamEl.innerText = "Current team: " + currentTeam;
  teamEl.style.color = teamColors[currentTeam];
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

function pickNewDriver() {
  const randomIndex = Math.floor(Math.random() * drivers.length);
  currentDriver = drivers[randomIndex];
  currentTeam = currentDriver.team;

  updateCurrentTeamUI();
  updateDriverUI();
}

function updateDriverUI() {
  const img = document.getElementById("driver-img");
  img.src = currentDriver.img;
}

// ===== GAME STATE =====
let gameState = "intro";
let startCountdownTime = 5;
let startCountdownInterval = null;
let gameTime = 30;
let gameTimerInterval = null;
let score = 0;

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

function endGame() {
  gameState = "gameover";
  const gameOverEl = document.getElementById("game-over");
  gameOverEl.style.display = "block";
}

function showEndScore() {
  const finalScoreEl = document.getElementById("final-score");
  finalScoreEl.innerHTML =
    "Your score: " + score + "<br>Top score: 12" + "<br>You placed #2";
  finalScoreEl.style.display = "block";
}

function resetGame() {
  gameState = "intro";
  score = 0;
  updateScore();

  document.getElementById("game-over").style.display = "none";
  document.getElementById("final-score").style.display = "none";

  pickNewDriver();
}

function updateScore() {
  document.getElementById("score").innerText = "Your score: " + score;
}
