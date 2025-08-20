let currentWord = "";
let lastLetter = "";

function clearWord() {
  currentWord = "";
  lastLetter = "";
  document.getElementById("word").textContent = "Current Word: ";
  document.getElementById("fingers").textContent = "Finger State: ";
}

// Finger detection helpers
function fingerUp(lm, tip, pip) { return lm[tip].y < lm[pip].y; }
function getFingerStates(lm) {
  return {
    thumb: lm[4].x < lm[3].x,
    index: fingerUp(lm, 8, 6),
    middle: fingerUp(lm, 12, 10),
    ring: fingerUp(lm, 16, 14),
    pinky: fingerUp(lm, 20, 18)
  };
}

const LETTER_SIGNS = {
  'A': {thumb:true,fingers:[0,0,0,0]}, 'B': {thumb:false,fingers:[1,1,1,1]},
  'C': {thumb:true,fingers:[1,0,0,1]}, 'D': {thumb:false,fingers:[1,0,0,0]},
  'E': {thumb:false,fingers:[0,0,0,0]}, 'F': {thumb:true,fingers:[0,1,1,1]},
  'G': {thumb:true,fingers:[0,1,1,0]}, 'H': {thumb:false,fingers:[1,1,0,0]},
  'I': {thumb:false,fingers:[0,0,0,1]}, 'K': {thumb:false,fingers:[1,0,1,1]},
  'L': {thumb:true,fingers:[1,0,0,0]}, 'M': {thumb:false,fingers:[0,1,1,0]},
  'N': {thumb:true,fingers:[1,1,1,0]}, 'O': {thumb:true,fingers:[0,0,1,1]},
  'P': {thumb:true,fingers:[1,0,1,1]}, 'Q': {thumb:true,fingers:[0,1,0,0]},
  'R': {thumb:false,fingers:[1,1,0,1]}, 'S': {thumb:false,fingers:[0,1,0,1]},
  'T': {thumb:false,fingers:[0,0,1,0]}, 'U': {thumb:true,fingers:[1,1,0,1]},
  'V': {thumb:true,fingers:[1,1,0,0]}, 'W': {thumb:false,fingers:[1,1,1,0]},
  'Y': {thumb:true,fingers:[0,0,0,1]}, ' ': {thumb:true,fingers:[1,1,1,1]},
};

function classifyLetter(f) {
  const fingersArr = [Number(f.index), Number(f.middle), Number(f.ring), Number(f.pinky)];
  for (const [letter, pattern] of Object.entries(LETTER_SIGNS)) {
    if (f.thumb === pattern.thumb && JSON.stringify(fingersArr) === JSON.stringify(pattern.fingers)) {
      return letter;
    }
  }
  return null;
}

// Setup MediaPipe Hands
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const ctx = canvasElement.getContext("2d");

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({maxNumHands:1, minDetectionConfidence:0.5, minTrackingConfidence:0.5});

hands.onResults(results => {
  ctx.save();
  ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
  
  // Draw video frame
  ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0];
    const fingers = getFingerStates(lm);

    const fingerList = [Number(fingers.thumb), Number(fingers.index), Number(fingers.middle),
                        Number(fingers.ring), Number(fingers.pinky)];
    document.getElementById("fingers").textContent = "Finger State: " + fingerList.join(", ");

    const letter = classifyLetter(fingers);
    if (letter && letter !== lastLetter) {
      currentWord += letter;
      lastLetter = letter;
    } else if (!letter) {
      lastLetter = "";
    }
    document.getElementById("word").textContent = "Current Word: " + currentWord;

    // Draw hand landmarks
    drawConnectors(ctx, lm, HAND_CONNECTIONS, {color:'#00FF00', lineWidth:2});
    drawLandmarks(ctx, lm, {color:'#FF0000', lineWidth:1});
  }
  ctx.restore();
});

// Start camera
const camera = new Camera(videoElement, {
  onFrame: async () => { await hands.send({image: videoElement}); },
  width: 480,
  height: 360
});
camera.start();
