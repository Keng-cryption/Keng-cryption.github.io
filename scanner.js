// Common API key regex patterns
const patterns = {
  "OpenAI": /sk-[A-Za-z0-9]{32,}/g,
  "Google API": /AIza[0-9A-Za-z\-_]{35}/g,
  "AWS Access Key": /AKIA[0-9A-Z]{16}/g,
  "GitHub Token": /ghp_[0-9a-zA-Z]{36}/g,
  "Slack Token": /xox[baprs]-[0-9A-Za-z-]{10,48}/g,
  "Generic Hex Key": /\b[A-Fa-f0-9]{32,64}\b/g
};

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileElem");
const resultsDiv = document.getElementById("results");

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
  resultsDiv.textContent = ""; // clear old results

  for (let file of files) {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      let findings = [];

      for (const [name, regex] of Object.entries(patterns)) {
        if (regex.test(content)) {
          findings.push(name);
        }
      }

      if (findings.length > 0) {
        resultsDiv.textContent += `⚠️ ${file.name} contains possible API keys:\n - ${findings.join("\n - ")}\n\n`;
      } else {
        resultsDiv.textContent += `✅ ${file.name}: No API keys found\n\n`;
      }
    };
    reader.readAsText(file);
  }
}
