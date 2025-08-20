<!DOCTYPE html>
<html>
<head>
  <title>ASL Translator (Browser-Based)</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #1E2229;
      color: white;
      text-align: center;
    }
    #output {
      font-size: 1.5em;
      margin-top: 10px;
    }
    canvas, video {
      border-radius: 10px;
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <h1>Live ASL Translator</h1>
  <p id="output">Detecting...</p>
  <video id="video" width="640" height="480" autoplay muted></video>
  <canvas id="canvas" width="640" height="480"></canvas>

  <script type="module">
    import { Hands } from 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
    import { drawConnectors, drawLandmarks } from 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
    import { Camera } from 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('output');

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults(results => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, { color: '#00FF00' });
        drawLandmarks(ctx, landmarks, { color: '#FF0000' });

        const fingerState = detectFingers(landmarks);
        output.textContent = `Fingers: ${fingerState.join(', ')}`;
      } else {
        output.textContent = 'No hand detected';
      }
    });

    function detectFingers(lm) {
      // Simple logic: check if fingertip is above its middle joint
      return [
        lm[4].x < lm[3].x ? 1 : 0,   // Thumb
        lm[8].y < lm[6].y ? 1 : 0,   // Index
        lm[12].y < lm[10].y ? 1 : 0, // Middle
        lm[16].y < lm[14].y ? 1 : 0, // Ring
        lm[20].y < lm[18].y ? 1 : 0  // Pinky
      ];
    }

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480
    });
    camera.start();
  </script>
</body>
</html>

