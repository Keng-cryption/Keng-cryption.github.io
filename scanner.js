const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const fileList = document.getElementById('file-list');

// Highlight on drag
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
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// Click to open file selector
dropArea.addEventListener('click', () => {
  fileElem.click();
});

fileElem.addEventListener('change', () => {
  handleFiles(fileElem.files);
});

// Display files
function handleFiles(files) {
  fileList.innerHTML = ''; // Clear previous
  Array.from(files).forEach(file => {
    const item = document.createElement('div');
    item.classList.add('file-item');
    item.textContent = `File: ${file.name} (${file.size} bytes)`;
    fileList.appendChild(item);

    // Optional: read file content
    const reader = new FileReader();
    reader.onload = () => {
      console.log(`Content of ${file.name}:`, reader.result);
    };
    reader.readAsText(file);
  });
}
