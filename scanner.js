async function initCamera() {
  const video = document.getElementById("video");
  const status = document.getElementById("status");

  try {
    console.log("Requesting camera...");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 480, height: 360 }
    });

    // Attach stream to video element
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      status.textContent = "✅ Camera is running!";
      status.style.color = "green";
      console.log("Camera started successfully");
    };
  } catch (err) {
    status.textContent = "❌ Could not access camera: " + err.message;
    status.style.color = "red";
    console.error("Camera error:", err);
  }
}

initCamera();
