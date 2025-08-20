async function scanRepo(repoUrl) {
  const output = document.getElementById('output');
  output.textContent = "Scanning...";

  try {
    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error("Invalid GitHub URL");
    const owner = match[1];
    const repo = match[2];

    // Fetch all files in repo recursively
    const files = await fetchRepoContents(owner, repo);
    let results = [];

    for (const file of files) {
      if (file.type === "file") {
        const res = await fetch(file.download_url);
        const text = await res.text();

        // Simple regex to detect API keys / tokens / secrets
        const keyPattern = /(api[_-]?key|secret|token)["']?\s*[:=]\s*["'][^"']+["']/gi;
        const matches = text.match(keyPattern);
        if (matches) {
          results.push(`Found in ${file.path}:\n  ${matches.join("\n  ")}`);
        }
      }
    }

    output.textContent = results.length ? results.join("\n\n") : "No API keys found.";

  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
}

async function fetchRepoContents(owner, repo, path = "") {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();

  let allFiles = [];
  for (const item of data) {
    if (item.type === "dir") {
      const subFiles = await fetchRepoContents(owner, repo, item.path);
      allFiles = allFiles.concat(subFiles);
    } else {
      allFiles.push(item);
    }
  }
  return allFiles;
}

// Event listener for the scan button
document.getElementById('scanBtn').addEventListener('click', () => {
  const url = document.getElementById('repoUrl').value;
  scanRepo(url);
});
