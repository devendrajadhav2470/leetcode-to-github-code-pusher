# LeetCode to GitHub Code Pusher

A Chrome extension that **automatically pushes your accepted LeetCode solutions** to a GitHub repository — organized by difficulty, with problem descriptions and submission stats.

## Features

- **Automatic detection** of accepted submissions on LeetCode
- **One-click setup** — just add your GitHub token and repository
- **Organized structure** — solutions are filed under `Easy/`, `Medium/`, `Hard/` folders
- **Problem README** — each solution includes a README with the problem description, runtime/memory stats, and topic tags
- **Toggle on/off** — disable auto-push anytime from the popup

## How It Works

1. You solve a problem on [leetcode.com](https://leetcode.com) and click **Submit**
2. The extension intercepts the submission response and waits for an **Accepted** verdict
3. It fetches your solution code and problem details via LeetCode's GraphQL API
4. The code is pushed to your configured GitHub repository via the GitHub Contents API

## Repository Structure (on GitHub)

```
Easy/
  1-two-sum/
    1-two-sum.py
    README.md
Medium/
  2-add-two-numbers/
    2-add-two-numbers.java
    README.md
Hard/
  ...
```

## Installation

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/devendrajadhav2470/leetcode-to-github-code-pusher.git
   ```
2. Open **Chrome** and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the cloned repository folder
5. The extension icon will appear in your toolbar

## Setup

1. **Create a GitHub Personal Access Token:**
   - Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
   - Click **Generate new token (classic)**
   - Select the **`repo`** scope
   - Copy the generated token

2. **Create a target repository** on GitHub where your solutions will be pushed (or use an existing one)

3. **Configure the extension:**
   - Click the extension icon in your toolbar
   - Paste your GitHub token
   - Enter the repository name in `owner/repo` format (e.g., `username/leetcode-solutions`)
   - Click **Save**
   - Optionally click **Validate** to verify the connection

4. **Solve problems!** — Every accepted submission will be automatically pushed

## Supported Languages

C, C++, C#, Bash, Dart, Elixir, Erlang, Go, Java, JavaScript, Kotlin, MySQL, MS SQL Server, Oracle, PHP, Pandas, PostgreSQL, Python, Python3, Racket, Ruby, Rust, Scala, Swift, TypeScript

## Architecture

```
manifest.json          → Extension configuration (Manifest V3)
src/
  background/
    background.js      → Service worker: GitHub push logic, message handling
  content/
    interceptor.js     → MAIN world script: intercepts fetch to detect submissions
    leetcode.js        → Content script: polls for acceptance, extracts submission data
  popup/
    popup.html/css/js  → Configuration UI
  utils/
    github.js          → GitHub REST API helpers
    leetcode-api.js    → LeetCode GraphQL query helpers
    storage.js         → chrome.storage wrappers
    languages.js       → Language-to-file-extension map
```

## Privacy

- Your GitHub token is stored **locally** in `chrome.storage.local` and never sent anywhere except the GitHub API
- The extension only activates on `leetcode.com/problems/*` pages
- No analytics or telemetry is collected

## License

[Apache License 2.0](LICENSE)
