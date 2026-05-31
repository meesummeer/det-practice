/**
 * Shared utilities — localStorage, XP, streak, shuffle
 */
const DETStorage = (function () {
  const KEYS = {
    xp: 'det_xp',
    streak: 'det_streak',
    lastDay: 'det_last_day',
    learned: 'det_learned_words',
    highscores: 'det_highscores'
  };

  function get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function addXP(amount) {
    const xp = get(KEYS.xp, 0) + amount;
    set(KEYS.xp, xp);
    return xp;
  }

  function getXP() {
    return get(KEYS.xp, 0);
  }

  function touchStreak() {
    const today = new Date().toDateString();
    const last = localStorage.getItem(KEYS.lastDay);
    let streak = get(KEYS.streak, 0);
    if (last === today) return streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (last === yesterday.toDateString()) streak += 1;
    else streak = 1;
    set(KEYS.streak, streak);
    localStorage.setItem(KEYS.lastDay, today);
    return streak;
  }

  function getStreak() {
    return get(KEYS.streak, 0);
  }

  function saveHighscore(game, score) {
    const all = get(KEYS.highscores, {});
    if (!all[game] || score > all[game]) {
      all[game] = score;
      set(KEYS.highscores, all);
    }
    return all[game];
  }

  function getHighscore(game) {
    return get(KEYS.highscores, {})[game] || 0;
  }

  return { KEYS, get, set, addXP, getXP, touchStreak, getStreak, saveHighscore, getHighscore };
})();

function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
}

/** @deprecated Use WritingAI.checkWriting in js/writing-ai.js */
function judgeWriting(text, minWords, prompt) {
  const wc = (text || '').trim() ? text.trim().split(/\s+/).length : 0;
  return {
    score: null,
    wordCount: wc,
    meetsMin: wc >= (minWords || 0),
    feedback: 'Use Check My Writing for AI feedback.'
  };
}
