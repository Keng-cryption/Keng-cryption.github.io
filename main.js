const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const results = document.getElementById('results');
const keywordInput = document.getElementById('keyword');

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

// File processing
function handleFiles(files) {
  results.innerHTML = '';
  const keyword = keywordInput.value.trim();
  if (!keyword) {
    alert('Please enter a keyword to search!');
    return;
  }

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      const lines = content.split(/\r?\n/);
      const fileDiv = document.createElement('div');
      fileDiv.classList.add('file-item');
      let html = `<strong>${file.name}</strong><br>`;

      lines.forEach((line, idx) => {
        if (line.includes(keyword)) {
          html += `<span class="found">Line ${idx+1}: Found</span><br>`;
        } else {
          html += `<span class="not-found">Line ${idx+1}: Not found</span><br>`;
        }
      });

      fileDiv.innerHTML = html;
      results.appendChild(fileDiv);
    };
    reader.readAsText(file);
  });
}
