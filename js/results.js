/**
 * DET Practice — Scoring and results screen
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
        if (hits > 0 && wrong === 0) return { status: 'partial', points: 0.6, max: 1 };
        return { status: 'incorrect', points: 0, max: 1 };
      }
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
        if (answer?.choice === undefined) return { status: 'skipped', points: 0, max: 1 };
        return answer.choice === q.correct
          ? { status: 'correct', points: 1, max: 1 }
          : { status: 'incorrect', points: 0, max: 1 };
      case 'read-complete': {
        const letters = answer?.letters || [];
        if (!letters.some(l => l)) return { status: 'skipped', points: 0, max: 1 };
        let ok = 0;
        (q.gaps || []).forEach((g, i) => {
          if ((letters[i] || '').toLowerCase() === g.answer.toLowerCase()) ok++;
        });
        const ratio = ok / (q.gaps?.length || 1);
        if (ratio === 1) return { status: 'correct', points: 1, max: 1 };
        if (ratio > 0) return { status: 'partial', points: ratio * 0.8, max: 1 };
        return { status: 'incorrect', points: 0, max: 1 };
      }
      case 'complete-sentences': {
        const blanks = answer?.blanks || {};
        const keys = Object.keys(blanks);
        if (!keys.length) return { status: 'skipped', points: 0, max: 1 };
        let ok = 0;
        (q.blanks || []).forEach((b, i) => {
          if (blanks[i] === b.correct) ok++;
        });
        const ratio = ok / (q.blanks?.length || 1);
        if (ratio === 1) return { status: 'correct', points: 1, max: 1 };
        if (ratio > 0) return { status: 'partial', points: ratio * 0.8, max: 1 };
        return { status: 'incorrect', points: 0, max: 1 };
      }
      case 'complete-passage':
      case 'highlight-answer': {
        const pick = answer?.index ?? answer?.choice;
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
        if (wc > 20) return { status: 'partial', points: 0.7, max: 1 };
        return { status: 'skipped', points: 0, max: 1 };
      }
      case 'read-aloud':
      case 'speak-photo':
      case 'read-then-speak': {
        if (!answer?.recorded) return { status: 'skipped', points: 0, max: 1 };
        const map = { good: 1, ok: 0.7, poor: 0.4 };
        const pts = map[answer.selfScore] ?? 0.5;
        return { status: 'self', points: pts, max: 1, selfScore: answer.selfScore };
      }
      default:
        return { status: 'skipped', points: 0, max: 1 };
    }
  }

  function computeScores(questions, answers, skippedSet) {
    const subs = { literacy: 0, comprehension: 0, conversation: 0, production: 0 };
    const subMax = { literacy: 0, comprehension: 0, conversation: 0, production: 0 };
    const review = [];

    questions.forEach(q => {
      const ans = answers[q.id];
      const skipped = skippedSet.has(q.id);
      const g = gradeQuestion(q, ans, skipped);
      const key = q.section_score || 'literacy';
      subs[key] += g.points;
      subMax[key] += g.max;
      review.push({ q, grade: g, answer: ans, skipped });
    });

    const pct = key => (subMax[key] ? Math.round((subs[key] / subMax[key]) * 100) : 0);

    const subPercents = {
      literacy: pct('literacy'),
      comprehension: pct('comprehension'),
      conversation: pct('conversation'),
      production: pct('production')
    };

    const overallPct = Math.round(
      (subPercents.literacy + subPercents.comprehension + subPercents.conversation + subPercents.production) / 4
    );

    const score = Math.round(10 + (overallPct / 100) * 150);
    const clamped = Math.min(160, Math.max(10, score));
    const rangeLow = Math.max(10, clamped - 5);
    const rangeHigh = Math.min(160, clamped + 5);

    return {
      subPercents,
      overallPct,
      estimatedScore: clamped,
      rangeLow,
      rangeHigh,
      review
    };
  }

  function statusLabel(grade) {
    switch (grade.status) {
      case 'correct': return 'Correct';
      case 'partial': return 'Partial';
      case 'incorrect': return 'Incorrect';
      case 'self': return `Self: ${grade.selfScore || 'rated'}`;
      default: return 'Skipped';
    }
  }

  function renderResults(container, data) {
    const { subPercents, estimatedScore, rangeLow, rangeHigh, review } = data;
    const reviewHtml = review.map(({ q, grade }) => {
      const cls = grade.status === 'correct' ? 'correct'
        : grade.status === 'partial' ? 'partial'
        : grade.status === 'self' ? 'self'
        : grade.status === 'incorrect' ? 'incorrect' : 'skipped';
      return `<li class="review-item ${cls}">
        <span class="review-icon">${q.icon || '•'}</span>
        <span class="review-title">${escapeHtml(q.tag)} — ${escapeHtml(q.id)}</span>
        <span class="review-status">${statusLabel(grade)}</span>
      </li>`;
    }).join('');

    container.innerHTML = `
      <h2>Practice Test Complete</h2>
      <div class="score-hero">
        <div class="score-big">${estimatedScore}</div>
        <div class="score-range">Estimated DET range: ${rangeLow}–${rangeHigh}</div>
        <p class="q-sub" style="margin-top:12px">Practice estimate only — not an official Duolingo score.</p>
      </div>
      <div class="subscores">
        ${subscoreBar('Literacy', subPercents.literacy)}
        ${subscoreBar('Comprehension', subPercents.comprehension)}
        ${subscoreBar('Conversation', subPercents.conversation)}
        ${subscoreBar('Production', subPercents.production)}
      </div>
      <section class="review-section">
        <h3>Question review</h3>
        <ul class="review-list">${reviewHtml}</ul>
      </section>`;
  }

  function subscoreBar(label, pct) {
    return `<div class="subscore-row">
      <div class="subscore-label"><span>${label}</span><span>${pct}%</span></div>
      <div class="subscore-bar"><div class="subscore-fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  return { gradeQuestion, computeScores, renderResults };
})();
