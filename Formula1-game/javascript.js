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
}
