document.addEventListener('DOMContentLoaded', init);

async function init() {
  const tokenInput = document.getElementById('github-token');
  const repoInput = document.getElementById('github-repo');
  const toggleToken = document.getElementById('toggle-token');
  const saveBtn = document.getElementById('save-btn');
  const validateBtn = document.getElementById('validate-btn');
  const autoPushToggle = document.getElementById('auto-push-toggle');
  const pushCountEl = document.getElementById('push-count');

  const stored = await chrome.storage.local.get([
    'githubToken',
    'githubRepo',
    'autoPush',
    'pushCount',
  ]);

  tokenInput.value = stored.githubToken || '';
  repoInput.value = stored.githubRepo || '';
  autoPushToggle.checked = stored.autoPush !== false;
  pushCountEl.textContent = stored.pushCount || 0;

  toggleToken.addEventListener('click', () => {
    tokenInput.type = tokenInput.type === 'password' ? 'text' : 'password';
  });

  saveBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const repo = repoInput.value.trim();

    if (!token || !repo) {
      showStatus('Please fill in both fields', 'error');
      return;
    }

    if (!repo.includes('/')) {
      showStatus('Repository must be in owner/repo format', 'error');
      return;
    }

    await chrome.storage.local.set({ githubToken: token, githubRepo: repo });
    showStatus('Settings saved successfully!', 'success');
  });

  validateBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const repo = repoInput.value.trim();

    if (!token || !repo) {
      showStatus('Please fill in both fields first', 'error');
      return;
    }

    validateBtn.disabled = true;
    validateBtn.textContent = 'Checking...';

    chrome.runtime.sendMessage(
      { action: 'validateGitHub', token, repo },
      (response) => {
        validateBtn.disabled = false;
        validateBtn.textContent = 'Validate';

        if (response?.valid) {
          showStatus(
            `Connected to ${response.repoName} (${response.private ? 'private' : 'public'})`,
            'success'
          );
        } else {
          showStatus(response?.error || 'Validation failed', 'error');
        }
      }
    );
  });

  autoPushToggle.addEventListener('change', () => {
    chrome.storage.local.set({ autoPush: autoPushToggle.checked });
  });
}

function showStatus(message, type) {
  const banner = document.getElementById('status-banner');
  const text = document.getElementById('status-text');

  banner.classList.remove('hidden', 'success', 'error');
  banner.classList.add(type);
  text.textContent = message;

  setTimeout(() => banner.classList.add('hidden'), 4000);
}
