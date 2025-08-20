const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileElem");
const resultsDiv = document.getElementById("results");

// Regex patterns for API keys
const API_KEY_PATTERNS = {
    "OpenAI": /sk-[A-Za-z0-9]{32,}/g,
    "Google API": /AIza[0-9A-Za-z\-_]{35}/g,
    "AWS Access Key": /AKIA[0-9A-Z]{16}/g,
    "GitHub Token": /ghp_[0-9a-zA-Z]{36}/g,
    "Slack Token": /xox[baprs]-[0-9A-Za-z-]{10,48}/g,
    "Generic Hex Key": /[A-Fa-f0-9]{32,64}/g
};

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() { dropArea.classList.add('highlight'); }
function unhighlight() { dropArea.classList.remove('highlight'); }

['dragenter','dragover','dragleave','drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false)
});

['dragenter','dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false)
});

['dragleave','drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false)
});

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

dropArea.addEventListener('drop', e => {
  const dt = e.dataTransfer;
  handleFiles(dt.files);
});

function handleFiles(files) {
  resultsDiv.textContent = '';
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target.result;
      const findings = [];
      for (const [name, pattern] of Object.entries(API_KEY_PATTERNS)) {
        if (pattern.test(content)) {
          findings.push(name);
        }
      }
      if (findings.length) {
        resultsDiv.textContent += `[!] ${file.name} contains possible API keys:\n - ${findings.join('\n - ')}\n\n`;
      } else {
        resultsDiv.textContent += `[✓] ${file.name}: No API keys found\n\n`;
      }
    };
    reader.onerror = e => {
      resultsDiv.textContent += `[x] Error reading ${file.name}\n\n`;
    };
    reader.readAsText(file);
  });
}
