const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const results = document.getElementById('results');

// Highlight for drag & drop
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

// Handle drop
dropArea.addEventListener('drop', (e) => {
  const items = e.dataTransfer.items;
  const files = [];

  // Convert DataTransferItemList to File[]
  for (let i = 0; i < items.length; i++) {
    const item = items[i].webkitGetAsEntry();
    if (item) readEntry(item, files);
  }

  setTimeout(() => handleFiles(files), 500); // small delay to collect all
});

// Click to select
dropArea.addEventListener('click', () => fileElem.click());
fileElem.addEventListener('change', () => handleFiles(Array.from(fileElem.files)));

// Recursively read folders
function readEntry(entry, fileList) {
  if (entry.isFile) {
    entry.file(file => fileList.push(file));
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    dirReader.readEntries(entries => {
      entries.forEach(e => readEntry(e, fileList));
    });
  }
}

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
