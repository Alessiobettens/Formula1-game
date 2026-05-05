// ===== TEACHABLE MACHINE =====
const URL = "./tm-model/";

let model, webcam, labelContainer, maxPredictions;

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
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.childNodes[i].innerHTML =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
  }

  // START GAME
  if (gameState === "intro") {
    for (let i = 0; i < maxPredictions; i++) {
      if (prediction[i].probability > 0.9) {
        startCountdown();
        break;
      }
    }
  }

  // SCORE VERHOGEN
  if (gameState === "playing") {
    for (let i = 0; i < prediction.length; i++) {
      if (prediction[i].probability > 0.9) {
        score++;
        updateScore();
        break;
      }
    }
  }
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
