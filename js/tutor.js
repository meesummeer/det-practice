/**
 * Tutor panel — EN + Roman Urdu explanations after each answer
 */
const Tutor = (function () {
  const OVERRIDES = {
    fb03: {
      explanationEN: "The word 'alleviate' means to reduce or ease something negative. The sentence describes a treaty trying to reduce tensions — 'alleviate' is the only option that means 'to ease or lessen'. 'Exacerbate' means the opposite (make worse), 'provoke' means to cause, and 'ignore' doesn't fit a treaty's purpose.",
      explanationUR: "Yahan 'alleviate' sahi hai kyunki iska matlab hai 'kam karna ya halka karna'. Sentence mein treaty ka kaam tensions kam karna tha — toh sirf 'alleviate' fit baith'ta hai. 'Exacerbate' ulta matlab rakhta hai yaani 'barhana', isliye woh galat hai.",
      memoryTip: "Root: lev = light (elevate, alleviate). Alleviate = make lighter/easier."
    }
  };

  function correctAnswerText(q) {
    switch (q.type) {
      case 'read-select':
        return (q.correct || []).join(', ');
      case 'fill-blanks':
      case 'identify-idea':
      case 'title-passage':
        return q.options && q.correct !== undefined ? q.options[q.correct] : '';
      case 'read-complete':
        return q.fullPassage || (q.gaps || []).map(g => g.answer).join(', ');
      case 'complete-sentences':
        return (q.blanks || []).map((b, i) => `${i + 1}: ${b.options[b.correct]}`).join('; ');
      case 'complete-passage':
      case 'highlight-answer':
        return q.sentences && q.correct !== undefined ? q.sentences[q.correct] : '';
      case 'write-photo':
      case 'interactive-writing':
      case 'writing-sample':
        return q.sample || 'See sample response.';
      default:
        return '';
    }
  }

  function generateEN(q) {
    if (q.explanationEN) return q.explanationEN;
    if (OVERRIDES[q.id]) return OVERRIDES[q.id].explanationEN;
    const ans = correctAnswerText(q);
    switch (q.type) {
      case 'fill-blanks':
        return `The correct answer is "${ans}". Read the full sentence: the blank must match both grammar (verb tense, subject) and meaning. The other options either mean the opposite, do not collocate, or break the logic of the sentence.`;
      case 'read-select':
        return `The real words are: ${ans}. Fake DET words look English but are invented — they often have strange endings or cannot be used naturally in a sentence. Trust the words you have seen in reading and academic texts.`;
      case 'read-complete':
        return `Type only the missing letters for each gap (${ans}). Use the letters before and after each blank to guess the full word, then enter just the hidden letters — not the whole word.`;
      case 'highlight-answer':
        return `The correct sentence directly answers: "${q.question}". It says: "${ans}". Other sentences mention related ideas but do not answer this specific question.`;
      case 'identify-idea':
      case 'title-passage':
        return `"${ans}" is correct because it summarizes the entire passage. Wrong choices focus on one small detail, are off-topic, or are too general to match what the passage actually discusses.`;
      case 'complete-passage':
        return `"${ans}" fits the gap because it continues the logic of the passage. Sentences that change topic or add unrelated facts should be eliminated first.`;
      case 'complete-sentences':
        return `Each dropdown must match grammar in context. Correct choices: ${ans}. Check subject–verb agreement and tense before you choose.`;
      case 'write-photo':
      case 'interactive-writing':
      case 'writing-sample':
        return `A strong response stays on topic, uses clear sentences, and meets the word count. Compare your answer to the model sample. Structure: state your point, give reasons, and end with a short conclusion.`;
      default:
        return `The correct answer is: ${ans}. Notice how the question wording points you to specific words in the passage or sentence.`;
    }
  }

  function generateUR(q) {
    if (q.explanationUR) return q.explanationUR;
    if (OVERRIDES[q.id]) return OVERRIDES[q.id].explanationUR;
    const ans = correctAnswerText(q);
    switch (q.type) {
      case 'fill-blanks':
        return `Sahi jawab "${ans}" hai. Poora sentence parho — grammar aur meaning dono se match hona chahiye. Baqi options sentence ka matlab badal dete hain ya natural nahi lagte.`;
      case 'read-select':
        return `Asli words: ${ans}. Fake words real lagte hain lekin use nahi hote — agar sentence mein rakho toh ajeeb lagta hai. Jo words pehle parh chuke ho, un par trust karo.`;
      case 'read-complete':
        return `Har blank mein sirf missing letters likho (${ans}). Pehle/baad ke letters se word guess karo — poora word mat likho.`;
      case 'highlight-answer':
        return `Sahi sentence woh hai jo "${q.question}" ka direct jawab de. Baqi lines topic se related ho sakti hain lekin exact answer nahi hain.`;
      case 'identify-idea':
      case 'title-passage':
        return `"${ans}" sahi hai kyunki poora passage cover karta hai. Galat options chhoti detail ya off-topic hain.`;
      case 'complete-passage':
        return `"${ans}" gap ke liye best hai — flow break nahi hota. Jo sentence topic change kare, usko pehle eliminate karo.`;
      case 'complete-sentences':
        return `Grammar check karo: ${ans}. Subject singular hai toh verb bhi singular honi chahiye.`;
      case 'write-photo':
      case 'interactive-writing':
      case 'writing-sample':
        return `Topic par focus rakho, clear sentences likho, word count poora karo. Sample answer se ideas lo — point, reasons, short conclusion.`;
      default:
        return `Sahi jawab: ${ans}. Question ke keywords passage mein dhoondo — wahi clue dete hain.`;
    }
  }

  function memoryTip(q) {
    return q.memoryTip || q.hint || OVERRIDES[q.id]?.memoryTip || 'Yaad rakho: hamesha poora context parho — sirf blank mat dekho.';
  }

  function renderPanel(container, q, grade, answer) {
    const correct = grade.status === 'correct' || grade.status === 'partial';
    const writingTypes = ['write-photo', 'interactive-writing', 'writing-sample'];
    let writingBlock = '';
    if (writingTypes.includes(q.type) && answer?.text) {
      const j = judgeWriting(answer.text, q.minWords, q.qtext);
      writingBlock = `<div class="tutor-writing-ai"><strong>Writing check:</strong> ${escapeHtml(j.feedback)} (${j.wordCount} words)</div>`;
    }

    if (correct) {
      container.innerHTML = `
        <div class="tutor-panel tutor-correct" role="status">
          <div class="tutor-icon anim-check">✓</div>
          <p class="tutor-title">Bohat acha! Correct!</p>
          <p class="tutor-tip-en"><strong>Exam tip:</strong> ${escapeHtml(q.tip || 'Keep using context clues on the real DET.')}</p>
          <p class="tutor-tip-ur"><strong>Roman Urdu:</strong> ${escapeHtml(urTipShort(q))}</p>
          ${writingBlock}
        </div>`;
    } else {
      const ans = correctAnswerText(q);
      const fullText = q.type === 'read-complete' && (q.fullPassage || Renderer.revealFullPassage(q))
        ? `<div class="tutor-answer-box"><strong>Full text:</strong> ${escapeHtml(q.fullPassage || Renderer.revealFullPassage(q))}</div>`
        : '';
      container.innerHTML = `
        <div class="tutor-panel tutor-wrong" role="status">
          <div class="tutor-icon anim-x">✗</div>
          <p class="tutor-title">Galat — sahi jawab dekho</p>
          <div class="tutor-answer-box"><strong>Correct:</strong> ${escapeHtml(ans)}</div>
          ${fullText}
          <p class="tutor-explain-en">${escapeHtml(generateEN(q))}</p>
          <p class="tutor-explain-ur">${escapeHtml(generateUR(q))}</p>
          <p class="tutor-memory"><strong>Memory tip:</strong> ${escapeHtml(memoryTip(q))}</p>
          ${writingBlock}
        </div>`;
    }
    container.classList.add('visible');
  }

  function urTipShort(q) {
    const tips = {
      'fill-blanks': "Blank se pehle baad poora sentence parho — sirf ek word mat dekho.",
      'read-select': "Jo word ajeeb lage ya kabhi na suna ho, woh fake ho sakta hai.",
      'read-complete': "Sirf missing letters type karo — poora word nahi.",
      default: "DET mein time kam hai — pehle question, phir options, phir answer."
    };
    return tips[q.type] || tips.default;
  }

  function hide(container) {
    container.innerHTML = '';
    container.classList.remove('visible');
  }

  return { renderPanel, hide, generateEN, generateUR, correctAnswerText, memoryTip };
})();
