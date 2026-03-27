const GitHubAPI = {
  BASE_URL: 'https://api.github.com',

  _headers(token) {
    return {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  },

  async getFile(token, repo, path) {
    const url = `${this.BASE_URL}/repos/${repo}/contents/${encodeURIComponent(path)}`;
    const response = await fetch(url, { headers: this._headers(token) });
    if (response.status === 200) {
      return response.json();
    }
    return null;
  },

  async createOrUpdateFile(token, repo, path, content, commitMessage, sha) {
    const url = `${this.BASE_URL}/repos/${repo}/contents/${path}`;
    const body = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(content))),
    };
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: this._headers(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  },

  async validateCredentials(token, repo) {
    const url = `${this.BASE_URL}/repos/${repo}`;
    const response = await fetch(url, { headers: this._headers(token) });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid token or repository');
    }
    const data = await response.json();
    return {
      valid: true,
      repoName: data.full_name,
      private: data.private,
      permissions: data.permissions,
    };
  },
};
