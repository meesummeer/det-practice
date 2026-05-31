/**
 * DET Practice Test engine
 */
(function () {
  if (!document.getElementById('question-area')) return;

  const $ = id => document.getElementById(id);
  const questionArea = $('question-area');
  const tutorArea = $('tutor-area');
  const screens = { test: $('screen-test'), break: $('screen-break'), results: $('screen-results') };

  const state = {
    questions: [],
    index: 0,
    answers: {},
    grades: {},
    submitted: {},
    skipped: new Set(),
    ui: {},
    breaksShown: new Set(),
    pendingBreakSection: null,
    timerRemaining: {}
  };

  let timerTick = null;

  function show(name) {
    Object.values(screens).forEach(s => s && s.classList.remove('active'));
    screens[name]?.classList.add('active');
  }

  function currentQ() {
    return state.questions[state.index];
  }

  function pauseTimer() {
    if (timerTick) {
      clearInterval(timerTick);
      timerTick = null;
    }
  }

  function startTimer(q) {
    const total = getTimerForType(q.type);
    const el = $('topbar-timer');
    if (!total) {
      el.textContent = '';
      return;
    }
    if (state.timerRemaining[q.id] === undefined) state.timerRemaining[q.id] = total;
    tickDisplay(q);
    pauseTimer();
    timerTick = setInterval(() => {
      if (state.timerRemaining[q.id] > 0) {
        state.timerRemaining[q.id]--;
        tickDisplay(q);
      } else pauseTimer();
    }, 1000);
  }

  function tickDisplay(q) {
    const el = $('topbar-timer');
    const rem = state.timerRemaining[q.id];
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    el.textContent = `${m}:${String(s).padStart(2, '0')}`;
    el.className = 'timer-display' + (rem <= 10 ? ' critical' : rem <= 30 ? ' warning' : '');
  }

  function updateXPBar() {
    const pct = state.questions.length ? Math.round(((state.index + 1) / state.questions.length) * 100) : 0;
    $('xp-fill').style.width = `${pct}%`;
    $('progress-bar').style.width = `${pct}%`;
    $('progress-bar').setAttribute('aria-valuenow', String(pct));
  }

  function updateDots() {
    const wrap = $('nav-dots');
    wrap.innerHTML = '';
    state.questions.forEach((qu, i) => {
      const d = document.createElement('span');
      d.className = 'nav-dot';
      if (i === state.index) d.classList.add('current');
      if (state.submitted[qu.id]) d.classList.add('answered');
      wrap.appendChild(d);
    });
  }

  function renderCurrent() {
    const q = currentQ();
    if (!q) return finish();

    $('topbar-section').textContent = q.sectionName || 'Practice';
    const locked = !!state.submitted[q.id];
    const ans = state.answers[q.id];
    const ui = state.ui[q.id] || {};

    Renderer.render(q, ans, questionArea, ui, {
      locked,
      onChange: data => { state.answers[q.id] = { ...state.answers[q.id], ...data }; },
      onSubmit: data => submitAnswer(q, data),
      onAiCheck: isWritingType(q) ? payload => runAiWritingCheck(q, payload) : null
    });

    if (state.submitted[q.id] && state.grades[q.id]) {
      Tutor.renderPanel(tutorArea, q, state.grades[q.id], state.answers[q.id]);
      flashResult(state.grades[q.id].status);
    } else {
      Tutor.hide(tutorArea);
    }

    $('btn-back').disabled = state.index === 0 && !state.pendingBreakSection;
    updateDots();
    updateXPBar();
    startTimer(q);
  }

  function isWritingType(q) {
    return ['write-photo', 'interactive-writing', 'writing-sample'].includes(q?.type);
  }

  async function runAiWritingCheck(q, { text, wordCount, button, feedbackSlot }) {
    if (!text || !text.trim()) {
      WritingAI.renderError(feedbackSlot, 'Please write something before checking.');
      return;
    }

    if (!WritingAI.getApiKey()) {
      WritingAI.renderError(
        feedbackSlot,
        'API key not configured. Add your Anthropic API key to js/config.js (see README).'
      );
      return;
    }

    const label = button.querySelector('.btn-ai-label');
    button.disabled = true;
    if (label) {
      label.innerHTML = '<span class="spinner"></span> Checking...';
    }
    WritingAI.renderLoading(feedbackSlot);

    const prompt = WritingAI.writingPrompt(q);
    const minWords = q.minWords || 0;

    try {
      const feedback = await WritingAI.checkWriting(text, prompt, minWords);
      state.answers[q.id] = {
        ...state.answers[q.id],
        text,
        wordCount,
        aiFeedback: feedback,
        aiFeedbackError: null
      };
      WritingAI.renderFeedbackPanel(feedbackSlot, feedback);
    } catch (err) {
      let msg = 'Could not connect to AI checker. Check your internet and try again.';
      if (err.code === 'NO_KEY') {
        msg = 'API key not configured. Add your Anthropic API key to js/config.js (see README).';
      } else if (err instanceof SyntaxError || err.code === 'PARSE') {
        msg = 'AI checker returned an unexpected response. Please try again.';
      } else if (err.code === 'API_ERROR' || err.name === 'TypeError') {
        msg = 'Could not reach AI. Check your internet connection.';
      }
      state.answers[q.id] = {
        ...state.answers[q.id],
        text,
        wordCount,
        aiFeedback: null,
        aiFeedbackError: msg
      };
      WritingAI.renderError(feedbackSlot, msg);
    } finally {
      button.disabled = false;
      if (label) label.textContent = '✦ Check My Writing';
    }
  }

  function flashResult(status) {
    questionArea.classList.remove('flash-correct', 'flash-wrong', 'shake');
    void questionArea.offsetWidth;
    if (status === 'correct') questionArea.classList.add('flash-correct');
    else if (status === 'incorrect') questionArea.classList.add('shake', 'flash-wrong');
  }

  function submitAnswer(q, data) {
    if (state.submitted[q.id]) return;
    state.answers[q.id] = { ...state.answers[q.id], ...data };
    const collected = Renderer.collectAnswer(q, questionArea);
    state.answers[q.id] = { ...state.answers[q.id], ...collected };
    const grade = Results.gradeQuestion(q, state.answers[q.id], false);
    state.grades[q.id] = grade;
    state.submitted[q.id] = true;
    DETStorage.addXP(grade.status === 'correct' ? 15 : 5);
    renderCurrent();
  }

  function trySubmitCurrent() {
    const q = currentQ();
    if (!q || state.submitted[q.id]) return false;

    if (q.type === 'read-select') {
      const sel = state.answers[q.id]?.selected || [];
      if (!sel.length) return false;
      submitAnswer(q, { selected: sel });
      return true;
    }
    if (['write-photo', 'interactive-writing', 'writing-sample'].includes(q.type)) {
      const ta = questionArea.querySelector('textarea');
      if (!ta || !ta.value.trim()) return false;
      submitAnswer(q, { text: ta.value, wordCount: ta.value.trim().split(/\s+/).length });
      return true;
    }
    return false;
  }

  function next() {
    const q = currentQ();
    if (q && !state.submitted[q.id]) {
      if (!trySubmitCurrent()) {
        if (['fill-blanks', 'identify-idea', 'title-passage', 'complete-passage', 'highlight-answer', 'complete-sentences', 'read-complete'].includes(q.type)) {
          alert('Please answer this question first, or tap Skip.');
        } else if (q.type === 'read-select') {
          alert('Select the real words, then tap Next.');
        } else if (isWritingType(q)) {
          alert('Write your answer, optionally use Check My Writing, then tap Next.');
        } else {
          alert('Please answer this question first, or tap Skip.');
        }
        return;
      }
      return;
    }

    pauseTimer();
    persist();

    if (state.index >= state.questions.length - 1) {
      finish();
      return;
    }

    const curr = state.questions[state.index];
    const nextQ = state.questions[state.index + 1];
    if (curr.sectionId !== nextQ.sectionId && !state.breaksShown.has(nextQ.sectionId)) {
      showBreak(nextQ.sectionId);
      return;
    }

    state.index++;
    renderCurrent();
  }

  function showBreak(sectionId) {
    const sec = SECTIONS.find(s => s.id === sectionId);
    state.pendingBreakSection = sectionId;
    $('break-content').innerHTML = `
      <div class="break-emoji">🎉</div>
      <h2>${escapeHtml(sec?.breakTitle || 'Section complete')}</h2>
      <p>Great work! Next: <strong>${escapeHtml(sec?.name || '')}</strong></p>
      <ul class="break-tips">${(sec?.breakTips || []).map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
    show('break');
    pauseTimer();
  }

  function continueBreak() {
    if (state.pendingBreakSection) state.breaksShown.add(state.pendingBreakSection);
    state.pendingBreakSection = null;
    state.index++;
    show('test');
    renderCurrent();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  }

  function back() {
    if (state.pendingBreakSection) {
      state.pendingBreakSection = null;
      show('test');
      renderCurrent();
      return;
    }
    pauseTimer();
    persist();
    if (state.index <= 0) return;
    state.index--;
    renderCurrent();
  }

  function persist() {
    const q = currentQ();
    if (!q) return;
    const c = Renderer.collectAnswer(q, questionArea);
    if (Object.keys(c).length) state.answers[q.id] = { ...state.answers[q.id], ...c };
  }

  function skip() {
    const q = currentQ();
    if (q) {
      state.skipped.add(q.id);
      state.submitted[q.id] = true;
      state.grades[q.id] = { status: 'skipped', points: 0, max: 1 };
      Tutor.hide(tutorArea);
    }
    pauseTimer();
    if (state.index >= state.questions.length - 1) finish();
    else {
      const curr = state.questions[state.index];
      const nextQ = state.questions[state.index + 1];
      if (curr.sectionId !== nextQ.sectionId && !state.breaksShown.has(nextQ.sectionId)) {
        showBreak(nextQ.sectionId);
      } else {
        state.index++;
        renderCurrent();
      }
    }
  }

  function toggleHint() {
    const q = currentQ();
    if (!q) return;
    state.ui[q.id] = { ...state.ui[q.id], showHint: !state.ui[q.id]?.showHint };
    renderCurrent();
  }

  function toggleReveal() {
    const q = currentQ();
    if (!q) return;
    state.ui[q.id] = { ...state.ui[q.id], showReveal: true };
    if (!state.submitted[q.id]) {
      state.submitted[q.id] = true;
      state.grades[q.id] = Results.gradeQuestion(q, state.answers[q.id], false);
    }
    renderCurrent();
    Tutor.renderPanel(tutorArea, q, state.grades[q.id] || { status: 'incorrect' }, state.answers[q.id]);
  }

  function finish() {
    pauseTimer();
    persist();
    const data = Results.computeScores(state.questions, state.answers, state.skipped);
    Results.renderResults($('results-content'), data);
    show('results');
    DETStorage.touchStreak();
    if (typeof confetti === 'function') confetti({ particleCount: 120, spread: 100 });
  }

  function init() {
    DETStorage.touchStreak();
    state.questions = buildSessionQuestions();
    state.index = 0;
    state.answers = {};
    state.grades = {};
    state.submitted = {};
    state.skipped = new Set();
    state.ui = {};
    state.breaksShown = new Set();
    state.timerRemaining = {};
    show('test');
    renderCurrent();
  }

  $('btn-next')?.addEventListener('click', next);
  $('btn-back')?.addEventListener('click', back);
  $('btn-skip')?.addEventListener('click', skip);
  $('btn-hint')?.addEventListener('click', toggleHint);
  $('btn-reveal')?.addEventListener('click', toggleReveal);
  $('btn-break-continue')?.addEventListener('click', continueBreak);
  $('btn-retake')?.addEventListener('click', init);
  $('btn-home')?.addEventListener('click', () => { window.location.href = 'index.html'; });

  if ($('btn-start-test')) {
    $('btn-start-test').addEventListener('click', init);
  } else {
    init();
  }
})();
