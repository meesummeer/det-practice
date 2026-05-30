/**
 * Scoring — Literacy, Comprehension, Production (no speaking)
 */
const Results = (function () {
  function gradeQuestion(q, answer, skipped) {
    if (skipped) return { status: 'skipped', points: 0, max: 1 };

    switch (q.type) {
      case 'read-select': {
        const sel = new Set(answer?.selected || []);
        const correct = new Set(q.correct || []);
        if (!sel.size) return { status: 'skipped', points: 0, max: 1 };
        let hits = 0;
        let wrong = 0;
        sel.forEach(w => { if (correct.has(w)) hits++; else wrong++; });
        const missed = correct.size - hits;
        if (wrong === 0 && missed === 0) return { status: 'correct', points: 1, max: 1 };
        if (hits > 0 && wrong === 0) return { status: 'partial', points: 0.65, max: 1 };
        return { status: 'incorrect', points: 0, max: 1 };
      }
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
      case 'complete-passage':
        if (answer?.choice === undefined) return { status: 'skipped', points: 0, max: 1 };
        return answer.choice === q.correct
          ? { status: 'correct', points: 1, max: 1 }
          : { status: 'incorrect', points: 0, max: 1 };
      case 'read-complete': {
        const letters = answer?.letters || [];
        if (!letters.some(l => l)) return { status: 'skipped', points: 0, max: 1 };
        let ok = 0;
        (q.gaps || []).forEach((g, i) => {
          if ((letters[i] || '').toLowerCase() === (g.answer || '').toLowerCase()) ok++;
        });
        const ratio = ok / (q.gaps?.length || 1);
        if (ratio === 1) return { status: 'correct', points: 1, max: 1 };
        if (ratio > 0) return { status: 'partial', points: ratio * 0.75, max: 1 };
        return { status: 'incorrect', points: 0, max: 1 };
      }
      case 'complete-sentences': {
        const blanks = answer?.blanks || {};
        if (!Object.keys(blanks).length) return { status: 'skipped', points: 0, max: 1 };
        let ok = 0;
        (q.blanks || []).forEach((b, i) => { if (blanks[i] === b.correct) ok++; });
        const ratio = ok / (q.blanks?.length || 1);
        if (ratio === 1) return { status: 'correct', points: 1, max: 1 };
        if (ratio > 0) return { status: 'partial', points: ratio * 0.75, max: 1 };
        return { status: 'incorrect', points: 0, max: 1 };
      }
      case 'highlight-answer': {
        const pick = answer?.index;
        if (pick === undefined) return { status: 'skipped', points: 0, max: 1 };
        return pick === q.correct
          ? { status: 'correct', points: 1, max: 1 }
          : { status: 'incorrect', points: 0, max: 1 };
      }
      case 'write-photo':
      case 'interactive-writing': {
        const wc = answer?.wordCount || 0;
        const min = q.minWords || 5;
        if (!wc) return { status: 'skipped', points: 0, max: 1 };
        if (wc >= min) return { status: 'correct', points: 1, max: 1 };
        return { status: 'partial', points: 0.5, max: 1 };
      }
      case 'writing-sample': {
        const wc = answer?.wordCount || 0;
        if (wc >= (q.minWords || 150)) return { status: 'correct', points: 1, max: 1 };
        if (wc > 30) return { status: 'partial', points: 0.65, max: 1 };
        return { status: 'skipped', points: 0, max: 1 };
      }
      default:
        return { status: 'skipped', points: 0, max: 1 };
    }
  }

  function computeScores(questions, answers, skipped) {
    const subs = { literacy: 0, comprehension: 0, production: 0 };
    const subMax = { literacy: 0, comprehension: 0, production: 0 };
    const review = [];

    questions.forEach(q => {
      const ans = answers[q.id];
      const skip = skipped.has(q.id);
      const g = gradeQuestion(q, ans, skip);
      const key = q.section_score || 'literacy';
      if (subs[key] !== undefined) {
        subs[key] += g.points;
        subMax[key] += g.max;
      }
      review.push({ q, grade: g, answer: ans, skipped: skip });
    });

    const pct = k => (subMax[k] ? Math.round((subs[k] / subMax[k]) * 100) : 0);
    const subPercents = { literacy: pct('literacy'), comprehension: pct('comprehension'), production: pct('production') };
    const overallPct = Math.round((subPercents.literacy + subPercents.comprehension + subPercents.production) / 3);
    const estimatedScore = Math.min(160, Math.max(10, Math.round(10 + (overallPct / 100) * 150)));

    return {
      subPercents,
      overallPct,
      estimatedScore,
      rangeLow: Math.max(10, estimatedScore - 5),
      rangeHigh: Math.min(160, estimatedScore + 5),
      review
    };
  }

  function statusLabel(g) {
    if (g.status === 'correct') return 'Correct';
    if (g.status === 'partial') return 'Partial';
    if (g.status === 'incorrect') return 'Wrong';
    return 'Skipped';
  }

  function renderResults(container, data) {
    const { subPercents, estimatedScore, rangeLow, rangeHigh, review } = data;
    const rows = review.map(({ q, grade }) => {
      const cls = grade.status === 'correct' ? 'correct' : grade.status === 'partial' ? 'partial' : grade.status === 'incorrect' ? 'incorrect' : 'skipped';
      const tutor = grade.status === 'incorrect' && !grade.skipped
        ? `<p class="review-tutor">${escapeHtml(q.explanationUR || Tutor.generateUR(q))}</p>` : '';
      return `<li class="review-item ${cls}">
        <span class="review-icon">${q.icon || '•'}</span>
        <div class="review-body">
          <span class="review-title">${escapeHtml(q.tag)} (${q.id})</span>
          <span class="review-status">${statusLabel(grade)}</span>
          ${tutor}
        </div>
      </li>`;
    }).join('');

    container.innerHTML = `
      <h2>Practice Test Complete</h2>
      <div class="score-hero">
        <div class="score-big">${estimatedScore}</div>
        <p class="score-range">Estimated DET range: ${rangeLow}–${rangeHigh}</p>
        <p class="muted">Practice estimate — not an official Duolingo score.</p>
      </div>
      <div class="subscores">
        ${bar('Literacy', subPercents.literacy)}
        ${bar('Comprehension', subPercents.comprehension)}
        ${bar('Production', subPercents.production)}
      </div>
      <section class="review-section"><h3>Question review</h3><ul class="review-list">${rows}</ul></section>`;
  }

  function bar(label, pct) {
    return `<div class="subscore-row">
      <div class="subscore-label"><span>${label}</span><span>${pct}%</span></div>
      <div class="subscore-bar"><div class="subscore-fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  return { gradeQuestion, computeScores, renderResults, statusLabel };
})();
