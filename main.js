const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const results = document.getElementById('results');

// Click to open folder selector
dropArea.addEventListener('click', () => fileElem.click());

fileElem.addEventListener('change', () => handleFiles(Array.from(fileElem.files)));

// API key patterns
const apiKeyPatterns = [
  /sk-[A-Za-z0-9]{48,}/g, // OpenAI
  /[A-Za-z0-9]{32,}/g     // Generic
];

function handleFiles(files) {
  results.innerHTML = '';
  if (!files.length) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      const lines = content.split(/\r?\n/);
      const fileDiv = document.createElement('div');
      fileDiv.classList.add('file-item');
      let html = `<strong>${file.name}</strong><br>`;

      lines.forEach((line, idx) => {
        let found = apiKeyPatterns.some(pattern => pattern.test(line));
        html += found
          ? `<span class="found">Line ${idx+1}: API key detected!</span><br>`
          : `<span class="not-found">Line ${idx+1}: No key</span><br>`;
      });

      fileDiv.innerHTML = html;
      results.appendChild(fileDiv);
    };
    reader.readAsText(file);
  });
}
