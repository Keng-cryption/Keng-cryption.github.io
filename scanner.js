// server.js
const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Regex patterns for API keys
const API_KEY_PATTERNS = {
    "OpenAI": /sk-[A-Za-z0-9]{32,}/g,
    "Google API": /AIza[0-9A-Za-z\-_]{35}/g,
    "AWS Access Key": /AKIA[0-9A-Z]{16}/g,
    "GitHub Token": /ghp_[0-9a-zA-Z]{36}/g,
    "Slack Token": /xox[baprs]-[0-9A-Za-z-]{10,48}/g,
    "Generic Hex Key": /[A-Fa-f0-9]{32,64}/g
};

app.post('/scan-repo', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.json({ error: 'No repo URL provided' });

    try {
        // Extract owner and repo
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return res.json({ error: 'Invalid GitHub repo URL' });
        const owner = match[1];
        const repo = match[2];

        // Get repo tree from GitHub API (only master/main branch)
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`);
        const treeData = await treeRes.json();
        if (!treeData.tree) return res.json({ error: 'Could not fetch repo files' });

        const results = [];

        // Loop through files
        for (const file of treeData.tree) {
            if (file.type !== 'blob') continue; // skip directories
            try {
                const fileRes = await fetch(file.url);
                const fileData = await fileRes.json();
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
                results.push(`[x] Error reading ${file.path}`);
            }
        }

        res.json({ results });
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
