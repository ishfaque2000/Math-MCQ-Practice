// storage.js — LocalStorage helpers

const STORAGE_KEYS = {
  HISTORY: 'mathMcq_history',
  THEME:   'mathMcq_theme'
};

const Storage = {
  saveResult(result) {
    const history = this.getHistory();
    history.unshift(result);
    // Keep at most 50 entries
    if (history.length > 50) history.splice(50);
    try { localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)); } catch(e) {}
  },

  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
  },

  clearHistory() { localStorage.removeItem(STORAGE_KEYS.HISTORY); },

  getTheme() { return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark'; },
  setTheme(theme) { localStorage.setItem(STORAGE_KEYS.THEME, theme); }
};
