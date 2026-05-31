/**
 * AI writing checker — Anthropic Claude API
 */
const WritingAI = (function () {
  const MODEL = 'claude-sonnet-4-20250514';

  function getApiKey() {
    return typeof CONFIG !== 'undefined' && CONFIG.ANTHROPIC_API_KEY
      ? String(CONFIG.ANTHROPIC_API_KEY).trim()
      : '';
  }

  function parseAiJson(text) {
    const trimmed = (text || '').trim();
    const block = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = block ? block[1].trim() : trimmed;
    return JSON.parse(raw);
  }

  function scoreClass(overallScore) {
    const s = String(overallScore || '').toLowerCase();
    if (s.includes('excellent')) return 'excellent';
    if (s.includes('good')) return 'good';
    if (s.includes('too short')) return 'too-short';
    return 'needs-work';
  }

  function writingPrompt(q) {
    let p = q.qtext || '';
    if (q.imageDesc) p += ` Image context: ${q.imageDesc}`;
    return p;
  }

  async function checkWriting(userText, prompt, minWords) {
    const apiKey = getApiKey();
    if (!apiKey) {
      const err = new Error('API key not configured');
      err.code = 'NO_KEY';
      throw err;
    }

    const systemPrompt = `You are an expert English writing tutor for the Duolingo English Test (DET). 
Analyze the student's writing and return ONLY a JSON object with this exact structure, no other text:
{
  "overallScore": "Excellent / Good / Needs Work / Too Short",
  "wordCount": <number>,
  "grammarErrors": [
    { "original": "the wrong phrase", "correction": "the correct phrase", "explanation": "why in simple English" }
  ],
  "vocabularyTips": [
    { "word": "basic word used", "suggestion": "stronger word", "example": "example sentence using stronger word" }
  ],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "romanUrduTip": "One short motivational tip or key lesson in Roman Urdu (conversational Pakistani tone)"
}
Keep grammar errors to maximum 3 most important ones.
Keep vocabulary tips to maximum 3 suggestions.
Keep strengths and improvements to 2 each.
If text is under ${minWords} words, set overallScore to "Too Short" and explain in improvements.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Writing prompt: "${prompt}"\n\nStudent's response:\n"${userText}"`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = new Error(`API error ${response.status}`);
      err.code = 'API_ERROR';
      throw err;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      const err = new Error('Empty API response');
      err.code = 'EMPTY';
      throw err;
    }

    try {
      return parseAiJson(text);
    } catch (e) {
      const err = new Error('Invalid JSON from AI');
      err.code = 'PARSE';
      throw err;
    }
  }

  function renderFeedbackPanel(container, feedback) {
    const cls = scoreClass(feedback.overallScore);
    const wc = feedback.wordCount ?? 0;

    const grammarHtml = (feedback.grammarErrors || []).length
      ? (feedback.grammarErrors || []).map(e => `
        <div class="aif-error-card">
          <span class="aif-original">"${escapeHtml(e.original)}"</span>
          <span class="aif-arrow">→</span>
          <span class="aif-correction">"${escapeHtml(e.correction)}"</span>
          <p class="aif-explanation">${escapeHtml(e.explanation)}</p>
        </div>`).join('')
      : '<p class="aif-none-ok">No grammar errors found! Great work.</p>';

    const vocabHtml = (feedback.vocabularyTips || []).length
      ? (feedback.vocabularyTips || []).map(v => `
        <div class="aif-vocab-card">
          <span class="aif-basic">"${escapeHtml(v.word)}"</span>
          <span class="aif-arrow">→</span>
          <span class="aif-stronger">"${escapeHtml(v.suggestion)}"</span>
          <p class="aif-example">e.g. "${escapeHtml(v.example)}"</p>
        </div>`).join('')
      : '<p class="aif-muted">No vocabulary upgrades suggested this time.</p>';

    const strengths = (feedback.strengths || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
    const improvements = (feedback.improvements || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');

    container.innerHTML = `
      <div class="ai-feedback-panel">
        <div class="aif-score ${cls}">
          <span class="aif-score-label">AI Score</span>
          <span class="aif-score-value">${escapeHtml(feedback.overallScore)}</span>
          <span class="aif-word-count">${wc} words</span>
        </div>
        <div class="aif-section" id="grammar-section">
          <h4>✏️ Grammar Corrections</h4>
          ${grammarHtml}
        </div>
        <div class="aif-section" id="vocab-section">
          <h4>📚 Vocabulary Upgrades</h4>
          ${vocabHtml}
        </div>
        <div class="aif-section aif-strengths">
          <h4>✅ What you did well</h4>
          <ul>${strengths || '<li>Good effort on this response.</li>'}</ul>
        </div>
        <div class="aif-section aif-improvements">
          <h4>🎯 How to improve</h4>
          <ul>${improvements || '<li>Keep practicing with longer, clearer sentences.</li>'}</ul>
        </div>
        <div class="aif-urdu-tip">
          <span class="aif-urdu-label">🇵🇰 Tutor tip</span>
          <p>${escapeHtml(feedback.romanUrduTip || '')}</p>
        </div>
      </div>`;
  }

  function renderError(container, message) {
    container.innerHTML = `
      <div class="ai-feedback-panel ai-feedback-error">
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  function renderLoading(container) {
    container.innerHTML = `
      <div class="ai-feedback-panel ai-feedback-loading">
        <p>Analyzing your writing…</p>
      </div>`;
  }

  return {
    checkWriting,
    renderFeedbackPanel,
    renderError,
    renderLoading,
    getApiKey,
    writingPrompt,
    scoreClass
  };
})();
