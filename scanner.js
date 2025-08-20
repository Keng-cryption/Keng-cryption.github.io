const video = document.getElementById("webcam");
const status = document.getElementById("status");
const predictionEl = document.getElementById("prediction");

// Placeholder for your ASL model
// Replace this with your actual ML/ASL inference code
function mockASLPrediction(frame) {
  // For testing: randomly return a letter
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomIndex = Math.floor(Math.random() * letters.length);
  return letters[randomIndex];
}

// Initialize camera
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    status.textContent = "Camera is live!";

    // Start ASL detection loop
    detectASL();
  } catch (err) {
    console.error("Error accessing camera:", err);
    status.textContent = `Camera error: ${err.message}`;
  }
}

// ASL detection loop
function detectASL() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  function loop() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Here you would pass canvas/frame to your ASL model
      const predictedLetter = mockASLPrediction(canvas); // replace with real model
      predictionEl.textContent = `Prediction: ${predictedLetter}`;
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// Start everything
window.addEventListener("load", initCamera);
