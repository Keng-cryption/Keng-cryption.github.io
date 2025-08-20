// server.js
const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Your GitHub Personal Access Token (PAT)
// Keep this secret! Do NOT put it in frontend code
const GITHUB_TOKEN = 'YOUR_PERSONAL_ACCESS_TOKEN';

// Regex patterns for API keys
const API_KEY_PATTERNS = {
    "OpenAI": /sk-[A-Za-z0-9]{32,}/g,
    "Google API": /AIza[0-9A-Za-z\-_]{35}/g,
    "AWS Access Key": /AKIA[0-9A-Z]{16}/g,
    "GitHub Token": /ghp_[0-9a-zA-Z]{36}/g,
    "Slack Token": /xox[baprs]-[0-9A-Za-z-]{10,48}/g,
    "Generic Hex Key": /[A-Fa-f0-9]{32,64}/g
};

// Helper: fetch JSON from GitHub API with token
async function githubFetch(url) {
    const res = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    return res.json();
}

// Scan every file in the repo recursively
async function scanRepo(owner, repo) {
    const results = [];

    // Get default branch dynamically
    const repoInfo = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
    const branch = repoInfo.default_branch;

    // Fetch repo tree recursively
    const treeData = await githubFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    if (!treeData.tree || !Array.isArray(treeData.tree)) {
        return ['Error: No files found or failed to fetch repository tree.'];
    }

    for (const file of treeData.tree) {
        if (file.type !== 'blob') continue; // skip directories
        try {
            const fileData = await githubFetch(file.url);
            const content = Buffer.from(fileData.content || '', 'base64').toString('utf-8');

            const findings = [];
            for (const [name, pattern] of Object.entries(API_KEY_PATTERNS)) {
                if (pattern.test(content)) findings.push(name);
            }

            if (findings.length) {
                results.push(`[!] ${file.path} contains possible API keys:\n - ${findings.join('\n - ')}`);
            } else {
                results.push(`[✓] ${file.path}: No API keys found`);
            }
        } catch (err) {
            results.push(`[x] Error reading ${file.path}: ${err.message}`);
        }
    }

    return results;
}

app.post('/scan-repo', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.json({ error: 'No repo URL provided' });

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return res.json({ error: 'Invalid GitHub repo URL' });

    const owner = match[1];
    const repo = match[2];

    try {
        const results = await scanRepo(owner, repo);
        res.json({ results });
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
