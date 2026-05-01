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