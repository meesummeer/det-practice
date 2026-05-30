/**
 * DET Practice — Question Bank
 * Add questions by copying an existing object and changing id + content.
 * Required fields: id, type, tag, icon, qtext, qsub, hint, tip, section_score
 */

const QUESTION_TYPES = {
  READ_SELECT: 'read-select',
  FILL_BLANKS: 'fill-blanks',
  READ_COMPLETE: 'read-complete',
  WRITE_PHOTO: 'write-photo',
  INTERACTIVE_WRITING: 'interactive-writing',
  WRITING_SAMPLE: 'writing-sample',
  COMPLETE_SENTENCES: 'complete-sentences',
  COMPLETE_PASSAGE: 'complete-passage',
  HIGHLIGHT_ANSWER: 'highlight-answer',
  IDENTIFY_IDEA: 'identify-idea',
  TITLE_PASSAGE: 'title-passage',
  READ_ALOUD: 'read-aloud',
  SPEAK_PHOTO: 'speak-photo',
  READ_THEN_SPEAK: 'read-then-speak'
};

const SECTIONS = [
  {
    id: 'adaptive',
    name: 'Adaptive',
    breakTitle: 'Writing Section Next',
    breakTips: [
      'You will describe photos and write short essays under time limits.',
      'Plan quickly — timers cannot be paused on the real DET.',
      'Production score reflects writing length and effort in practice mode.'
    ]
  },
  {
    id: 'writing',
    name: 'Writing',
    breakTitle: 'Interactive Reading Next',
    breakTips: [
      'Read passages carefully before selecting answers.',
      'Complete Sentences and Complete Passage test grammar in context.',
      'Highlight Answer requires clicking the exact supporting sentence.'
    ]
  },
  {
    id: 'reading',
    name: 'Interactive Reading',
    breakTitle: 'Almost Done!',
    breakTips: [
      'Last section — stay focused!',
      'Highlight Answer needs the exact supporting sentence.',
      'Main idea and title questions need the whole passage in mind.'
    ]
  }
];

const TYPE_META = {
  'read-select': { tag: 'Read & Select', icon: '📖', section: 'adaptive', score: 'literacy' },
  'fill-blanks': { tag: 'Fill in the Blanks', icon: '✏️', section: 'adaptive', score: 'literacy' },
  'read-complete': { tag: 'Read & Complete', icon: '📝', section: 'adaptive', score: 'literacy' },
  'write-photo': { tag: 'Write About the Photo', icon: '🖼️', section: 'writing', score: 'production' },
  'interactive-writing': { tag: 'Interactive Writing', icon: '💬', section: 'writing', score: 'production' },
  'writing-sample': { tag: 'Writing Sample', icon: '📄', section: 'writing', score: 'production' },
  'complete-sentences': { tag: 'Complete the Sentences', icon: '🔗', section: 'reading', score: 'comprehension' },
  'complete-passage': { tag: 'Complete the Passage', icon: '📚', section: 'reading', score: 'comprehension' },
  'highlight-answer': { tag: 'Highlight the Answer', icon: '🔍', section: 'reading', score: 'comprehension' },
  'identify-idea': { tag: 'Identify the Idea', icon: '💡', section: 'reading', score: 'comprehension' },
  'title-passage': { tag: 'Title the Passage', icon: '🏷️', section: 'reading', score: 'comprehension' },
};

const TIMERS = {
  'write-photo': 60,
  'interactive-writing': 300,
  'writing-sample': 600,
};

const SPEAKING_TYPES = ['read-aloud', 'speak-photo', 'read-then-speak'];

function enrichExplanations(item) {
  if (item.explanationEN && item.explanationUR) return item;
  const ans = getCorrectAnswerText(item);
  const en = item.explanationEN || buildExplanationEN(item, ans);
  const ur = item.explanationUR || buildExplanationUR(item, ans);
  return {
    ...item,
    explanationEN: en,
    explanationUR: ur,
    memoryTip: item.memoryTip || item.hint || 'Context is key — read the full sentence or passage.'
  };
}

function getCorrectAnswerText(q) {
  switch (q.type) {
    case 'read-select': return (q.correct || []).join(', ');
    case 'fill-blanks':
    case 'identify-idea':
    case 'title-passage':
      return q.options && q.correct !== undefined ? q.options[q.correct] : '';
    case 'read-complete':
      return (q.gaps || []).map(g => g.answer).join('');
    case 'complete-sentences':
      return (q.blanks || []).map((b, i) => b.options[b.correct]).join('; ');
    case 'complete-passage':
    case 'highlight-answer':
      return q.sentences && q.correct !== undefined ? q.sentences[q.correct] : '';
    default:
      return q.sample || '';
  }
}

function buildExplanationEN(q, ans) {
  if (q.id === 'fb03') {
    return "The word 'alleviate' means to reduce or ease something negative. The sentence describes a treaty trying to reduce tensions — 'alleviate' is the only option that means 'to ease or lessen'. 'Exacerbate' means the opposite (make worse).";
  }
  switch (q.type) {
    case 'fill-blanks':
      return `The correct answer is "${ans}". Read the full sentence — only this option fits grammar and meaning. Other options change the logic or sound unnatural here.`;
    case 'read-select':
      return `Real words: ${ans}. Fake words look English but are invented; they often cannot be used naturally in a real sentence.`;
    case 'read-complete':
      return q.fullPassage
        ? `The complete sentence is: "${q.fullPassage}". Type only the missing letters in each blank — not the full word.`
        : `Missing letters: ${ans}. Use surrounding letters to guess each word, then type only the hidden letters.`;
    case 'highlight-answer':
      return `Correct: "${ans}". This sentence answers: "${q.question}". Other lines are related but not a direct answer.`;
    case 'identify-idea':
    case 'title-passage':
      return `"${ans}" summarizes the whole passage. Wrong options are too narrow, too broad, or off-topic.`;
    case 'complete-passage':
      return `"${ans}" fits the gap and keeps the passage logical. Eliminate sentences that change topic.`;
    case 'complete-sentences':
      return `Correct forms: ${ans}. Match subject, tense, and collocations in each blank.`;
    case 'write-photo':
    case 'interactive-writing':
    case 'writing-sample':
      return 'A strong answer is on-topic, uses clear sentences, and meets the word count. Compare with the sample response.';
    default:
      return `Correct answer: ${ans}. Notice how the question guides you to specific context words.`;
  }
}

function buildExplanationUR(q, ans) {
  if (q.id === 'fb03') {
    return "Yahan 'alleviate' sahi hai kyunki iska matlab hai 'kam karna'. Treaty tensions kam karti hai — 'alleviate' fit hai. 'Exacerbate' ulta hai yaani 'barhana'.";
  }
  switch (q.type) {
    case 'fill-blanks':
      return `Sahi jawab "${ans}" hai. Poora sentence parho — sirf yeh option grammar aur meaning se match karta hai.`;
    case 'read-select':
      return `Asli words: ${ans}. Fake words ajeeb lagte hain jab sentence mein use karo — instinct par trust karo.`;
    case 'read-complete':
      return q.fullPassage
        ? `Poora sentence: "${q.fullPassage}". Sirf blank wale letters likho — poora word nahi.`
        : `Missing letters: ${ans}. Sirf gap wale letters likho, poora word nahi.`;
    case 'highlight-answer':
      return `Sahi line: "${ans}". Ye "${q.question}" ka direct jawab hai.`;
    case 'identify-idea':
    case 'title-passage':
      return `"${ans}" poora passage cover karta hai. Galat options chhoti detail ya off-topic hain.`;
    case 'complete-passage':
      return `"${ans}" gap ke liye best hai — flow sahi rehta hai.`;
    case 'complete-sentences':
      return `Sahi forms: ${ans}. Subject aur verb match karo.`;
    case 'write-photo':
    case 'interactive-writing':
    case 'writing-sample':
      return 'Topic par raho, clear sentences likho, word count poora karo. Sample se ideas lo.';
    default:
      return `Sahi: ${ans}. Question ke keywords dhyan se parho.`;
  }
}

function q(base) {
  const meta = TYPE_META[base.type] || {};
  return enrichExplanations({
    section_score: meta.score || 'literacy',
    tag: base.tag || meta.tag,
    icon: base.icon || meta.icon,
    ...base
  });
}

const QUESTION_BANK = [
  // —— Read & Select (10+) ——
  q({ id: 'rs01', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Tap all words that exist. Ignore fake words.', hint: 'If a word looks almost right but feels wrong, it is probably fake.', tip: 'DET mixes pseudo-words with real vocabulary — trust your instinct.', words: [
    { text: 'ephemeral', real: true }, { text: 'florptine', real: false }, { text: 'resilient', real: true },
    { text: 'branthole', real: false }, { text: 'ubiquitous', real: true }, { text: 'mervish', real: false },
    { text: 'pragmatic', real: true }, { text: 'clentuous', real: false }
  ], correct: ['ephemeral', 'resilient', 'ubiquitous', 'pragmatic'] }),
  q({ id: 'rs02', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Choose only genuine vocabulary items.', hint: 'Sound the word aloud — nonsense words often break rhythm.', tip: 'Academic prefixes like sub-, trans-, inter- appear on real words.', words: [
    { text: 'ameliorate', real: true }, { text: 'torplish', real: false }, { text: 'dichotomy', real: true },
    { text: 'wexnify', real: false }, { text: 'paradigm', real: true }, { text: 'glorntic', real: false },
    { text: 'scrupulous', real: true }, { text: 'brevishun', real: false }
  ], correct: ['ameliorate', 'dichotomy', 'paradigm', 'scrupulous'] }),
  q({ id: 'rs03', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Eight words — four are real.', hint: 'Check if you have seen the word in reading before.', tip: 'B2–C2 vocabulary dominates this task.', words: [
    { text: 'cogent', real: true }, { text: 'plintar', real: false }, { text: 'tenuous', real: true },
    { text: 'frobbish', real: false }, { text: 'laconic', real: true }, { text: 'snorvate', real: false },
    { text: 'pernicious', real: true }, { text: 'quastrel', real: false }
  ], correct: ['cogent', 'tenuous', 'laconic', 'pernicious'] }),
  q({ id: 'rs04', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Real words only.', hint: 'Suffixes like -tion, -ous, -ive usually attach to real roots.', tip: 'Do not overthink — first instinct is often correct.', words: [
    { text: 'benevolent', real: true }, { text: 'crindol', real: false }, { text: 'surreptitious', real: true },
    { text: 'malkive', real: false }, { text: 'ostensible', real: true }, { text: 'thrindle', real: false },
    { text: 'equivocal', real: true }, { text: 'pontash', real: false }
  ], correct: ['benevolent', 'surreptitious', 'ostensible', 'equivocal'] }),
  q({ id: 'rs05', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Tap four real words.', hint: 'Fake words mimic English spelling patterns deliberately.', tip: 'Speed matters — do not define every word mentally.', words: [
    { text: 'mitigate', real: true }, { text: 'blorvex', real: false }, { text: 'prolific', real: true },
    { text: 'snazzle', real: false }, { text: 'arduous', real: true }, { text: 'quibnash', real: false },
    { text: 'esoteric', real: true }, { text: 'flimpton', real: false }
  ], correct: ['mitigate', 'prolific', 'arduous', 'esoteric'] }),
  q({ id: 'rs06', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Identify authentic vocabulary.', hint: 'Compound-looking fakes often lack a clear meaning.', tip: 'Partial credit does not exist — select all and only real words.', words: [
    { text: 'gregarious', real: true }, { text: 'thwompish', real: false }, { text: 'insidious', real: true },
    { text: 'crelvine', real: false }, { text: 'magnanimous', real: true }, { text: 'brastnel', real: false },
    { text: 'recalcitrant', real: true }, { text: 'glivnor', real: false }
  ], correct: ['gregarious', 'insidious', 'magnanimous', 'recalcitrant'] }),
  q({ id: 'rs07', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Four real, four fake.', hint: 'Latin/Greek roots appear in many academic real words.', tip: 'Practice with academic word lists before test day.', words: [
    { text: 'anomaly', real: true }, { text: 'frindlep', real: false }, { text: 'capricious', real: true },
    { text: 'morvex', real: false }, { text: 'inherent', real: true }, { text: 'plaxnor', real: false },
    { text: 'juxtapose', real: true }, { text: 'snorblat', real: false }
  ], correct: ['anomaly', 'capricious', 'inherent', 'juxtapose'] }),
  q({ id: 'rs08', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Select all legitimate words.', hint: 'If you cannot imagine it in a dictionary, skip it.', tip: 'Fake words are phonotactically plausible — stay alert.', words: [
    { text: 'alacrity', real: true }, { text: 'wexmond', real: false }, { text: 'fastidious', real: true },
    { text: 'clorvish', real: false }, { text: 'idiosyncrasy', real: true }, { text: 'branthic', real: false },
    { text: 'superfluous', real: true }, { text: 'mellvox', real: false }
  ], correct: ['alacrity', 'fastidious', 'idiosyncrasy', 'superfluous'] }),
  q({ id: 'rs09', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Real vocabulary only.', hint: 'Double letters in odd places may signal a fake.', tip: 'This is the first adaptive task type many test-takers see.', words: [
    { text: 'circumspect', real: true }, { text: 'plorvane', real: false }, { text: 'diminutive', real: true },
    { text: 'snazzwort', real: false }, { text: 'precarious', real: true }, { text: 'glentish', real: false },
    { text: 'voracious', real: true }, { text: 'braxnol', real: false }
  ], correct: ['circumspect', 'diminutive', 'precarious', 'voracious'] }),
  q({ id: 'rs10', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Tap the four real words.', hint: 'Meaning is not tested — only word authenticity.', tip: 'Over-selecting fake words hurts more than missing one real word.', words: [
    { text: 'obfuscate', real: true }, { text: 'trindlep', real: false }, { text: 'salient', real: true },
    { text: 'morplish', real: false }, { text: 'taciturn', real: true }, { text: 'flarnox', real: false },
    { text: 'veracity', real: true }, { text: 'quibwort', real: false }
  ], correct: ['obfuscate', 'salient', 'taciturn', 'veracity'] }),
  q({ id: 'rs11', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Eight words on screen.', hint: 'Stress pattern can sound unnatural on invented words.', tip: 'Keep moving — adaptive section adapts to your level.', words: [
    { text: 'parsimonious', real: true }, { text: 'clemtor', real: false }, { text: 'effervescent', real: true },
    { text: 'brindlox', real: false }, { text: 'intransigent', real: true }, { text: 'snorvish', real: false },
    { text: 'perfunctory', real: true }, { text: 'wexlard', real: false }
  ], correct: ['parsimonious', 'effervescent', 'intransigent', 'perfunctory'] }),

  // —— Fill in the Blanks (10+) ——
  q({ id: 'fb01', type: 'fill-blanks', qtext: 'The research findings were _____ by peer review before publication.', qsub: 'Choose the best word.', hint: 'You need a verb meaning checked or confirmed.', tip: 'Context before and after the blank defines word class.', options: ['vindicated', 'scrutinized', 'fabricated', 'dismissed'], correct: 1 }),
  q({ id: 'fb02', type: 'fill-blanks', qtext: 'Urban planners must _____ green space in new developments.', qsub: 'Academic vocabulary.', hint: 'Think integrate or include formally.', tip: 'Four options are close in register — pick the collocate.', options: ['incorporate', 'abandon', 'neglect', 'obscure'], correct: 0 }),
  q({ id: 'fb03', type: 'fill-blanks', qtext: 'The treaty aims to _____ tensions between the two nations.', qsub: 'Select the best fit.', hint: 'Reduce or ease conflicts.', tip: 'Read the full sentence once before scanning options.', options: ['exacerbate', 'alleviate', 'provoke', 'ignore'], correct: 1,
    explanationEN: "The word 'alleviate' means to reduce or ease something negative. The sentence describes a treaty trying to reduce tensions — 'alleviate' is the only option that means 'to ease or lessen'. 'Exacerbate' means the opposite (make worse).",
    explanationUR: "Yahan 'alleviate' sahi hai kyunki iska matlab hai 'kam karna ya halka karna'. Sentence mein treaty ka kaam tensions kam karna tha — toh sirf 'alleviate' fit baith'ta hai. 'Exacerbate' ulta matlab rakhta hai yaani 'barhana'." }),
  q({ id: 'fb04', type: 'fill-blanks', qtext: 'Her argument was so _____ that even critics conceded key points.', qsub: 'Positive adjective needed.', hint: 'Compelling and logical.', tip: 'Eliminate options with opposite meaning first.', options: ['cogent', 'spurious', 'trivial', 'ambiguous'], correct: 0 }),
  q({ id: 'fb05', type: 'fill-blanks', qtext: 'Scientists remain _____ about the long-term effects of the compound.', qsub: 'Academic tone.', hint: 'Not fully certain.', tip: 'Adjective–noun agreement can eliminate wrong choices.', options: ['certain', 'skeptical', 'ecstatic', 'indifferent'], correct: 1 }),
  q({ id: 'fb06', type: 'fill-blanks', qtext: 'The museum exhibit seeks to _____ colonial history through primary sources.', qsub: 'Verb of representation.', hint: 'Present or depict accurately.', tip: 'DET blanks often test academic verbs.', options: ['obscure', 'chronicle', 'erase', 'simplify'], correct: 1 }),
  q({ id: 'fb07', type: 'fill-blanks', qtext: 'Renewable energy adoption has _____ in the past decade.', qsub: 'Change over time.', hint: 'Increased sharply.', tip: 'Collocation: adoption + increased/surged.', options: ['stagnated', 'accelerated', 'collapsed', 'fluctuated'], correct: 1 }),
  q({ id: 'fb08', type: 'fill-blanks', qtext: 'The professor’s lecture was _____ with historical anecdotes.', qsub: 'Filled or enriched.', hint: 'Packed full of something.', tip: 'Preposition after blank may narrow choices.', options: ['devoid', 'replete', 'inconsistent', 'bereft'], correct: 1 }),
  q({ id: 'fb09', type: 'fill-blanks', qtext: 'Policy makers cannot _____ the economic impact of automation.', qsub: 'Must acknowledge.', hint: 'Ignore is wrong; they must face facts.', tip: 'Negative verbs like ignore often appear as traps.', options: ['overlook', 'disregard', 'underestimate', 'ignore'], correct: 2 }),
  q({ id: 'fb10', type: 'fill-blanks', qtext: 'The novel’s protagonist undergoes a profound _____ of identity.', qsub: 'Noun form needed.', hint: 'Transformation or rebirth.', tip: 'Watch word class: noun slot needs noun options.', options: ['crisis', 'metamorphosis', 'stagnation', 'rejection'], correct: 1 }),
  q({ id: 'fb11', type: 'fill-blanks', qtext: 'Data privacy laws _____ how companies collect user information.', qsub: 'Regulate or control.', hint: 'Govern or dictate rules.', tip: 'Subject–verb agreement: laws + plural verb.', options: ['mandate', 'prevent', 'encourage', 'abolish'], correct: 0 }),

  // —— Read & Complete (4+) ——
  q({ id: 'rc01', type: 'read-complete', qtext: 'Complete the text with the missing letters.', qsub: 'Type each missing letter.', hint: 'Use surrounding letters as strong clues.', tip: 'Tab moves to next blank on the real test — practice flow.', passage: 'Climate change poses an urgent ch____lenge to coastal cities worldwide.', gaps: [{ index: 0, answer: 'alle' }], fullPassage: 'Climate change poses an urgent challenge to coastal cities worldwide.' }),
  q({ id: 'rc02', type: 'read-complete', qtext: 'Fill in the missing letters.', qsub: 'Short academic snippet.', hint: 'The word means proof or support.', tip: 'Only missing letters are typed — not full words.', passage: 'The study provides comp___ling ev__ence for the hypothesis.', gaps: [{ index: 0, answer: 'ell' }, { index: 1, answer: 'id' }], fullPassage: 'The study provides compelling evidence for the hypothesis.' }),
  q({ id: 'rc03', type: 'read-complete', qtext: 'Complete the missing letters.', qsub: 'Read the whole sentence first.', hint: 'Technology + society keyword.', tip: 'Common letters: e, i, a appear often in gaps.', passage: 'Digital lit__acy is essential in modern ed_cation systems.', gaps: [{ index: 0, answer: 'er' }, { index: 1, answer: 'u' }], fullPassage: 'Digital literacy is essential in modern education systems.' }),
  q({ id: 'rc04', type: 'read-complete', qtext: 'Type the missing letters.', qsub: 'Academic register.', hint: 'Word means widespread.', tip: 'Do not type capital letters unless shown.', passage: 'Smartphones have become ub__uitous in urban house__olds.', gaps: [{ index: 0, answer: 'iq' }, { index: 1, answer: 'eh' }], fullPassage: 'Smartphones have become ubiquitous in urban households.' }),
  q({ id: 'rc05', type: 'read-complete', qtext: 'Complete the text.', qsub: 'Multiple gaps in one sentence.', hint: 'Renewable energy context.', tip: 'Wrong letters cannot be submitted — keep trying.', passage: 'Solar power offers a sust___inable alt__native to fossil fuels.', gaps: [{ index: 0, answer: 'ain' }, { index: 1, answer: 'er' }], fullPassage: 'Solar power offers a sustainable alternative to fossil fuels.' }),

  // —— Write About Photo (4+) ——
  q({ id: 'wp01', type: 'write-photo', qtext: 'Describe the image in at least one sentence.', qsub: 'You have 60 seconds. Write in English.', hint: 'Cover who, what, where, and what is happening.', tip: 'On DET, write 1–3 clear sentences — not an essay.', imageDesc: '[Photo: A busy farmers market with colorful fruit stalls and shoppers.]', minWords: 5, sample: 'This photo shows a lively farmers market. Vendors display fresh fruit while customers browse the stalls on a sunny day.' }),
  q({ id: 'wp02', type: 'write-photo', qtext: 'Write about what you see.', qsub: '60-second timer.', hint: 'Mention setting and main action first.', tip: 'Simple accurate grammar beats complex errors.', imageDesc: '[Photo: Two students studying together in a library with laptops and books.]', minWords: 5, sample: 'Two students are studying in a quiet library. They are using laptops and reading books at a shared table.' }),
  q({ id: 'wp03', type: 'write-photo', qtext: 'Describe the photo.', qsub: 'Timed: 60 seconds.', hint: 'Use present continuous for actions.', tip: 'Do not leave blank — any attempt counts for practice scoring.', imageDesc: '[Photo: A family walking a dog in a park with autumn trees.]', minWords: 5, sample: 'A family is walking their dog in a park. The trees have orange leaves, suggesting it is autumn.' }),
  q({ id: 'wp04', type: 'write-photo', qtext: 'Describe the scene.', qsub: 'Write at least one full sentence.', hint: 'Include location and people.', tip: 'DET scores production partly on length and relevance.', imageDesc: '[Photo: A chef preparing food in an open kitchen restaurant.]', minWords: 5, sample: 'A chef is preparing food in an open restaurant kitchen. Customers can watch the cooking process.' }),
  q({ id: 'wp05', type: 'write-photo', qtext: 'Write about the image.', qsub: '60 seconds.', hint: 'Start with "The image shows..." if stuck.', tip: 'Check spelling quickly — minor errors are OK.', imageDesc: '[Photo: Cyclists riding on a dedicated bike lane in a modern city.]', minWords: 5, sample: 'Several cyclists are riding on a bike lane in a city. The lane is separated from car traffic for safety.' }),

  // —— Interactive Writing (3+) ——
  q({ id: 'iw01', type: 'interactive-writing', qtext: 'Do you agree that remote work improves productivity?', qsub: 'Write at least 50 words in 5 minutes.', hint: 'State opinion, give two reasons, brief conclusion.', tip: 'DET Interactive Writing has follow-up prompts — practice both sides.', minWords: 50, sample: 'I partially agree. Remote work reduces commute stress and allows flexible schedules, which can boost focus. However, collaboration may suffer without in-person meetings. Overall, productivity depends on the role and self-discipline of the worker.' }),
  q({ id: 'iw02', type: 'interactive-writing', qtext: 'Should universities require community service for graduation?', qsub: '5-minute timed response.', hint: 'Balance civic benefit vs. student choice.', tip: 'Use connectors: however, furthermore, in conclusion.', minWords: 50, sample: 'I believe optional service is better than a requirement. Mandatory hours may feel insincere and burden busy students. Universities should encourage volunteering through incentives while respecting diverse student circumstances.' }),
  q({ id: 'iw03', type: 'interactive-writing', qtext: 'Is social media harmful to teenagers?', qsub: 'Opinion essay — 50+ words.', hint: 'Acknowledge both benefits and risks.', tip: 'Specific examples strengthen production score.', minWords: 50, sample: 'Social media can harm teenagers by increasing anxiety and sleep disruption, yet it also provides community and learning resources. Parents and schools should teach digital literacy rather than banning platforms entirely.' }),
  q({ id: 'iw04', type: 'interactive-writing', qtext: 'Should governments invest more in public transportation?', qsub: 'Write for 5 minutes.', hint: 'Environment, equity, and cost angles.', tip: 'Stay on topic — tangents waste limited time.', minWords: 50, sample: 'Governments should invest more in public transit because it reduces emissions and congestion. Reliable buses and trains also help low-income workers access jobs. The upfront cost is high, but long-term economic and health benefits justify it.' }),

  // —— Writing Sample (1) ——
  q({ id: 'ws01', type: 'writing-sample', qtext: 'Describe a challenge you overcame and what you learned from it.', qsub: 'Write 150–300 words. This sample is ungraded in practice mode.', hint: 'Use past tense for the story; present for lessons learned.', tip: 'On DET this goes to institutions — keep it appropriate and clear.', minWords: 150, maxWords: 300, sample: 'Last year I struggled to adapt when my family moved to a new country. I missed friends and felt lost in a different school system. I joined a language club and asked teachers for help instead of staying silent. Within months my confidence grew. I learned that asking for support is strength, not weakness, and that small daily efforts compound. Now I welcome change more calmly because I trust my ability to adapt.' }),

  // —— Complete the Sentences (4+) ——
  q({ id: 'cs01', type: 'complete-sentences', qtext: 'Complete the sentences in the passage.', qsub: 'Choose the best word for each blank.', hint: 'Read the whole paragraph for coherence.', tip: 'Each dropdown is independent but context-linked.', passage: 'Renewable energy is growing rapidly. Solar panels ___1___ cheaper each year. Governments ___2___ incentives to speed adoption.', blanks: [
    { id: 'b1', options: ['become', 'became', 'becoming', 'becomes'], correct: 0 },
    { id: 'b2', options: ['offer', 'offers', 'offered', 'offering'], correct: 0 }
  ] }),
  q({ id: 'cs02', type: 'complete-sentences', qtext: 'Select the best option for each gap.', qsub: 'Interactive reading — sentences.', hint: 'Tense must match "every morning".', tip: 'Wrong grammar in one blank can hint the next fix.', passage: 'Dr. Chen studies sleep. Every morning she ___1___ data from overnight recordings. Her team ___2___ patterns linked to memory.', blanks: [
    { id: 'b1', options: ['review', 'reviews', 'reviewed', 'reviewing'], correct: 1 },
    { id: 'b2', options: ['identify', 'identifies', 'identified', 'identifying'], correct: 1 }
  ] }),
  q({ id: 'cs03', type: 'complete-sentences', qtext: 'Fill each blank with the correct word.', qsub: 'Academic passage.', hint: 'Formal register: "demonstrate" not "show off".', tip: 'Read aloud quietly to test collocations.', passage: 'The experiment ___1___ that plants grow faster with consistent light. Results ___2___ earlier studies on photosynthesis.', blanks: [
    { id: 'b1', options: ['demonstrates', 'demonstrate', 'demonstrated', 'demonstrating'], correct: 0 },
    { id: 'b2', options: ['support', 'supports', 'supported', 'supporting'], correct: 1 }
  ] }),
  q({ id: 'cs04', type: 'complete-sentences', qtext: 'Complete all blanks.', qsub: 'Two dropdowns.', hint: 'Cause and effect connectors.', tip: 'DET may add more blanks in longer passages.', passage: 'City noise pollution ___1___ residents at night. New ordinances ___2___ limit construction hours.', blanks: [
    { id: 'b1', options: ['disturb', 'disturbs', 'disturbed', 'disturbing'], correct: 1 },
    { id: 'b2', options: ['will', 'would', 'could', 'should'], correct: 0 }
  ] }),
  q({ id: 'cs05', type: 'complete-sentences', qtext: 'Choose words that fit the passage.', qsub: 'Grammar in context.', hint: 'Plural subject needs plural verb.', tip: 'Skip and return if stuck — time is shared across section.', passage: 'Many startups fail within five years. Founders who ___1___ customer feedback often ___2___ longer.', blanks: [
    { id: 'b1', options: ['ignore', 'ignores', 'ignored', 'ignoring'], correct: 0 },
    { id: 'b2', options: ['survive', 'survives', 'survived', 'surviving'], correct: 0 }
  ] }),

  // —— Complete the Passage (3+) ——
  q({ id: 'cp01', type: 'complete-passage', qtext: 'Select the best sentence to fill the gap.', qsub: 'One sentence is missing.', hint: 'Look for topic continuity and pronoun reference.', tip: 'Wrong sentence often repeats ideas awkwardly.', passage: 'Artificial intelligence is transforming healthcare. Doctors use algorithms to detect diseases earlier. ___GAP___', gapIndex: 2, sentences: [
    'Therefore, cooking recipes are easier to find online.',
    'However, ethical guidelines are essential to protect patient privacy.',
    'Basketball remains popular in many countries.',
    'Fish migrate thousands of miles each year.'
  ], correct: 1 }),
  q({ id: 'cp02', type: 'complete-passage', qtext: 'Choose the sentence that best completes the passage.', qsub: 'Logical flow.', hint: 'The gap needs a contrast or example of remote learning.', tip: 'Read sentence before AND after the gap.', passage: 'Online education expanded during the pandemic. Students attended classes from home using video software. ___GAP___', gapIndex: 2, sentences: [
    'Despite challenges, many learners valued flexible schedules.',
    'The moon orbits Earth approximately every 27 days.',
    'Shoes should be replaced when soles wear thin.',
    'Ancient Rome had complex aqueduct systems.'
  ], correct: 0 }),
  q({ id: 'cp03', type: 'complete-passage', qtext: 'Insert the best sentence.', qsub: 'Cohesion matters.', hint: 'Microplastics sentence should relate to oceans.', tip: 'Eliminate off-topic options immediately.', passage: 'Ocean pollution threatens marine life. Plastic waste breaks into tiny particles. ___GAP___', gapIndex: 2, sentences: [
    'These microplastics enter the food chain and harm ecosystems.',
    'Opera singers train for years to project their voices.',
    'Winter sports require proper insulation and gear.',
    'Libraries lend books to members of the community.'
  ], correct: 0 }),
  q({ id: 'cp04', type: 'complete-passage', qtext: 'Pick the sentence that fits.', qsub: 'Passage completion.', hint: 'Needs a conclusion about biodiversity.', tip: 'First and last sentences of options are clues.', passage: 'Rainforests contain enormous biodiversity. Logging and farming reduce habitat area. ___GAP___', gapIndex: 2, sentences: [
    'Protecting forests is critical for global ecological balance.',
    'Smartphones use lithium-ion batteries.',
    'Poetry festivals celebrate local authors each spring.',
    'Highway construction requires engineering surveys.'
  ], correct: 0 }),

  // —— Highlight the Answer (3+) ——
  q({ id: 'ha01', type: 'highlight-answer', qtext: 'Click the sentence that answers the question.', qsub: 'Why do cities plant trees?', hint: 'Find the sentence that gives a direct reason.', tip: 'Only one sentence should fully answer the prompt.', question: 'Why do cities plant trees along streets?', sentences: [
    'Urban planners design many types of infrastructure.',
    'Trees reduce heat and improve air quality in dense neighborhoods.',
    'Some buildings are hundreds of years old.',
    'Traffic lights control flow at intersections.'
  ], correct: 1 }),
  q({ id: 'ha02', type: 'highlight-answer', qtext: 'Highlight the correct sentence.', qsub: 'Read the question carefully.', hint: 'Look for "because" or clear causal language.', tip: 'Do not click the question — click a passage sentence.', question: 'According to the passage, why did the team delay the launch?', sentences: [
    'The product launch was scheduled for March.',
    'Engineers discovered a software bug that required another week of testing.',
    'Marketing designed new logos for the campaign.',
    'Customers prefer mobile apps with dark mode.'
  ], correct: 1 }),
  q({ id: 'ha03', type: 'highlight-answer', qtext: 'Select the sentence that best answers the question.', qsub: 'One click only.', hint: 'Definition of photosynthesis is in one sentence.', tip: 'Supporting detail must match the question exactly.', question: 'What is photosynthesis?', sentences: [
    'Plants need water and sunlight to survive.',
    'Photosynthesis is the process plants use to convert light into chemical energy.',
    'Gardeners fertilize soil in spring.',
    'Bees pollinate many flowering species.'
  ], correct: 1 }),
  q({ id: 'ha04', type: 'highlight-answer', qtext: 'Click the answer sentence.', qsub: 'Detail question.', hint: 'Find the statistic or number reference.', tip: 'DET may use longer passages — scan for keywords.', question: 'How much water can a camel drink at one time?', sentences: [
    'Camels live in arid regions of Africa and Asia.',
    'A thirsty camel can drink up to 40 gallons in one session.',
    'Desert temperatures vary greatly between day and night.',
    'Merchants traded spices along historic routes.'
  ], correct: 1 }),

  // —— Identify the Idea (3+) ——
  q({ id: 'ii01', type: 'identify-idea', qtext: 'What is the main idea of the passage?', qsub: 'Choose one answer.', hint: 'Main idea covers the whole passage, not one detail.', tip: 'Too narrow or too broad options are distractors.', passage: 'Sleep deprivation impairs memory, mood, and immune response. Experts recommend seven to nine hours for adults. Consistent schedules help the body maintain circadian rhythm.', options: ['Sleep is unimportant for health', 'Adequate sleep is vital for physical and mental health', 'Adults should never nap', 'Circadian rhythm only affects plants'], correct: 1 }),
  q({ id: 'ii02', type: 'identify-idea', qtext: 'Select the main idea.', qsub: 'MCQ from passage.', hint: 'Ask: what is the author mostly explaining?', tip: 'First sentence is not always the main idea.', passage: 'Recycling reduces landfill waste but requires clean sorting. Contaminated items can ruin entire batches. Education campaigns improve community participation rates.', options: ['Landfills are located underground', 'Effective recycling depends on proper sorting and public awareness', 'All plastic biodegrades quickly', 'Campaigns are always unsuccessful'], correct: 1 }),
  q({ id: 'ii03', type: 'identify-idea', qtext: 'What is the passage mainly about?', qsub: 'Central idea.', hint: 'Synthesis across all sentences.', tip: 'Eliminate options mentioning only one detail.', passage: 'Remote teams use video calls, chat apps, and shared documents. Clear norms for response times prevent misunderstandings. Trust grows when managers focus on outcomes rather than hours online.', options: ['Chat apps are the only tool needed', 'Successful remote work needs communication tools and thoughtful management', 'Managers should monitor keystrokes', 'Video calls are obsolete'], correct: 1 }),
  q({ id: 'ii04', type: 'identify-idea', qtext: 'Identify the main idea.', qsub: 'Reading comprehension.', hint: 'Topic = electric vehicles, angle = growth factors.', tip: 'Paraphrase the passage in one sentence before choosing.', passage: 'Electric vehicle sales rose as battery costs fell and charging networks expanded. Governments offered tax credits to early buyers. Consumer concern about emissions also drove demand.', options: ['Tax credits are illegal', 'Multiple factors have accelerated electric vehicle adoption', 'Batteries cannot be recycled', 'Charging networks are unnecessary'], correct: 1 }),

  // —— Title the Passage (2+) ——
  q({ id: 'tp01', type: 'title-passage', qtext: 'Choose the best title for the passage.', qsub: 'Title must cover full content.', hint: 'Avoid titles that are too specific or vague.', tip: 'DET titles are short — think headline.', passage: 'Volcanoes form where tectonic plates meet. Magma rises and erupts as lava, ash, and gas. Communities nearby monitor activity to reduce harm.', options: ['How Volcanoes Form and Affect Nearby Areas', 'Cooking with Lava', 'The History of Basketball', 'Why Cats Purr'], correct: 0 }),
  q({ id: 'tp02', type: 'title-passage', qtext: 'Select the best title.', qsub: 'Headline style.', hint: 'Passage is about mindfulness benefits.', tip: 'Wrong titles may use passage words in wrong context.', passage: 'Mindfulness meditation reduces stress hormones in clinical studies. Practitioners report better focus after eight weeks of daily practice. Schools and workplaces now offer short guided sessions.', options: ['Evidence for Mindfulness Benefits in Daily Life', 'Meditation Equipment Shopping Guide', 'Professional Sports Salaries', 'How to Build a Wooden Boat'], correct: 0 }),
  q({ id: 'tp03', type: 'title-passage', qtext: 'Pick the most accurate title.', qsub: 'Covers entire passage.', hint: 'Digital privacy theme.', tip: 'If two seem right, pick the more comprehensive one.', passage: 'Apps collect location, contacts, and browsing data. Users rarely read lengthy terms of service. Stronger laws now require clearer consent forms in several countries.', options: ['Growing Concerns and Regulation Around Digital Privacy', 'The Best Smartphone Games of 2020', 'How to Train for a Marathon', 'Traditional Farming in the 1800s'], correct: 0 }),

  // —— Read Aloud (3+) ——
  q({ id: 'ra01', type: 'read-aloud', qtext: 'Read the sentence aloud clearly.', qsub: 'Use the mock recorder, then self-assess.', hint: 'Pace yourself — not too fast.', tip: 'DET scores pronunciation and fluency automatically.', sentence: 'The conference will begin at nine o\'clock tomorrow morning.', sample: 'Clear pronunciation of "conference", "nine o\'clock", and steady pace.' }),
  q({ id: 'ra02', type: 'read-aloud', qtext: 'Read this sentence aloud.', qsub: '20 seconds preparation implied.', hint: 'Emphasize content words slightly.', tip: 'Read the full sentence once silently first.', sentence: 'Researchers published their findings in a peer-reviewed journal last month.', sample: 'Stress "researchers", "peer-reviewed", and "journal" naturally.' }),
  q({ id: 'ra03', type: 'read-aloud', qtext: 'Record yourself reading the sentence.', qsub: 'Self-assess when done.', hint: 'Do not pause mid-clause.', tip: 'Intonation should fall at the end of statements.', sentence: 'Students who practice daily tend to improve more quickly than occasional learners.', sample: 'Smooth delivery without unnatural pauses between "students" and "improve".' }),
  q({ id: 'ra04', type: 'read-aloud', qtext: 'Read aloud:', qsub: 'Mock recording.', hint: 'Numbers and dates need clear articulation.', tip: 'If you stumble, continue — perfection is not required.', sentence: 'The museum is open from Tuesday to Sunday, ten a.m. to six p.m.', sample: 'Read "Tuesday to Sunday" and times distinctly.' }),

  // —— Speak About Photo (2+) ——
  q({ id: 'sp01', type: 'speak-photo', qtext: 'Describe the photo for 30–90 seconds.', qsub: 'Mock recorder — self-assess after.', hint: 'Structure: introduction, details, conclusion.', tip: 'DET allows prep time — use it to note 3 details.', imageDesc: '[Photo: A barista making latte art in a café.]', sample: 'This image shows a barista in a café pouring steamed milk to create latte art. The counter has cups and a coffee machine. It looks like a busy morning service.' }),
  q({ id: 'sp02', type: 'speak-photo', qtext: 'Speak about what you see.', qsub: '90 second limit in practice.', hint: 'Mention colors, actions, and setting.', tip: 'Keep talking until time ends — silence hurts scores.', imageDesc: '[Photo: Children playing soccer on a grassy field.]', sample: 'In this photo, children are playing soccer on a green field. Some wear team uniforms. Trees and goals are visible in the background on a sunny day.' }),
  q({ id: 'sp03', type: 'speak-photo', qtext: 'Describe the image aloud.', qsub: 'Self-rated speaking task.', hint: 'Use linking words: also, in the background, meanwhile.', tip: 'Fluency counts as much as vocabulary.', imageDesc: '[Photo: An office worker giving a presentation with charts on a screen.]', sample: 'A professional is giving a presentation in an office. Colleagues sit at a table while charts appear on a large screen.' }),

  // —— Read Then Speak (3+) ——
  q({ id: 'rts01', type: 'read-then-speak', qtext: 'Read the prompt, then speak your answer.', qsub: 'Answer the question in 90 seconds.', hint: 'Answer all parts: opinion + reason + example.', tip: 'DET gives a question after a short prompt — organize quickly.', prompt: 'Some people prefer living in big cities. Others prefer small towns. Which do you prefer and why?', sample: 'I prefer living in a big city because it offers career opportunities and cultural events. For example, I can attend concerts and networking meetups. However, I recognize that rent is higher, so I would choose a smaller apartment.' }),
  q({ id: 'rts02', type: 'read-then-speak', qtext: 'Read, then respond aloud.', qsub: 'Timed speaking.', hint: 'Use PEEL: point, explain, example, link.', tip: 'Do not read the prompt word-for-word in your answer.', prompt: 'Describe a book or article that influenced your thinking. What was it about and how did it change you?', sample: 'A biography of Marie Curie influenced me deeply. It showed perseverance in science despite discrimination. It changed how I view setbacks — as part of long-term growth rather than failure.' }),
  q({ id: 'rts03', type: 'read-then-speak', qtext: 'Read the topic and speak.', qsub: 'Self-assess fluency and content.', hint: 'Give a clear yes/no or preference first.', tip: 'Practice brainstorming examples under 15 seconds.', prompt: 'Should schools teach financial literacy? Give your opinion with one reason.', sample: 'Yes, schools should teach financial literacy because many students lack basic skills like budgeting and understanding interest. Early education prevents costly mistakes in adulthood.' }),
  q({ id: 'rts04', type: 'read-then-speak', qtext: 'Respond to the prompt orally.', qsub: '90 seconds.', hint: 'Compare two options if the prompt asks.', tip: 'Recording stops automatically on DET — practice pacing.', prompt: 'Is it better to learn a skill online or in a classroom? Explain your choice.', sample: 'I think classroom learning is better for skills needing hands-on feedback, such as lab science. Online learning works well for flexible review of theory, but real-time questions help me most in person.' }),

  // —— Additional bank items (80+ total) ——
  q({ id: 'rs12', type: 'read-select', qtext: 'Select the real English words.', qsub: 'Four real words.', hint: 'Scientific vocabulary cluster.', tip: 'Fake words often end in unusual consonant clusters.', words: [
    { text: 'hypothesis', real: true }, { text: 'grindlep', real: false }, { text: 'empirical', real: true },
    { text: 'snorvex', real: false }, { text: 'corroborate', real: true }, { text: 'blenvar', real: false },
    { text: 'synthesis', real: true }, { text: 'twaxnor', real: false }
  ], correct: ['hypothesis', 'empirical', 'corroborate', 'synthesis'] }),
  q({ id: 'fb12', type: 'fill-blanks', qtext: 'The diplomat attempted to _____ negotiations after the incident.', qsub: 'Verb needed.', hint: 'Restart or resume talks.', tip: 'Formal register fits diplomatic context.', options: ['suspend', 'resume', 'abandon', 'ignore'], correct: 1 }),
  q({ id: 'rc06', type: 'read-complete', qtext: 'Complete missing letters.', qsub: 'One gap.', hint: 'Synonym for begin.', tip: 'Type lowercase only.', passage: 'The experiment will comm___nce next Monday.', gaps: [{ index: 0, answer: 'e' }], fullPassage: 'The experiment will commence next Monday.' }),
  q({ id: 'rc07', type: 'read-complete', qtext: 'Complete the missing letters.', qsub: 'Two gaps in one sentence.', hint: 'Technology vocabulary.', tip: 'Count underscores — type that many letters.', passage: 'Art___ficial intelligence is transform___ng industries worldwide.', gaps: [{ index: 0, answer: 'i' }, { index: 1, answer: 'i' }], fullPassage: 'Artificial intelligence is transforming industries worldwide.' }),
  q({ id: 'ha05', type: 'highlight-answer', qtext: 'Highlight the sentence that answers the question.', qsub: 'Detail in passage.', hint: 'Find mention of cost.', tip: 'Question keywords appear in the correct sentence.', question: 'Why did the startup reduce staff?', sentences: [
    'The startup grew quickly in its first year.',
    'Rising server costs forced the company to reduce staff by ten percent.',
    'Employees enjoy flexible schedules.',
    'The CEO spoke at a technology conference.'
  ], correct: 1 }),
  q({ id: 'ii05', type: 'identify-idea', qtext: 'Main idea?', qsub: 'Full passage.', hint: 'Focus on vaccination topic.', tip: 'Main idea is not a single fact from one sentence.', passage: 'Vaccination programs reduced childhood disease rates dramatically. Herd immunity protects those who cannot be vaccinated. Public education remains essential to maintain trust.', options: ['Vaccines are unnecessary', 'Vaccination programs benefit individuals and communities', 'Only children need doctors', 'Education is unrelated to health'], correct: 1 }),
  q({ id: 'cs06', type: 'complete-sentences', qtext: 'Complete the passage.', qsub: 'Two blanks.', hint: 'Present tense for general truths.', tip: 'Dropdown labels match passage numbers.', passage: 'Water ___1___ at one hundred degrees Celsius at sea level. This ___2___ a well-known physical property.', blanks: [
    { id: 'b1', options: ['boil', 'boils', 'boiled', 'boiling'], correct: 1 },
    { id: 'b2', options: ['is', 'are', 'was', 'were'], correct: 0 }
  ] }),
  q({ id: 'cp05', type: 'complete-passage', qtext: 'Best sentence for the gap?', qsub: 'Passage logic.', hint: 'Needs example of renewable source.', tip: 'Sentence after gap may reference "these sources".', passage: 'Countries invest in wind and solar power. ___GAP___', gapIndex: 1, sentences: [
    'These sources produce electricity without burning fossil fuels.',
    'Basketball is played with five players per team.',
    'Poets often use metaphor in literature.',
    'The restaurant opens at noon on weekdays.'
  ], correct: 0 }),
  q({ id: 'wp06', type: 'write-photo', qtext: 'Describe the image.', qsub: '60 seconds.', hint: 'Weather and activity.', tip: 'Mention at least two visible elements.', imageDesc: '[Photo: People with umbrellas waiting at a rainy bus stop.]', minWords: 5, sample: 'Several people are waiting at a bus stop in the rain. They hold umbrellas while a bus approaches on a wet street.' }),
  q({ id: 'ra05', type: 'read-aloud', qtext: 'Read aloud clearly.', qsub: 'Mock recorder.', hint: 'Chunk long noun phrases.', tip: 'Practice difficult consonant clusters slowly.', sentence: 'International students must submit documentation before the enrollment deadline.', sample: 'Steady pace through "international", "documentation", and "enrollment".' }),
  q({ id: 'sp04', type: 'speak-photo', qtext: 'Describe the photo.', qsub: 'Speak 30–90 seconds.', hint: 'Who and what activity.', tip: 'Keep speaking until the timer ends.', imageDesc: '[Photo: A musician playing guitar on a street corner.]', sample: 'A street musician is playing guitar on a sidewalk. Passersby stop to listen near shops and parked cars.' }),
  q({ id: 'iw05', type: 'interactive-writing', qtext: 'Should plastic bags be banned in supermarkets?', qsub: '50+ words, 5 minutes.', hint: 'Environment vs convenience.', tip: 'One paragraph is enough if well structured.', minWords: 50, sample: 'I support banning single-use plastic bags because they pollute oceans and harm wildlife. Reusable bags are inexpensive and durable. Stores can offer paper or cloth alternatives so shoppers adapt quickly.' }),
  q({ id: 'rts05', type: 'read-then-speak', qtext: 'Read and respond.', qsub: '90 seconds.', hint: 'Describe a person and quality.', tip: 'Use past tense for memories.', prompt: 'Who has been a positive influence in your life? Describe them and explain their impact.', sample: 'My high school English teacher influenced me most. She encouraged critical reading and revision. Her feedback improved my writing confidence and academic performance.' })
];

// Session picks ~30 questions: weighted by section
const SESSION_TARGETS = {
  adaptive: { 'read-select': 4, 'fill-blanks': 4, 'read-complete': 2 },
  writing: { 'write-photo': 2, 'interactive-writing': 2, 'writing-sample': 1 },
  reading: { 'complete-sentences': 2, 'complete-passage': 2, 'highlight-answer': 2, 'identify-idea': 2, 'title-passage': 1 }
};

const ACTIVE_QUESTION_BANK = QUESTION_BANK.filter(q => !SPEAKING_TYPES.includes(q.type));

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSessionQuestions() {
  const picked = [];
  const usedIds = new Set();

  Object.entries(SESSION_TARGETS).forEach(([sectionId, typeCounts]) => {
    Object.entries(typeCounts).forEach(([type, count]) => {
      const pool = shuffle(ACTIVE_QUESTION_BANK.filter(qu => qu.type === type && !usedIds.has(qu.id)));
      pool.slice(0, count).forEach(q => {
        usedIds.add(q.id);
        picked.push({ ...q, sectionId });
      });
    });
  });

  const ordered = [];
  SECTIONS.forEach(sec => {
    const sectionQs = picked.filter(q => {
      const meta = TYPE_META[q.type];
      return meta && meta.section === sec.id;
    });
    shuffle(sectionQs).forEach(q => ordered.push({ ...q, sectionId: sec.id, sectionName: sec.name }));
  });

  return ordered;
}

function getSectionForQuestion(q) {
  const meta = TYPE_META[q.type];
  return SECTIONS.find(s => s.id === (meta && meta.section)) || SECTIONS[0];
}

function getTimerForType(type) {
  return TIMERS[type] || 0;
}
