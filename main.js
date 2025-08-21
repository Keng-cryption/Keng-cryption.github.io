// Regex patterns for API keys
const patterns = {
  "OpenAI": /sk-[A-Za-z0-9]{32,}/g,
  "Google API": /AIza[0-9A-Za-z\-_]{35}/g,
  "AWS Access Key": /AKIA[0-9A-Z]{16}/g,
  "GitHub Token": /ghp_[0-9a-zA-Z]{36}/g,
  "Slack Token": /xox[baprs]-[0-9A-Za-z-]{10,48}/g,
  "Stripe Key": /sk_live_[0-9a-zA-Z]{24,}/g,
  "Generic Hex Key": /\b[A-Fa-f0-9]{32,64}\b/g
};

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileElem");
const resultsDiv = document.getElementById("results");
const copyBtn = document.getElementById("copyBtn");

let report = "";

dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFiles);

["dragenter", "dragover"].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.style.background = "#eef";
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.style.background = "";
  });
});

dropArea.addEventListener("drop", e => {
  handleFiles({ target: { files: e.dataTransfer.files } });
});

function handleFiles(e) {
  const files = e.target.files;
  resultsDiv.textContent = ""; 
  report = "";

  for (let file of files) {
    if (file.size > MAX_BYTES) {
      const msg = `⚠️ Skipping ${file.name} (too large: ${(file.size/1024/1024).toFixed(2)} MB)\n\n`;
      resultsDiv.textContent += msg;
      report += msg;
      continue;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      const hits = findMatches(content);

      if (hits.length > 0) {
        let msg = `⚠️ ${file.name} contains possible API keys:\n`;
        hits.forEach(h => {
          msg += `   Line ${h.line} – ${h.name}: ${h.sample}\n`;
        });
        msg += "\n";
        resultsDiv.textContent += msg;
        report += msg;
      } else {
        const msg = `✅ ${file.name}: No API keys found\n\n`;
        resultsDiv.textContent += msg;
        report += msg;
      }
      copyBtn.style.display = "inline-block";
    };
    reader.readAsText(file);
  }
}

function findMatches(content) {
  const lines = content.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    for (const [name, regex] of Object.entries(patterns)) {
      regex.lastIndex = 0; 
      const matches = lines[i].match(regex);
      if (matches) {
        matches.forEach(m => {
          hits.push({
            name,
            line: i + 1,
            sample: m.slice(0, 6) + "•••"
          });
        });
      }
    }
  }
  return hits;
}

// Copy report to clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(report).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Report"), 1500);
  });
});
