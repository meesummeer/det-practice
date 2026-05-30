/**
 * DET Practice Simulator — Test engine
 */
(function () {
  const $ = id => document.getElementById(id);

  const screens = {
    welcome: $('screen-welcome'),
    test: $('screen-test'),
    break: $('screen-break'),
    results: $('screen-results')
  };

  const state = {
    questions: [],
    index: 0,
    answers: {},
    skipped: new Set(),
    ui: {},
    breaksShown: new Set(),
    view: 'welcome',
    pendingBreakSection: null,
    timerIntervals: {},
    timerRemaining: {}
  };

  let questionArea = null;
  let timerTick = null;

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    state.view = name;
  }

  function currentQuestion() {
    return state.questions[state.index];
  }

  function saveAnswer(q, ans) {
    state.answers[q.id] = { ...state.answers[q.id], ...ans };
  }

  function persistCurrentAnswer() {
    const q = currentQuestion();
    if (!q || !questionArea) return;
    const collected = Renderer.collectAnswer(q, questionArea);
    if (Object.keys(collected).length) {
      saveAnswer(q, collected);
    }
    const ui = state.ui[q.id] || {};
    state.ui[q.id] = ui;
  }

  function pauseTimer(qid) {
    if (timerTick) {
      clearInterval(timerTick);
      timerTick = null;
    }
  }

  function getTimerSeconds(q) {
    return typeof getTimerForType === 'function' ? getTimerForType(q.type) : 0;
  }

  function startTimer(q) {
    const total = getTimerSeconds(q);
    if (!total) {
      $('topbar-timer').textContent = '';
      $('topbar-timer').className = 'timer-display';
      return;
    }
    if (state.timerRemaining[q.id] === undefined) {
      state.timerRemaining[q.id] = total;
    }
    updateTimerDisplay(q);
    pauseTimer();
    timerTick = setInterval(() => {
      if (state.timerRemaining[q.id] > 0) {
        state.timerRemaining[q.id]--;
        updateTimerDisplay(q);
      } else {
        pauseTimer();
      }
    }, 1000);
  }

  function updateTimerDisplay(q) {
    const el = $('topbar-timer');
    const rem = state.timerRemaining[q.id];
    if (!rem && rem !== 0) {
      el.textContent = '';
      return;
    }
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    el.textContent = `${m}:${String(s).padStart(2, '0')}`;
    el.className = 'timer-display';
    if (rem <= 10) el.classList.add('critical');
    else if (rem <= 30) el.classList.add('warning');
  }

  function renderQuestion() {
    const q = currentQuestion();
    if (!q) return finishTest();

    $('topbar-section').textContent = q.sectionName || 'Practice';
    questionArea = $('question-area');
    questionArea.innerHTML = '';

    const ans = state.answers[q.id];
    const ui = state.ui[q.id] || {};

    Renderer.render(q, ans, questionArea, ui);

    questionArea.onAnswerChange = data => {
      saveAnswer(q, data);
      if (['read-aloud', 'speak-photo', 'read-then-speak'].includes(q.type)) {
        renderQuestion();
      }
      updateNavDots();
    };

    startTimer(q);
    updateProgress();
    updateNavDots();
    updateNavButtons();
  }

  function updateProgress() {
    const pct = state.questions.length
      ? Math.round(((state.index + 1) / state.questions.length) * 100)
      : 0;
    const bar = $('progress-bar');
    bar.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', String(pct));
  }

  function updateNavDots() {
    const dots = $('nav-dots');
    dots.innerHTML = '';
    const maxDots = Math.min(state.questions.length, 15);
    const step = state.questions.length > maxDots
      ? Math.floor(state.questions.length / maxDots)
      : 1;
    for (let i = 0; i < state.questions.length; i += step) {
      const d = document.createElement('span');
      d.className = 'nav-dot';
      if (i === state.index) d.classList.add('current');
      if (state.answers[state.questions[i].id]) d.classList.add('answered');
      dots.appendChild(d);
    }
  }

  function updateNavButtons() {
    $('btn-back').disabled = state.index === 0;
  }

  function nextSectionBreakTarget(fromIndex) {
    const curr = state.questions[fromIndex];
    const next = state.questions[fromIndex + 1];
    if (!curr || !next) return null;
    const currSec = curr.sectionId;
    const nextSec = next.sectionId;
    if (currSec === nextSec) return null;
    if (state.breaksShown.has(nextSec)) return null;
    return nextSec;
  }

  function showSectionBreak(sectionId) {
    const sec = SECTIONS.find(s => s.id === sectionId);
    if (!sec) return continueAfterBreak(sectionId);

    pauseTimer();
    persistCurrentAnswer();

    const tips = sec.breakTips.map(t => `<li>${escapeHtml(t)}</li>`).join('');
    $('break-content').innerHTML = `
      <h2>${escapeHtml(sec.breakTitle)}</h2>
      <p>Section complete: <strong>${escapeHtml(sec.name)}</strong> is done. Take a breath before the next part.</p>
      <ul class="break-tips">${tips}</ul>`;

    state.pendingBreakSection = sectionId;
    showScreen('break');
  }

  function continueAfterBreak() {
    if (state.pendingBreakSection) {
      state.breaksShown.add(state.pendingBreakSection);
    }
    state.pendingBreakSection = null;
    if (state.index < state.questions.length - 1) {
      state.index++;
    }
    showScreen('test');
    renderQuestion();
  }

  function goNext() {
    persistCurrentAnswer();
    pauseTimer();

    if (state.index >= state.questions.length - 1) {
      finishTest();
      return;
    }

    const breakSec = nextSectionBreakTarget(state.index);
    if (breakSec) {
      showSectionBreak(breakSec);
      return;
    }

    state.index++;
    renderQuestion();
  }

  function goBack() {
    if (state.pendingBreakSection) {
      state.pendingBreakSection = null;
      showScreen('test');
      renderQuestion();
      return;
    }
    persistCurrentAnswer();
    pauseTimer();
    if (state.index <= 0) return;
    state.index--;
    renderQuestion();
  }

  function skipQuestion() {
    const q = currentQuestion();
    if (q) state.skipped.add(q.id);
    goNext();
  }

  function toggleHint() {
    const q = currentQuestion();
    if (!q) return;
    if (!state.ui[q.id]) state.ui[q.id] = {};
    state.ui[q.id].showHint = !state.ui[q.id].showHint;
    renderQuestion();
  }

  function toggleReveal() {
    const q = currentQuestion();
    if (!q) return;
    if (!state.ui[q.id]) state.ui[q.id] = {};
    state.ui[q.id].showReveal = !state.ui[q.id].showReveal;
    renderQuestion();
  }

  function startTest() {
    state.questions = buildSessionQuestions();
    state.index = 0;
    state.answers = {};
    state.skipped = new Set();
    state.ui = {};
    state.breaksShown = new Set();
    state.timerRemaining = {};
    state.pendingBreakSection = null;

    if (!state.questions.length) {
      alert('No questions available. Check questions.js');
      return;
    }

    showScreen('test');
    renderQuestion();
  }

  function finishTest() {
    persistCurrentAnswer();
    pauseTimer();
    const data = Results.computeScores(state.questions, state.answers, state.skipped);
    Results.renderResults($('results-content'), data);
    showScreen('results');
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  $('btn-start').addEventListener('click', startTest);
  $('btn-next').addEventListener('click', () => {
    if (state.view === 'test') goNext();
  });
  $('btn-back').addEventListener('click', goBack);
  $('btn-skip').addEventListener('click', skipQuestion);
  $('btn-hint').addEventListener('click', toggleHint);
  $('btn-reveal').addEventListener('click', toggleReveal);
  $('btn-break-continue').addEventListener('click', continueAfterBreak);
  $('btn-retake').addEventListener('click', startTest);
  $('btn-home').addEventListener('click', () => showScreen('welcome'));
})();
