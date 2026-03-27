const LANGUAGE_EXTENSIONS = {
  'C': '.c',
  'C++': '.cpp',
  'C#': '.cs',
  'Bash': '.sh',
  'Dart': '.dart',
  'Elixir': '.ex',
  'Erlang': '.erl',
  'Go': '.go',
  'Java': '.java',
  'JavaScript': '.js',
  'Kotlin': '.kt',
  'MySQL': '.sql',
  'MS SQL Server': '.sql',
  'Oracle': '.sql',
  'PHP': '.php',
  'Pandas': '.py',
  'PostgreSQL': '.sql',
  'Python': '.py',
  'Python3': '.py',
  'Racket': '.rkt',
  'Ruby': '.rb',
  'Rust': '.rs',
  'Scala': '.scala',
  'Swift': '.swift',
  'TypeScript': '.ts',
};

const GITHUB_API = 'https://api.github.com';

function githubHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

async function getExistingFile(token, repo, path) {
  const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
  const response = await fetch(url, { headers: githubHeaders(token) });
  if (response.status === 200) {
    return response.json();
  }
  return null;
}

async function createOrUpdateFile(token, repo, path, content, message, sha) {
  const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
  const body = { message, content: toBase64(content) };
  if (sha) body.sha = sha;

  const response = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `GitHub API error: ${response.status}`);
  }
  return response.json();
}

function generateProblemReadme(data) {
  const { question, language, runtime, runtimePercentile, memory, memoryPercentile, topicTags, timestamp } = data;
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];

  const difficultyBadge = {
    Easy: '![Easy](https://img.shields.io/badge/Difficulty-Easy-success)',
    Medium: '![Medium](https://img.shields.io/badge/Difficulty-Medium-warning)',
    Hard: '![Hard](https://img.shields.io/badge/Difficulty-Hard-critical)',
  };

  const tagsStr = topicTags.length
    ? topicTags.map((t) => `\`${t}\``).join(' ')
    : '_None_';

  return `# ${question.id}. ${question.title}

${difficultyBadge[question.difficulty] || question.difficulty}

## Problem

${question.content}

## Solution Stats

| Metric | Value |
|--------|-------|
| **Language** | ${language} |
| **Runtime** | ${runtime} (faster than ${Math.round(runtimePercentile)}%) |
| **Memory** | ${memory} (less than ${Math.round(memoryPercentile)}%) |
| **Submitted** | ${date} |

## Topics

${tagsStr}
`;
}

async function pushToGitHub(data) {
  const { githubToken, githubRepo, autoPush } = await chrome.storage.local.get([
    'githubToken',
    'githubRepo',
    'autoPush',
  ]);

  if (autoPush === false) return;
  if (!githubToken || !githubRepo) {
    showNotification(
      'Configuration Required',
      'Please set your GitHub token and repository in the extension popup.'
    );
    return;
  }

  const { question, code, language } = data;
  const ext = LANGUAGE_EXTENSIONS[language] || '.txt';
  const folderName = `${question.id}-${question.titleSlug}`;
  const difficulty = question.difficulty;
  const codePath = `${difficulty}/${folderName}/${folderName}${ext}`;
  const readmePath = `${difficulty}/${folderName}/README.md`;
  const commitMessage = `Add: ${question.id} - ${question.title} (${difficulty})`;

  try {
    const existingCode = await getExistingFile(githubToken, githubRepo, codePath);
    await createOrUpdateFile(
      githubToken,
      githubRepo,
      codePath,
      code,
      commitMessage,
      existingCode?.sha
    );

    const readmeContent = generateProblemReadme(data);
    const existingReadme = await getExistingFile(githubToken, githubRepo, readmePath);
    await createOrUpdateFile(
      githubToken,
      githubRepo,
      readmePath,
      readmeContent,
      `docs: ${question.id} - ${question.title}`,
      existingReadme?.sha
    );

    const { pushCount } = await chrome.storage.local.get('pushCount');
    await chrome.storage.local.set({ pushCount: (pushCount || 0) + 1 });

    showNotification(
      'Solution Pushed!',
      `${question.id}. ${question.title} (${difficulty}) pushed to ${githubRepo}`
    );
  } catch (err) {
    console.error('[LeetCode-GH] Push failed:', err);
    showNotification('Push Failed', err.message);
  }
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title,
    message,
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'pushToGitHub') {
    pushToGitHub(request.data).then(() => sendResponse({ success: true }));
    return true;
  }

  if (request.action === 'validateGitHub') {
    const { token, repo } = request;
    fetch(`${GITHUB_API}/repos/${repo}`, { headers: githubHeaders(token) })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token or repository');
        return res.json();
      })
      .then((data) =>
        sendResponse({
          valid: true,
          repoName: data.full_name,
          private: data.private,
        })
      )
      .catch((err) => sendResponse({ valid: false, error: err.message }));
    return true;
  }
});
