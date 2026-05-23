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
  } else {
    detectedTeam = null;
    detectEl.innerText = "Detected: geen team (" + bestProb.toFixed(2) + ")";
  }

  if (gameState === "intro" && detectedTeam !== null) {
    gameState = "countdown";
    startCountdown();
  }

  if (gameState === "playing" && detectedTeam !== null) {
    if (detectedTeam === currentTeam) {
      score++;
      updateScore();
      showFeedback(true);
    } else {
      showFeedback(false);
    }

    gameState = "cooldown";
  }

  if (gameState === "cooldown" && detectedTeam === null && !cooldownActive) {
    cooldownActive = true;

    setTimeout(() => {
      pickNewDriver();
      gameState = "playing";
      cooldownActive = false;
    }, TEAM_CHANGE_DELAY);
  }
}
