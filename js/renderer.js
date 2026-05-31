/**
 * Question renderers — DET practice test
 */
const Renderer = (function () {
  function headerHtml(q) {
    return `
      <div class="q-header">
        <div class="q-tag">${escapeHtml(q.tag)}</div>
        <div class="q-icon">${q.icon || ''}</div>
        <div class="q-text">${escapeHtml(q.qtext)}</div>
        ${q.qsub ? `<div class="q-sub">${escapeHtml(q.qsub)}</div>` : ''}
      </div>`;
  }

  function mountHintReveal(container, q, ui, locked) {
    if (ui.showHint) {
      const h = document.createElement('div');
      h.className = 'hint-box';
      h.innerHTML = `<strong>Hint:</strong> ${escapeHtml(q.hint || '')}`;
      container.appendChild(h);
    }
    if (ui.showReveal) {
      const r = document.createElement('div');
      r.className = 'reveal-box';
      r.innerHTML = `<strong>Answer:</strong> ${escapeHtml(Tutor.correctAnswerText(q))}`;
      if (q.tip) r.innerHTML += `<div class="tip-box"><strong>DET tip:</strong> ${escapeHtml(q.tip)}</div>`;
      container.appendChild(r);
      applyRevealVisuals(container, q);
    }
  }

  function applyRevealVisuals(container, q) {
    switch (q.type) {
      case 'read-select':
        container.querySelectorAll('.word-chip').forEach(chip => {
          const ok = (q.correct || []).includes(chip.dataset.word);
          chip.classList.add(ok ? 'correct' : 'wrong-dim');
          if (ok) chip.classList.add('selected');
        });
        break;
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
      case 'complete-passage':
        container.querySelectorAll('.mcq-option').forEach((el, i) => {
          if (i === q.correct) el.classList.add('correct');
        });
        break;
      case 'highlight-answer':
        container.querySelectorAll('.highlight-sentence').forEach((el, i) => {
          if (i === q.correct) el.classList.add('correct');
        });
        break;
      case 'read-complete':
        container.querySelectorAll('.letter-input').forEach((inp, i) => {
          const g = q.gaps[i];
          if (g) {
            inp.value = g.answer;
            inp.classList.add('correct');
          }
        });
        break;
      case 'complete-sentences':
        (q.blanks || []).forEach((b, i) => {
          const sel = container.querySelector(`select[data-blank="${i}"]`);
          if (sel) sel.value = String(b.correct);
        });
        break;
    }
  }

  function shuffleArray(arr) {
    return fisherYates(arr || []);
  }

  function renderReadSelect(q, answer, container, opts) {
    const selected = new Set(answer?.selected || []);
    const locked = opts.locked;
    const shuffledWords = shuffleArray(q.words);
    const chips = shuffledWords.map(w => {
      const sel = selected.has(w.text) ? ' selected' : '';
      const ok = locked && (q.correct || []).includes(w.text);
      const bad = locked && selected.has(w.text) && !ok;
      const cls = [sel, ok ? ' correct' : '', bad ? ' wrong' : ''].join('');
      return `<button type="button" class="word-chip${cls}" data-word="${escapeHtml(w.text)}" ${locked ? 'disabled' : ''}>${escapeHtml(w.text)}</button>`;
    }).join('');
    container.innerHTML = headerHtml(q) + `<div class="word-grid">${chips}</div>`;
    if (!locked) {
      container.querySelectorAll('.word-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('selected');
          const sel = [...container.querySelectorAll('.word-chip.selected')].map(c => c.dataset.word);
          opts.onChange({ selected: sel });
        });
      });
    }
  }

  function renderFillBlanks(q, answer, container, opts) {
    const chosen = answer?.choice;
    const locked = opts.locked;
    const passage = q.qtext.includes('_____')
      ? q.qtext
      : q.qtext;
    const items = (q.options || []).map((opt, i) => {
      let cls = 'mcq-option';
      if (chosen === i) cls += ' selected';
      if (locked) {
        if (i === q.correct) cls += ' correct';
        else if (chosen === i) cls += ' wrong';
      }
      const letter = String.fromCharCode(65 + i);
      return `<li><button type="button" class="${cls}" data-index="${i}" ${locked ? 'disabled' : ''}>
        <span class="mcq-letter">${letter}</span><span>${escapeHtml(opt)}</span></button></li>`;
    }).join('');
    container.innerHTML = headerHtml(q) + `<ul class="mcq-list mcq-buttons">${items}</ul>`;
    if (!locked) {
      container.querySelectorAll('.mcq-option').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index, 10);
          opts.onChange({ choice: idx });
          if (opts.onSubmit) opts.onSubmit({ choice: idx });
        });
      });
    }
  }

  function renderMcq(q, answer, container, opts) {
    const chosen = answer?.choice;
    const locked = opts.locked;
    const passageBlock = q.passage
      ? `<div class="passage-block">${escapeHtml(q.passage)}</div>`
      : '';
    const items = (q.options || []).map((opt, i) => {
      let cls = 'mcq-option';
      if (chosen === i) cls += ' selected';
      if (locked) {
        if (i === q.correct) cls += ' correct';
        else if (chosen === i) cls += ' wrong';
      }
      const letter = String.fromCharCode(65 + i);
      return `<li><button type="button" class="${cls}" data-index="${i}" ${locked ? 'disabled' : ''}>
        <span class="mcq-letter">${letter}</span><span>${escapeHtml(opt)}</span></button></li>`;
    }).join('');
    container.innerHTML = headerHtml(q) + passageBlock + `<ul class="mcq-list mcq-buttons">${items}</ul>`;
    if (!locked) {
      container.querySelectorAll('.mcq-option').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index, 10);
          opts.onChange({ choice: idx });
          if (opts.onSubmit) opts.onSubmit({ choice: idx });
        });
      });
    }
  }

  function renderReadComplete(q, answer, container, opts) {
    const letters = answer?.letters || [];
    const locked = opts.locked;
    let gapIdx = 0;
    let html = headerHtml(q) + '<div class="complete-passage">';
    for (let i = 0; i < q.passage.length; i++) {
      const ch = q.passage[i];
      if (ch === '_') {
        const g = q.gaps[gapIdx] || { answer: '' };
        const expected = String(g.answer || '').toLowerCase();
        const val = letters[gapIdx] || '';
        let cls = 'letter-input';
        if (val) cls += ' filled';
        if (locked) {
          cls += val.toLowerCase() === expected ? ' correct' : ' wrong';
        }
        html += `<input type="text" class="${cls}" maxlength="1" size="2" style="min-width:28px;width:28px" data-gap="${gapIdx}" value="${escapeHtml(val)}" ${locked ? 'readonly' : ''} aria-label="Gap ${gapIdx + 1}">`;
        gapIdx++;
      } else {
        html += escapeHtml(ch);
      }
    }
    html += '</div>';
    if (locked) {
      html += `<div class="reveal-box" style="margin-top:12px"><strong>Full text:</strong> ${escapeHtml(revealFullPassage(q))}</div>`;
    } else {
      html += '<button type="button" class="btn btn-primary btn-check" id="btn-check-letters">Check letters</button>';
    }
    container.innerHTML = html;
    if (!locked) {
      const inputs = container.querySelectorAll('.letter-input');
      inputs.forEach((inp, i) => {
        inp.addEventListener('input', () => {
          inp.value = inp.value.slice(0, 1).toLowerCase();
          inp.classList.toggle('filled', !!inp.value);
          const arr = [...inputs].map(x => x.value);
          opts.onChange({ letters: arr });
        });
      });
      const btn = container.querySelector('#btn-check-letters');
      if (btn) {
        btn.addEventListener('click', () => {
          const arr = [...inputs].map(x => x.value);
          opts.onChange({ letters: arr });
          if (opts.onSubmit) opts.onSubmit({ letters: arr });
        });
      }
    }
  }

  function revealFullPassage(q) {
    if (q.fullPassage) return q.fullPassage;
    let gapIdx = 0;
    let out = '';
    for (let i = 0; i < q.passage.length; i++) {
      if (q.passage[i] === '_') {
        out += (q.gaps[gapIdx++] || {}).answer || '';
      } else {
        out += q.passage[i];
      }
    }
    return out;
  }

  function renderCompleteSentences(q, answer, container, opts) {
    const locked = opts.locked;
    let passage = escapeHtml(q.passage);
    const vals = answer?.blanks || {};
    (q.blanks || []).forEach((b, i) => {
      const optHtml = b.options.map((o, j) => `<option value="${j}">${escapeHtml(o)}</option>`).join('');
      passage = passage.replace(`___${i + 1}___`, `<select class="blank-select" data-blank="${i}" ${locked ? 'disabled' : ''}><option value="">—</option>${optHtml}</select>`);
    });
    container.innerHTML = headerHtml(q) + `<div class="blank-passage">${passage}</div>`;
    container.querySelectorAll('select[data-blank]').forEach(sel => {
      if (vals[sel.dataset.blank] !== undefined) sel.value = String(vals[sel.dataset.blank]);
      if (!locked) {
        sel.addEventListener('change', () => {
          const blanks = {};
          container.querySelectorAll('select[data-blank]').forEach(s => {
            if (s.value !== '') blanks[s.dataset.blank] = parseInt(s.value, 10);
          });
          opts.onChange({ blanks });
          const allFilled = (q.blanks || []).every((_, i) => blanks[i] !== undefined);
          if (allFilled && opts.onSubmit) opts.onSubmit({ blanks });
        });
      }
    });
  }

  function renderHighlight(q, answer, container, opts) {
    const chosen = answer?.index;
    const locked = opts.locked;
    const sents = (q.sentences || []).map((s, i) => {
      let cls = 'highlight-sentence';
      if (chosen === i) cls += ' selected';
      if (locked) {
        if (i === q.correct) cls += ' correct';
        else if (chosen === i) cls += ' wrong';
      }
      return `<button type="button" class="${cls}" data-index="${i}" ${locked ? 'disabled' : ''}>${escapeHtml(s)}</button>`;
    }).join('');
    const qline = q.question ? `<p class="q-sub"><strong>Q:</strong> ${escapeHtml(q.question)}</p>` : '';
    container.innerHTML = headerHtml(q) + qline + `<div class="highlight-passage">${sents}</div>`;
    if (!locked) {
      container.querySelectorAll('.highlight-sentence').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index, 10);
          opts.onChange({ index: idx });
          if (opts.onSubmit) opts.onSubmit({ index: idx });
        });
      });
    }
  }

  function renderCompletePassage(q, answer, container, opts) {
    renderMcq({ ...q, passage: q.passage.replace('___GAP___', ' ______ ') }, answer, container, opts);
  }

  function renderWriting(q, answer, container, opts) {
    const text = answer?.text || '';
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    const min = q.minWords || 0;
    const img = q.imageDesc ? `<div class="photo-placeholder">${escapeHtml(q.imageDesc)}</div>` : '';
    const locked = opts.locked;
    container.innerHTML = headerHtml(q) + img + `
      <div class="text-area-wrap">
        <textarea id="writing-input" placeholder="Type your response..." ${locked ? 'readonly' : ''}>${escapeHtml(text)}</textarea>
        <div class="word-count${wc >= min ? ' met' : ''}" data-min="${min}">${wc} words${min ? ` (min ${min})` : ''}</div>
      </div>
      ${!locked ? '<button type="button" class="btn btn-primary btn-check" id="btn-done-writing">Done — check writing</button>' : ''}`;
    const ta = container.querySelector('textarea');
    const wcEl = container.querySelector('.word-count');
    const update = () => {
      const t = ta.value;
      const n = t.trim() ? t.trim().split(/\s+/).length : 0;
      const m = parseInt(wcEl.dataset.min, 10) || 0;
      wcEl.textContent = `${n} words${m ? ` (min ${m})` : ''}`;
      wcEl.classList.toggle('met', n >= m);
      opts.onChange({ text: t, wordCount: n });
    };
    ta.addEventListener('input', update);
    const done = container.querySelector('#btn-done-writing');
    if (done) {
      done.addEventListener('click', () => {
        update();
        if (opts.onSubmit) opts.onSubmit({ text: ta.value, wordCount: wc });
      });
    }
  }

  function render(q, answer, container, uiState, renderOpts) {
    const ui = uiState || {};
    const opts = {
      locked: !!renderOpts?.locked,
      onChange: renderOpts?.onChange || (() => {}),
      onSubmit: renderOpts?.onSubmit || null
    };
    container.innerHTML = '';

    switch (q.type) {
      case 'read-select':
        renderReadSelect(q, answer, container, opts);
        break;
      case 'fill-blanks':
        renderFillBlanks(q, answer, container, opts);
        break;
      case 'identify-idea':
      case 'title-passage':
        renderMcq(q, answer, container, opts);
        break;
      case 'read-complete':
        renderReadComplete(q, answer, container, opts);
        break;
      case 'write-photo':
      case 'interactive-writing':
      case 'writing-sample':
        renderWriting(q, answer, container, opts);
        break;
      case 'complete-sentences':
        renderCompleteSentences(q, answer, container, opts);
        break;
      case 'complete-passage':
        renderCompletePassage(q, answer, container, opts);
        break;
      case 'highlight-answer':
        renderHighlight(q, answer, container, opts);
        break;
      default:
        container.innerHTML = headerHtml(q) + '<p>Unknown type</p>';
    }
    mountHintReveal(container, q, ui, opts.locked);
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
        return { text, wordCount: text.trim() ? text.trim().split(/\s+/).length : 0 };
      }
      default:
        return {};
    }
  }

  return { render, collectAnswer, revealFullPassage };
})();
