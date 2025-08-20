const video = document.getElementById("webcam");
const status = document.getElementById("status");
const predictionEl = document.getElementById("prediction");

let model;

// Load the ASL model
async function loadModel() {
  try {
    status.textContent = "Loading ASL model...";
    // Update the path to your model.json
    model = await tf.loadLayersModel("model/model.json");
    status.textContent = "Model loaded!";
  } catch (err) {
    console.error("Error loading model:", err);
    status.textContent = `Model load error: ${err.message}`;
  }
}

// Initialize camera
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    status.textContent = "Camera is live!";
    
    await loadModel();
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

  async function loop() {
    if (video.readyState === video.HAVE_ENOUGH_DATA && model) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Preprocess the frame for your model
      let img = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([64, 64]) // depends on your model input
        .mean(2)
        .toFloat()
        .expandDims(0)
        .expandDims(-1)
        .div(255.0);

      const prediction = model.predict(img);
      const predictedIndex = prediction.argMax(-1).dataSync()[0];
      
      // Map index to letter (update this array if your model classes differ)
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      predictionEl.textContent = `Prediction: ${letters[predictedIndex]}`;

      tf.dispose([img, prediction]);
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// Start everything
window.addEventListener("load", initCamera);
