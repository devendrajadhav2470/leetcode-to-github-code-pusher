const Storage = {
  async get(keys) {
    return chrome.storage.local.get(keys);
  },

  async set(data) {
    return chrome.storage.local.set(data);
  },

  async getToken() {
    const { githubToken } = await this.get('githubToken');
    return githubToken || '';
  },

  async setToken(token) {
    return this.set({ githubToken: token });
  },

  async getRepo() {
    const { githubRepo } = await this.get('githubRepo');
    return githubRepo || '';
  },

  async setRepo(repo) {
    return this.set({ githubRepo: repo });
  },

  async isEnabled() {
    const { autoPush } = await this.get('autoPush');
    return autoPush !== false;
  },

  async setEnabled(enabled) {
    return this.set({ autoPush: enabled });
  },

  async incrementCount() {
    const { pushCount } = await this.get('pushCount');
    const newCount = (pushCount || 0) + 1;
    await this.set({ pushCount: newCount });
    return newCount;
  },

  async getCount() {
    const { pushCount } = await this.get('pushCount');
    return pushCount || 0;
  },
};
