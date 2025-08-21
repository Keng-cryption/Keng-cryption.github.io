const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const results = document.getElementById('results');

// Drag & Drop highlight
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('highlight');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('highlight');
  }, false);
});

// Drop handler
dropArea.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// Click to select
dropArea.addEventListener('click', () => fileElem.click());
fileElem.addEventListener('change', () => handleFiles(fileElem.files));

// Simple API key detection patterns
const apiKeyPatterns = [
  /sk-[A-Za-z0-9]{48,}/g, // OpenAI key
  /[A-Za-z0-9]{32,}/g     // Generic alphanumeric key (optional)
];

function handleFiles(files) {
  results.innerHTML = '';

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      const lines = content.split(/\r?\n/);
      const fileDiv = document.createElement('div');
      fileDiv.classList.add('file-item');
      let html = `<strong>${file.name}</strong><br>`;

      lines.forEach((line, idx) => {
        let found = false;
        apiKeyPatterns.forEach(pattern => {
          if (pattern.test(line)) {
            found = true;
          }
        });
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
