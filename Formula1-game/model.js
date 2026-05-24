// ===== TEACHABLE MACHINE =====
const URL = "./tm-model/";
let model, webcam, labelContainer, maxPredictions;
let driverLocked = false;
let animationId = null;

let detectionCount = 0;
const REQUIRED_DETECTIONS = 3;

function normalizeTeamName(teamName) {
  return teamName?.toString().toLowerCase().replace(/\s+/g, "") || "";
}

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(200, 200, true);
  try {
    await webcam.setup();
    await webcam.play();
    animationId = window.requestAnimationFrame(loop);
  } catch (err) {
    console.error("Webcam setup failed:", err);
    const detectEl = document.getElementById("detected-team");
    if (detectEl) {
      detectEl.innerText = "Camera error: " + (err.message || err);
    } else {
      alert("Camera error: " + (err.message || err));
    }
    return;
  }

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
  if (gameState !== "gameover") {
    animationId = window.requestAnimationFrame(loop);
  } else {
    animationId = null;
  }
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let bestProb = 0;
  let bestClass = null;

  // ✅ Zoek beste voorspelling
  for (let i = 0; i < maxPredictions; i++) {
    const prob = prediction[i].probability;

    labelContainer.childNodes[i].innerHTML =
      prediction[i].className + ": " + prob.toFixed(2);

    if (prob > bestProb) {
      bestProb = prob;
      bestClass = prediction[i].className;
    }
  }

  const detectEl = document.getElementById("detected-team");

  // ✅ Stabiliteit: reset pas als echt nodig
  if (bestProb > 0.7) {
    detectionCount++;

    // ✅ Pas toekennen NA voldoende frames
    if (detectionCount >= REQUIRED_DETECTIONS) {
      detectedTeam = bestClass;

      detectEl.innerText =
        "Detected: " + detectedTeam + " (" + bestProb.toFixed(2) + ")";
    } else {
      detectEl.innerText = "Hold steady...";
    }
  } else {
    detectionCount = 0;
    detectedTeam = null;

    detectEl.innerText = "Detected: geen team (" + bestProb.toFixed(2) + ")";
  }

  // ===== GAME FLOW =====

  // ✅ Intro → countdown
  if (gameState === "intro" && detectedTeam !== null) {
    gameState = "countdown";
    startCountdown();
  }

  // ✅ Playing → score (maar pas NA stabiele detectie)
  if (
    gameState === "playing" &&
    detectedTeam !== null &&
    !driverLocked &&
    detectionCount >= REQUIRED_DETECTIONS
  ) {
    driverLocked = true;

    if (normalizeTeamName(detectedTeam) === normalizeTeamName(currentTeam)) {
      score++;
      updateScore();
      showFeedback(true);
    } else {
      showFeedback(false);
    }

    gameState = "cooldown";
  }

  // ✅ Cooldown → nieuwe driver
  if (gameState === "cooldown" && detectedTeam === null && !cooldownActive) {
    cooldownActive = true;

    setTimeout(() => {
      pickNewDriver();
      gameState = "playing";
      cooldownActive = false;
      driverLocked = false;
      detectionCount = 0; // ✅ reset stabiliteit
    }, TEAM_CHANGE_DELAY);
  }
}
