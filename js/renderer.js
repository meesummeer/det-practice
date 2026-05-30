/**
 * DET Practice — Question renderers and answer extraction
 */
const Renderer = (function () {
  let hintEl = null;
  let revealEl = null;

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function headerHtml(q) {
    return `
      <div class="q-header">
        <div class="q-tag">${escapeHtml(q.tag)}</div>
        <div class="q-icon">${q.icon || ''}</div>
        <div class="q-text">${escapeHtml(q.qtext)}</div>
        ${q.qsub ? `<div class="q-sub">${escapeHtml(q.qsub)}</div>` : ''}
      </div>`;
  }

  function mountExtras(container, q, state) {
    hintEl = container.querySelector('.hint-box');
    revealEl = container.querySelector('.reveal-box');
    if (state.showHint && !hintEl) {
      const h = document.createElement('div');
      h.className = 'hint-box';
      h.innerHTML = `<strong>Hint:</strong> ${escapeHtml(q.hint || '')}`;
      container.appendChild(h);
    }
    if (state.showReveal && !revealEl) {
      const r = document.createElement('div');
      r.className = 'reveal-box';
      r.innerHTML = buildRevealHtml(q);
      container.appendChild(r);
      applyRevealState(container, q, state);
    } else if (state.showReveal) {
      applyRevealState(container, q, state);
    }
  }

  function buildRevealHtml(q) {
    let html = '<strong>Correct answer</strong>';
    switch (q.type) {
      case 'read-select':
        html += `<p>Real words: ${(q.correct || []).map(escapeHtml).join(', ')}</p>`;
        break;
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
        if (q.options && q.correct !== undefined) {
          html += `<p>${escapeHtml(q.options[q.correct])}</p>`;
        }
        break;
      case 'read-complete':
        html += `<p>Missing letters: ${(q.gaps || []).map(g => escapeHtml(g.answer)).join(', ')}</p>`;
        break;
      case 'complete-sentences':
        (q.blanks || []).forEach((b, i) => {
          html += `<p>Blank ${i + 1}: ${escapeHtml(b.options[b.correct])}</p>`;
        });
        break;
      case 'complete-passage':
        if (q.sentences && q.correct !== undefined) {
          html += `<p>${escapeHtml(q.sentences[q.correct])}</p>`;
        }
        break;
      case 'highlight-answer':
        if (q.sentences && q.correct !== undefined) {
          html += `<p>${escapeHtml(q.sentences[q.correct])}</p>`;
        }
        break;
      case 'write-photo':
      case 'interactive-writing':
      case 'writing-sample':
      case 'read-aloud':
      case 'speak-photo':
      case 'read-then-speak':
        html += `<p><strong>Sample:</strong> ${escapeHtml(q.sample || '')}</p>`;
        break;
      default:
        html += '<p>See question data for answer key.</p>';
    }
    if (q.tip) {
      html += `<div class="tip-box"><strong>DET tip:</strong> ${escapeHtml(q.tip)}</div>`;
    }
    return html;
  }

  function applyRevealState(container, q, state) {
    switch (q.type) {
      case 'read-select':
        container.querySelectorAll('.word-chip').forEach(chip => {
          const w = chip.dataset.word;
          const isReal = (q.correct || []).includes(w);
          chip.classList.add(isReal ? 'revealed-correct' : 'revealed-wrong');
          if (isReal) chip.classList.add('selected');
        });
        break;
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
        container.querySelectorAll('.mcq-option').forEach((el, i) => {
          if (i === q.correct) el.classList.add('correct-reveal');
        });
        break;
      case 'highlight-answer':
        container.querySelectorAll('.highlight-sentence').forEach((el, i) => {
          if (i === q.correct) el.classList.add('reveal-correct');
        });
        break;
      case 'read-complete':
        container.querySelectorAll('.letter-input').forEach((inp, i) => {
          const g = q.gaps[i];
          if (g) {
            inp.value = g.answer;
            inp.classList.add('reveal-correct');
          }
        });
        break;
      case 'complete-sentences':
        (q.blanks || []).forEach((b, i) => {
          const sel = container.querySelector(`select[data-blank="${i}"]`);
          if (sel) sel.value = String(b.correct);
        });
        break;
      case 'complete-passage':
        container.querySelectorAll('.mcq-option').forEach((el, i) => {
          if (i === q.correct) el.classList.add('correct-reveal');
        });
        break;
    }
  }

  function renderReadSelect(q, answer, container) {
    const selected = new Set(answer?.selected || []);
    const words = q.words || [];
    const chips = words.map(w => {
      const sel = selected.has(w.text) ? ' selected' : '';
      return `<button type="button" class="word-chip${sel}" data-word="${escapeHtml(w.text)}">${escapeHtml(w.text)}</button>`;
    }).join('');
    container.innerHTML = headerHtml(q) + `<div class="word-grid">${chips}</div>`;
    container.querySelectorAll('.word-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        if (typeof container.onAnswerChange === 'function') {
          const sel = [...container.querySelectorAll('.word-chip.selected')].map(c => c.dataset.word);
          container.onAnswerChange({ selected: sel });
        }
      });
    });
  }

  function renderMcq(q, answer, container, field) {
    const chosen = answer?.[field] ?? answer?.choice;
    const passageBlock = q.passage
      ? `<div class="highlight-passage" style="margin-bottom:16px">${escapeHtml(q.passage)}</div>`
      : '';
    const opts = (q.options || []).map((opt, i) => {
      const sel = chosen === i ? ' selected' : '';
      const letter = String.fromCharCode(65 + i);
      return `<li><div class="mcq-option${sel}" data-index="${i}" role="button" tabindex="0">
        <span class="mcq-letter">${letter}</span><span>${escapeHtml(opt)}</span></div></li>`;
    }).join('');
    container.innerHTML = headerHtml(q) + passageBlock + `<ul class="mcq-list">${opts}</ul>`;
    container.querySelectorAll('.mcq-option').forEach(el => {
      const pick = () => {
        container.querySelectorAll('.mcq-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        const idx = parseInt(el.dataset.index, 10);
        if (typeof container.onAnswerChange === 'function') {
          container.onAnswerChange({ [field]: idx, choice: idx });
        }
      };
      el.addEventListener('click', pick);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

  function renderReadComplete(q, answer, container) {
    const parts = q.passage.split(/(_+)/g);
    let gapIdx = 0;
    const letters = answer?.letters || [];
    let html = headerHtml(q) + '<div class="complete-passage">';
    parts.forEach(part => {
      if (/^_+$/.test(part)) {
        const g = q.gaps[gapIdx];
        const val = letters[gapIdx] || '';
        html += `<input type="text" class="letter-input${val ? ' filled' : ''}" maxlength="1" data-gap="${gapIdx}" value="${escapeHtml(val)}" aria-label="Missing letter ${gapIdx + 1}">`;
        gapIdx++;
      } else {
        html += escapeHtml(part);
      }
    });
    html += '</div>';
    container.innerHTML = html;
    const inputs = container.querySelectorAll('.letter-input');
    inputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.slice(-1).toLowerCase();
        inp.classList.toggle('filled', !!inp.value);
        const arr = [...inputs].map(x => x.value);
        if (typeof container.onAnswerChange === 'function') {
          container.onAnswerChange({ letters: arr });
        }
        const next = inputs[i + 1];
        if (inp.value && next) next.focus();
      });
    });
  }

  function renderCompleteSentences(q, answer, container) {
    let passage = escapeHtml(q.passage);
    const vals = answer?.blanks || {};
    (q.blanks || []).forEach((b, i) => {
      const opts = b.options.map((o, j) => {
        const sel = vals[i] === j ? ' selected' : '';
        return `<option value="${j}"${sel}>${escapeHtml(o)}</option>`;
      }).join('');
      const ph = `___${i + 1}___`;
      passage = passage.replace(ph, `<select class="blank-select" data-blank="${i}"><option value="">—</option>${opts}</select>`);
    });
    container.innerHTML = headerHtml(q) + `<div class="blank-passage">${passage}</div>`;
    container.querySelectorAll('select[data-blank]').forEach(sel => {
      if (vals[sel.dataset.blank] !== undefined) sel.value = String(vals[sel.dataset.blank]);
      sel.addEventListener('change', () => {
        const blanks = {};
        container.querySelectorAll('select[data-blank]').forEach(s => {
          if (s.value !== '') blanks[s.dataset.blank] = parseInt(s.value, 10);
        });
        if (typeof container.onAnswerChange === 'function') {
          container.onAnswerChange({ blanks });
        }
      });
    });
  }

  function renderCompletePassage(q, answer, container) {
    const parts = q.passage.split('___GAP___');
    const chosen = answer?.choice;
    let body = escapeHtml(parts[0]) + ' <em>[gap]</em> ' + escapeHtml(parts[1] || '');
    const sents = (q.sentences || []).map((s, i) => {
      const sel = chosen === i ? ' selected' : '';
      return `<li><div class="mcq-option${sel}" data-index="${i}" role="button" tabindex="0">
        <span class="mcq-letter">${i + 1}</span><span>${escapeHtml(s)}</span></div></li>`;
    }).join('');
    container.innerHTML = headerHtml(q) + `<p class="q-sub">${body}</p><ul class="mcq-list">${sents}</ul>`;
    container.querySelectorAll('.mcq-option').forEach(el => {
      el.addEventListener('click', () => {
        container.querySelectorAll('.mcq-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        if (typeof container.onAnswerChange === 'function') {
          container.onAnswerChange({ choice: parseInt(el.dataset.index, 10) });
        }
      });
    });
  }

  function renderHighlight(q, answer, container) {
    const chosen = answer?.index;
    const sents = (q.sentences || []).map((s, i) => {
      const sel = chosen === i ? ' selected' : '';
      return `<div class="highlight-sentence${sel}" data-index="${i}" role="button" tabindex="0">${escapeHtml(s)}</div>`;
    }).join('');
    const qline = q.question ? `<p class="q-sub"><strong>Question:</strong> ${escapeHtml(q.question)}</p>` : '';
    container.innerHTML = headerHtml(q) + qline + `<div class="highlight-passage">${sents}</div>`;
    container.querySelectorAll('.highlight-sentence').forEach(el => {
      el.addEventListener('click', () => {
        container.querySelectorAll('.highlight-sentence').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        if (typeof container.onAnswerChange === 'function') {
          container.onAnswerChange({ index: parseInt(el.dataset.index, 10) });
        }
      });
    });
  }

  function renderWriting(q, answer, container, id) {
    const text = answer?.text || '';
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    const min = q.minWords || 0;
    const met = wc >= min ? ' met' : '';
    const img = q.imageDesc
      ? `<div class="photo-placeholder">${escapeHtml(q.imageDesc)}</div>`
      : '';
    container.innerHTML = headerHtml(q) + img + `
      <div class="text-area-wrap">
        <textarea id="${id}" placeholder="Type your response here...">${escapeHtml(text)}</textarea>
        <div class="word-count${met}" data-min="${min}">${wc} word${wc === 1 ? '' : 's'}${min ? ` (min ${min})` : ''}</div>
      </div>`;
    const ta = container.querySelector('textarea');
    const wcEl = container.querySelector('.word-count');
    const update = () => {
      const t = ta.value;
      const n = t.trim() ? t.trim().split(/\s+/).length : 0;
      const m = parseInt(wcEl.dataset.min, 10) || 0;
      wcEl.textContent = `${n} word${n === 1 ? '' : 's'}${m ? ` (min ${m})` : ''}`;
      wcEl.classList.toggle('met', n >= m);
      if (typeof container.onAnswerChange === 'function') {
        container.onAnswerChange({ text: t, wordCount: n });
      }
    };
    ta.addEventListener('input', update);
  }

  function renderSpeaking(q, answer, container) {
    const recorded = answer?.recorded || false;
    const selfScore = answer?.selfScore;
    let prompt = '';
    if (q.sentence) prompt = `<div class="speak-prompt">${escapeHtml(q.sentence)}</div>`;
    else if (q.imageDesc) prompt = `<div class="photo-placeholder">${escapeHtml(q.imageDesc)}</div>`;
    else if (q.prompt) prompt = `<div class="speak-prompt">${escapeHtml(q.prompt)}</div>`;

    const recClass = answer?.recording ? ' recording' : '';
    const status = answer?.recording ? 'Recording... (mock)' : recorded ? 'Recording saved (mock)' : 'Tap to simulate recording';

    container.innerHTML = headerHtml(q) + prompt + `
      <div class="recorder-mock">
        <button type="button" class="rec-btn${recClass}" id="mock-rec-btn">${answer?.recording ? 'Stop' : 'Record'}</button>
        <div class="rec-status">${status}</div>
        ${recorded ? `
        <div class="self-assess">
          <span>Self-assess:</span>
          <button type="button" class="btn btn-outline-primary${selfScore === 'good' ? ' selected' : ''}" data-score="good">Good</button>
          <button type="button" class="btn btn-outline-primary${selfScore === 'ok' ? ' selected' : ''}" data-score="ok">OK</button>
          <button type="button" class="btn btn-outline-primary${selfScore === 'poor' ? ' selected' : ''}" data-score="poor">Needs work</button>
        </div>` : ''}
      </div>`;

    const recBtn = container.querySelector('#mock-rec-btn');
    if (recBtn) {
      recBtn.addEventListener('click', () => {
        const next = { ...answer, recording: !answer?.recording };
        if (answer?.recording) {
          next.recording = false;
          next.recorded = true;
        } else {
          next.recording = true;
        }
        if (typeof container.onAnswerChange === 'function') {
          container.onAnswerChange(next);
        }
      });
    }
    container.querySelectorAll('[data-score]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof container.onAnswerChange === 'function') {
          container.onAnswerChange({ ...answer, recorded: true, recording: false, selfScore: btn.dataset.score });
        }
      });
    });
  }

  function render(q, answer, container, uiState) {
    container.onAnswerChange = null;
    const state = uiState || {};
    const taId = `ta-${q.id}`;

    switch (q.type) {
      case 'read-select':
        renderReadSelect(q, answer, container);
        break;
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
        renderMcq(q, answer, container, 'choice');
        break;
      case 'read-complete':
        renderReadComplete(q, answer, container);
        break;
      case 'write-photo':
      case 'interactive-writing':
      case 'writing-sample':
        renderWriting(q, answer, container, taId);
        break;
      case 'complete-sentences':
        renderCompleteSentences(q, answer, container);
        break;
      case 'complete-passage':
        renderCompletePassage(q, answer, container);
        break;
      case 'highlight-answer':
        renderHighlight(q, answer, container);
        break;
      case 'read-aloud':
      case 'speak-photo':
      case 'read-then-speak':
        renderSpeaking(q, answer, container);
        break;
      default:
        container.innerHTML = headerHtml(q) + '<p>Unknown question type.</p>';
    }
    mountExtras(container, q, state);
  }

  function collectAnswer(q, container) {
    switch (q.type) {
      case 'read-select':
        return { selected: [...container.querySelectorAll('.word-chip.selected')].map(c => c.dataset.word) };
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
      case 'complete-passage': {
        const sel = container.querySelector('.mcq-option.selected');
        return sel ? { choice: parseInt(sel.dataset.index, 10) } : {};
      }
      case 'read-complete':
        return { letters: [...container.querySelectorAll('.letter-input')].map(i => i.value) };
      case 'complete-sentences': {
        const blanks = {};
        container.querySelectorAll('select[data-blank]').forEach(s => {
          if (s.value !== '') blanks[s.dataset.blank] = parseInt(s.value, 10);
        });
        return { blanks };
      }
      case 'highlight-answer': {
        const sel = container.querySelector('.highlight-sentence.selected');
        return sel ? { index: parseInt(sel.dataset.index, 10) } : {};
      }
      case 'write-photo':
      case 'interactive-writing':
      case 'writing-sample': {
        const ta = container.querySelector('textarea');
        const text = ta ? ta.value : '';
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        return { text, wordCount };
      }
      default:
        return {};
    }
  }

  return { render, collectAnswer, buildRevealHtml };
})();
