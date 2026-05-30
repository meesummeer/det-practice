/**
 * Grammar mini-games — Has/Have, Is/Are/Was/Were, Word Drop, Odd One Out
 */
(function () {
  const HAS_HAVE = [
    ['She', 'has', 'have', 'three cats.'], ['He', 'has', 'have', 'a new job.'],
    ['It', 'has', 'have', 'four wheels.'], ['The dog', 'has', 'have', 'a collar.'],
    ['My sister', 'has', 'have', 'long hair.'], ['Everyone', 'has', 'have', 'a ticket.'],
    ['Nobody', 'has', 'have', 'an excuse.'], ['The team', 'has', 'have', 'won twice.'],
    ['Each student', 'has', 'have', 'a laptop.'], ['The book', 'has', 'have', '300 pages.'],
    ['This phone', 'has', 'have', 'a good camera.'], ['The city', 'has', 'have', 'two airports.'],
    ['A cat', 'has', 'have', 'sharp claws.'], ['The manager', 'has', 'have', 'a meeting now.'],
    ['She', 'has', 'have', 'already left.'], ['He', 'has', 'have', 'never tried sushi.'],
    ['It', 'has', 'have', 'been raining.'], ['The company', 'has', 'have', 'grown fast.'],
    ['I', 'have', 'has', 'two brothers.'], ['You', 'have', 'has', 'a great idea.'],
    ['We', 'have', 'has', 'homework tonight.'], ['They', 'have', 'has', 'many friends.'],
    ['The students', 'have', 'has', 'a test tomorrow.'], ['People', 'have', 'has', 'different opinions.'],
    ['Those birds', 'have', 'has', 'colorful feathers.'], ['These bags', 'have', 'has', 'heavy books.'],
    ['My parents', 'have', 'has', 'a small farm.'], ['The workers', 'have', 'has', 'finished early.'],
    ['You and I', 'have', 'has', 'the same goal.'], ['The children', 'have', 'has', 'lots of energy.'],
    ['We', 'have', 'has', 'known each other for years.'], ['They', 'have', 'has', 'visited Paris twice.'],
    ['I', 'have', 'has', 'just eaten lunch.'], ['The teachers', 'have', 'has', 'graded the papers.'],
    ['Both answers', 'have', 'has', 'merit.'], ['Several issues', 'have', 'has', 'been fixed.'],
    ['Many countries', 'have', 'has', 'signed the treaty.'], ['The neighbors', 'have', 'has', 'a loud dog.'],
    ['Our class', 'have', 'has', 'twenty students.'], ['The twins', 'have', 'has', 'blue eyes.'],
    ['You', 'have', 'has', 'been very helpful.'], ['We', 'have', 'has', 'seen that film.'],
    ['The birds', 'have', 'has', 'built a nest.'], ['They', 'have', 'has', 'not replied yet.']
  ];

  const IS_ARE = [
    ['She', 'is', 'are', 'a doctor.'], ['He', 'is', 'are', 'very tall.'],
    ['The weather', 'is', 'are', 'nice today.'], ['This', 'is', 'are', 'my pen.'],
    ['It', 'is', 'are', 'important.'], ['There', 'is', 'are', 'a problem.'],
    ['The news', 'is', 'are', 'surprising.'], ['Mathematics', 'is', 'are', 'difficult for some.'],
    ['The cat', 'is', 'are', 'on the roof.'], ['Your idea', 'is', 'are', 'excellent.'],
    ['She', 'was', 'were', 'tired yesterday.'], ['He', 'was', 'were', 'at home.'],
    ['The meeting', 'was', 'were', 'short.'], ['It', 'was', 'were', 'cold last night.'],
    ['The book', 'was', 'were', 'on the desk.'], ['The test', 'was', 'were', 'easy.'],
    ['They', 'are', 'is', 'ready.'], ['We', 'are', 'is', 'students.'],
    ['The keys', 'are', 'is', 'in the bag.'], ['Those', 'are', 'is', 'my shoes.'],
    ['The children', 'are', 'is', 'playing outside.'], ['These results', 'are', 'is', 'accurate.'],
    ['We', 'were', 'was', 'late.'], ['They', 'were', 'was', 'happy.'],
    ['The students', 'were', 'was', 'in the lab.'], ['The tickets', 'were', 'was', 'expensive.'],
    ['You and I', 'are', 'is', 'friends.'], ['The data', 'are', 'is', 'in the file.'],
    ['Both options', 'are', 'is', 'valid.'], ['The police', 'are', 'is', 'investigating.'],
    ['She', 'is', 'are', 'not here.'], ['They', 'were', 'was', 'not invited.'],
    ['There', 'are', 'is', 'many reasons.'], ['There', 'were', 'was', 'few mistakes.'],
    ['The team', 'is', 'are', 'winning.'], ['His parents', 'are', 'is', 'kind.'],
    ['I', 'was', 'were', 'nervous.'], ['You', 'were', 'was', 'right.'],
    ['The prices', 'are', 'is', 'rising.'], ['The windows', 'are', 'is', 'open.'],
    ['A virus', 'is', 'are', 'spreading.'], ['The rules', 'are', 'is', 'clear.'],
    ['She', 'was', 'were', 'the leader.'], ['We', 'were', 'was', 'surprised.']
  ];

  const WORD_DROP = [
    { s: 'She lives ___ Karachi.', words: ['in', 'on', 'at', 'by'], ans: 0, ruleEN: 'Cities use "in".', ruleUR: "Shehar ke saath 'in' aata hai — live in Karachi." },
    { s: 'The book is ___ the table.', words: ['on', 'in', 'at', 'by'], ans: 0, ruleEN: 'Surfaces use "on".', ruleUR: "Surface par 'on' — book on the table." },
    { s: 'We meet ___ 5 p.m.', words: ['at', 'in', 'on', 'by'], ans: 0, ruleEN: 'Clock times use "at".', ruleUR: "Time ke liye 'at' — at 5 p.m." },
    { s: 'He arrived ___ Monday.', words: ['on', 'in', 'at', 'by'], ans: 0, ruleEN: 'Days use "on".', ruleUR: "Day ke saath 'on' — on Monday." },
    { s: 'She is interested ___ science.', words: ['in', 'on', 'at', 'by'], ans: 0, ruleEN: 'Interested + in.', ruleUR: "Interested hamesha 'in' ke saath — interested in science." },
    { s: 'This is ___ honest answer.', words: ['an', 'a', 'the', '—'], ans: 0, ruleEN: 'Honest starts with a vowel sound → an.', ruleUR: "Vowel sound se pehle 'an' — an honest answer." },
    { s: 'I need ___ university degree.', words: ['a', 'an', 'the', '—'], ans: 0, ruleEN: 'University starts with consonant sound → a.', ruleUR: "'University' consonant sound — a university." },
    { s: '___ sun is bright today.', words: ['The', 'A', 'An', '—'], ans: 0, ruleEN: 'Unique things take "the".', ruleUR: "Sun unique hai — the sun." },
    { s: 'I like tea ___ coffee.', words: ['and', 'but', 'or', 'so'], ans: 0, ruleEN: 'And adds similar items.', ruleUR: "'And' similar cheezen jorta hai." },
    { s: 'She studied hard, ___ she passed.', words: ['so', 'but', 'or', 'and'], ans: 0, ruleEN: 'So shows result.', ruleUR: "'So' result batata hai — hard work, so pass." },
    { s: 'You can take the bus ___ walk.', words: ['or', 'and', 'but', 'so'], ans: 0, ruleEN: 'Or shows choice.', ruleUR: "'Or' choice — bus or walk." },
    { s: 'He is smart ___ lazy.', words: ['but', 'and', 'or', 'so'], ans: 0, ruleEN: 'But shows contrast.', ruleUR: "'But' contrast — smart but lazy." },
    { s: 'Walk ___ the bridge carefully.', words: ['across', 'in', 'on', 'at'], ans: 0, ruleEN: 'Across = from one side to another.', ruleUR: "'Across' ek side se doosri — across the bridge." },
    { s: 'She sat ___ me.', words: ['beside', 'in', 'on', 'at'], ans: 0, ruleEN: 'Beside = next to.', ruleUR: "'Beside' = bagal mein." },
    { s: 'We talked ___ the phone.', words: ['on', 'in', 'at', 'by'], ans: 0, ruleEN: 'On the phone is fixed.', ruleUR: "Fixed phrase: on the phone." },
    { s: 'He is good ___ math.', words: ['at', 'in', 'on', 'by'], ans: 0, ruleEN: 'Good at + skill.', ruleUR: "Good at skill ke saath — good at math." },
    { s: 'She went ___ school.', words: ['to', 'in', 'at', 'on'], ans: 0, ruleEN: 'Go to a place.', ruleUR: "Jana 'to' — went to school." },
    { s: 'Wait ___ me!', words: ['for', 'to', 'at', 'in'], ans: 0, ruleEN: 'Wait for someone.', ruleUR: "Wait for — kisi ka intezar." },
    { s: 'This gift is ___ you.', words: ['for', 'to', 'at', 'in'], ans: 0, ruleEN: 'For = intended recipient.', ruleUR: "'For' = ke liye — gift for you." },
    { s: 'I agree ___ your plan.', words: ['with', 'to', 'on', 'in'], ans: 0, ruleEN: 'Agree with a person/idea.', ruleUR: "Agree with — plan se agree." },
    { s: 'She depends ___ her family.', words: ['on', 'in', 'at', 'by'], ans: 0, ruleEN: 'Depend on.', ruleUR: "Depend on — fixed phrase." },
    { s: 'He apologized ___ being late.', words: ['for', 'to', 'at', 'in'], ans: 0, ruleEN: 'Apologize for.', ruleUR: "Apologize for — late hone par." },
    { s: 'We succeeded ___ the exam.', words: ['in', 'on', 'at', 'by'], ans: 0, ruleEN: 'Succeed in.', ruleUR: "Succeed in exam — fixed." },
    { s: 'She is afraid ___ spiders.', words: ['of', 'from', 'for', 'at'], ans: 0, ruleEN: 'Afraid of.', ruleUR: "Afraid of — dar lagna." },
    { s: 'He is proud ___ his work.', words: ['of', 'for', 'at', 'in'], ans: 0, ruleEN: 'Proud of.', ruleUR: "Proud of — fakhar." },
    { s: 'Listen ___ the teacher.', words: ['to', 'at', 'in', 'on'], ans: 0, ruleEN: 'Listen to.', ruleUR: "Listen to — sunna." },
    { s: 'She looked ___ the window.', words: ['through', 'in', 'on', 'at'], ans: 0, ruleEN: 'Through = via opening.', ruleUR: "'Through' window se dekha." },
    { s: 'Put the file ___ the folder.', words: ['in', 'on', 'at', 'by'], ans: 0, ruleEN: 'Inside → in.', ruleUR: "Andar 'in' — file in folder." },
    { s: 'He works ___ a hospital.', words: ['at', 'in', 'on', 'to'], ans: 0, ruleEN: 'Work at a workplace.', ruleUR: "Kaam ki jagah — work at hospital." },
    { s: 'We traveled ___ train.', words: ['by', 'in', 'on', 'at'], ans: 0, ruleEN: 'By + transport mode.', ruleUR: "Transport 'by' — by train." }
  ];

  const ODD_OUT = [
    { words: ['happy', 'joyful', 'elated', 'miserable'], ans: 3, cat: 'positive emotions', catUR: 'Positive emotions mein miserable fit nahi — ye negative hai.' },
    { words: ['apple', 'banana', 'carrot', 'grape'], ans: 2, cat: 'fruits', catUR: 'Carrot vegetable hai, baqi fruits.' },
    { words: ['run', 'jump', 'swift', 'swim'], ans: 2, cat: 'verbs', catUR: 'Swift adjective hai, baqi verbs.' },
    { words: ['dog', 'cat', 'table', 'rabbit'], ans: 2, cat: 'animals', catUR: 'Table animal nahi.' },
    { words: ['hot', 'warm', 'cold', 'heated'], ans: 2, cat: 'heat words', catUR: 'Cold opposite temperature group.' },
    { words: ['piano', 'violin', 'novel', 'drums'], ans: 2, cat: 'instruments', catUR: 'Novel instrument nahi.' },
    { words: ['Monday', 'Tuesday', 'July', 'Friday'], ans: 2, cat: 'weekdays', catUR: 'July month hai, weekday nahi.' },
    { words: ['oxygen', 'nitrogen', 'water', 'carbon'], ans: 2, cat: 'gases', catUR: 'Water liquid compound, gases alag.' },
    { words: ['shrink', 'expand', 'grow', 'enlarge'], ans: 0, cat: 'increase', catUR: 'Shrink opposite — kam karna.' },
    { words: ['buy', 'sell', 'purchase', 'acquire'], ans: 1, cat: 'obtain', catUR: 'Sell deta hai, baqi lena.' },
    { words: ['city', 'town', 'village', 'street'], ans: 3, cat: 'settlements', catUR: 'Street place type alag hai.' },
    { words: ['doctor', 'nurse', 'teacher', 'patient'], ans: 3, cat: 'medical workers', catUR: 'Patient worker nahi.' },
    { words: ['iron', 'gold', 'silver', 'wood'], ans: 3, cat: 'metals', catUR: 'Wood metal nahi.' },
    { words: ['quick', 'rapid', 'slow', 'fast'], ans: 2, cat: 'speed', catUR: 'Slow speed opposite.' },
    { words: ['pen', 'pencil', 'eraser', 'notebook'], ans: 2, cat: 'writing tools', catUR: 'Eraser likhne ka tool nahi.' },
    { words: ['rain', 'snow', 'wind', 'umbrella'], ans: 3, cat: 'weather', catUR: 'Umbrella object hai, weather nahi.' },
    { words: ['liberty', 'freedom', 'slavery', 'independence'], ans: 2, cat: 'freedom', catUR: 'Slavery opposite concept.' },
    { words: ['add', 'subtract', 'plus', 'sum'], ans: 1, cat: 'addition', catUR: 'Subtract opposite math.' },
    { words: ['north', 'south', 'east', 'upward'], ans: 3, cat: 'directions', catUR: 'Upward direction alag type.' },
    { words: ['laugh', 'smile', 'cry', 'grin'], ans: 2, cat: 'happy face', catUR: 'Cry sad reaction.' },
    { words: ['kitchen', 'bedroom', 'bathroom', 'garage'], ans: 3, cat: 'rooms in house', catUR: 'Garage living room category alag lekin often grouped separately — actually bedroom/kitchen/bathroom are core rooms; garage is storage. Good.' },
    { words: ['train', 'bus', 'bicycle', 'airplane'], ans: 2, cat: 'motor vehicles', catUR: 'Bicycle human-powered, baqi motor.' },
    { words: ['truth', 'fact', 'lie', 'reality'], ans: 2, cat: 'honesty', catUR: 'Lie dishonest.' },
    { words: ['generous', 'kind', 'selfish', 'helpful'], ans: 2, cat: 'positive traits', catUR: 'Selfish negative trait.' },
    { words: ['ocean', 'sea', 'lake', 'river'], ans: 3, cat: 'large water bodies', catUR: 'River flows, others standing large — hmm river is different. ans 3 ok' },
    { words: ['winter', 'spring', 'summer', 'October'], ans: 3, cat: 'seasons', catUR: 'October month hai.' },
    { words: ['speak', 'talk', 'listen', 'chat'], ans: 2, cat: 'speaking verbs', catUR: 'Listen receive, baqi produce speech.' },
    { words: ['bright', 'dark', 'light', 'dim'], ans: 1, cat: 'light quality', catUR: 'Dark opposite light group.' },
    { words: ['child', 'adult', 'teen', 'infant'], ans: 1, cat: 'young people', catUR: 'Adult age category alag.' },
    { words: ['coffee', 'tea', 'juice', 'bread'], ans: 3, cat: 'drinks', catUR: 'Bread drink nahi.' },
    { words: ['hammer', 'saw', 'screwdriver', 'nail'], ans: 3, cat: 'tools', catUR: 'Nail fastener, tool nahi.' }
  ];

  let game = 'has';
  let deck = [];
  let idx = 0;
  let score = 0;
  let lives = 3;
  const TOTAL = 20;

  const picker = document.getElementById('game-picker');
  const screen = document.getElementById('game-screen');
  const endScreen = document.getElementById('game-end');
  const content = document.getElementById('game-content');
  const feedback = document.getElementById('game-feedback');

  ['has', 'is', 'drop', 'odd'].forEach(id => {
    const labels = { has: 'Has or Have?', is: 'Is / Are / Was / Were', drop: 'Word Drop', odd: 'Odd One Out' };
    const b = document.createElement('button');
    b.className = 'game-tab';
    b.textContent = labels[id];
    b.dataset.game = id;
    b.addEventListener('click', () => startGame(id));
    picker.appendChild(b);
  });

  document.getElementById('btn-play-again')?.addEventListener('click', () => startGame(game));
  document.getElementById('game-xp').textContent = DETStorage.getXP();

  function startGame(id) {
    game = id;
    document.querySelectorAll('.game-tab').forEach(t => t.classList.toggle('active', t.dataset.game === id));
    deck = fisherYates(
      id === 'has' ? HAS_HAVE :
      id === 'is' ? IS_ARE :
      id === 'drop' ? WORD_DROP :
      ODD_OUT
    ).slice(0, TOTAL);
    idx = 0;
    score = 0;
    lives = 3;
    endScreen.hidden = true;
    screen.hidden = false;
    document.getElementById('game-total').textContent = TOTAL;
    document.getElementById('game-best').textContent = DETStorage.getHighscore('game_' + id);
    renderRound();
  }

  function renderRound() {
    updateHud();
    feedback.hidden = true;
    if (idx >= TOTAL || lives <= 0) return endGame();

    if (game === 'has' || game === 'is') renderAux();
    else if (game === 'drop') renderDrop();
    else renderOdd();
  }

  function renderAux() {
    const row = deck[idx];
    const [subj, correct, wrong, rest] = row;
    content.innerHTML = `
      <p class="game-sentence">${escapeHtml(subj)} <span class="game-blank">___</span> ${escapeHtml(rest)}</p>
      <div class="game-choices">
        <button class="choice-btn" data-v="${escapeHtml(correct)}">${escapeHtml(correct.toUpperCase())}</button>
        <button class="choice-btn" data-v="${escapeHtml(wrong)}">${escapeHtml(wrong.toUpperCase())}</button>
      </div>`;
    content.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => pick(btn, btn.dataset.v === correct));
    });
  }

  function renderDrop() {
    const item = deck[idx];
    content.innerHTML = `
      <p class="game-sentence">${escapeHtml(item.s.replace('___', '___'))}</p>
      <div class="word-drop-zone" id="drop-zone"></div>`;
    const zone = document.getElementById('drop-zone');
    const shuffled = fisherYates(item.words.map((w, i) => ({ w, i })));
    shuffled.forEach((tile, n) => {
      const el = document.createElement('button');
      el.className = 'falling-tile';
      el.textContent = tile.w;
      el.style.left = (10 + n * 22) + '%';
      el.style.animationDuration = (4 + n * 0.5) + 's';
      el.addEventListener('click', () => {
        pick(el, tile.i === item.ans, item);
        zone.querySelectorAll('.falling-tile').forEach(t => t.disabled = true);
      });
      zone.appendChild(el);
    });
  }

  function renderOdd() {
    const item = deck[idx];
    content.innerHTML = `<p class="game-sentence">Pick the odd one out:</p><div class="odd-grid"></div>`;
    const grid = content.querySelector('.odd-grid');
    item.words.forEach((w, i) => {
      const b = document.createElement('button');
      b.className = 'odd-word';
      b.textContent = w;
      b.addEventListener('click', () => pick(b, i === item.ans, item));
      grid.appendChild(b);
    });
  }

  function pick(el, ok, meta) {
    if (ok) {
      el.classList.add('correct-flash');
      score++;
      DETStorage.addXP(10);
      showFb('Correct! Zabardast!', true);
    } else {
      el.classList.add('wrong-flash');
      lives--;
      let msg = 'Galat! ';
      if (game === 'has') {
        msg += "He/She/It ke saath 'has', I/You/We/They ke saath 'have' aata hai.";
      } else if (game === 'is') {
        msg += "Singular = is/was, plural = are/were. Time bhi check karo (past vs present).";
      } else if (meta) {
        msg += meta.ruleUR || meta.catUR || '';
      }
      showFb(msg, false);
    }
    setTimeout(() => { idx++; renderRound(); }, ok ? 600 : 1400);
  }

  function showFb(text, ok) {
    feedback.hidden = false;
    feedback.textContent = text;
    feedback.className = 'game-feedback ' + (ok ? 'ok' : 'bad');
  }

  function updateHud() {
    document.getElementById('game-score').textContent = score;
    document.getElementById('hearts').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
    document.getElementById('game-xp').textContent = DETStorage.getXP();
  }

  function endGame() {
    screen.hidden = true;
    endScreen.hidden = false;
    const best = DETStorage.saveHighscore('game_' + game, score);
    document.getElementById('end-title').textContent = lives > 0 ? 'Well done!' : 'Out of lives!';
    document.getElementById('end-msg').textContent = `Score: ${score}/${TOTAL}. Best: ${best}. +${score * 5} XP`;
  }
})();
