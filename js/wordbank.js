/**
 * Word Bank UI — filter, search, expandable cards, learned
 */
(function () {
  const PAGE = 20;
  let category = '';
  let query = '';
  let visible = PAGE;

  const learned = new Set(DETStorage.get(DETStorage.KEYS.learned, []));

  const tabs = document.getElementById('wb-tabs');
  const list = document.getElementById('wb-list');
  const search = document.getElementById('wb-search');
  const loadBtn = document.getElementById('btn-load-more');

  const categories = ['All', ...new Set(WORD_BANK.map(w => w.category))];

  categories.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'wb-tab' + (cat === 'All' ? ' active' : '');
    b.textContent = cat;
    b.addEventListener('click', () => {
      document.querySelectorAll('.wb-tab').forEach(t => t.classList.remove('active'));
      b.classList.add('active');
      category = cat === 'All' ? '' : cat;
      visible = PAGE;
      render();
    });
    tabs.appendChild(b);
  });

  function filtered() {
    const q = query.toLowerCase();
    return WORD_BANK.filter(w => {
      if (category && w.category !== category) return false;
      if (!q) return true;
      return w.word.toLowerCase().includes(q) ||
        w.meaningEN.toLowerCase().includes(q) ||
        w.meaningUR.toLowerCase().includes(q) ||
        (w.synonyms || []).some(s => s.toLowerCase().includes(q));
    });
  }

  function wordByName(name) {
    return WORD_BANK.find(w => w.word.toLowerCase() === name.toLowerCase());
  }

  function renderCard(w) {
    const isLearned = learned.has(w.word);
    const syns = (w.synonyms || []).map(s => {
      const hit = wordByName(s);
      if (hit) return `<span class="syn-link" data-jump="${escapeHtml(hit.word)}">${escapeHtml(s)}</span>`;
      return `<span>${escapeHtml(s)}</span>`;
    }).join(', ');

    return `
      <article class="wb-card ${isLearned ? 'learned' : ''}" data-word="${escapeHtml(w.word)}">
        <div class="wb-card-head">
          <div>
            <h3>${escapeHtml(w.word)}</h3>
            <p>${escapeHtml(w.meaningEN)}</p>
            <p class="wb-ur">${escapeHtml(w.meaningUR)}</p>
          </div>
          <span>${isLearned ? '✅' : '▾'}</span>
        </div>
        <div class="wb-card-body">
          <p><strong>Say it:</strong> ${escapeHtml(w.phonetic)} · <em>${escapeHtml(w.pos)}</em></p>
          <p>${escapeHtml(w.meaningEN)}</p>
          <p class="wb-ur">${escapeHtml(w.meaningUR)}</p>
          <p><strong>Synonyms:</strong> ${syns}</p>
          <p><strong>Example:</strong> ${escapeHtml(w.example)}</p>
          <p><strong>Memory tip:</strong> ${escapeHtml(w.memoryTip)}</p>
          <div class="wb-actions">
            <button type="button" class="btn btn-learn" data-word="${escapeHtml(w.word)}">${isLearned ? 'Unmark' : 'Mark Learned'}</button>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const items = filtered();
    const slice = items.slice(0, visible);
    list.innerHTML = slice.map(w => renderCard(w)).join('');
    loadBtn.hidden = visible >= items.length;
    loadBtn.textContent = `Load more (${items.length - visible} left)`;

    list.querySelectorAll('.wb-card-head').forEach(head => {
      head.addEventListener('click', e => {
        if (e.target.closest('.btn-learn')) return;
        head.parentElement.classList.toggle('open');
      });
    });
    list.querySelectorAll('.btn-learn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const w = btn.dataset.word;
        if (learned.has(w)) learned.delete(w);
        else learned.add(w);
        DETStorage.set(DETStorage.KEYS.learned, [...learned]);
        render();
      });
    });
    list.querySelectorAll('.syn-link').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        search.value = el.dataset.jump;
        query = el.dataset.jump;
        visible = PAGE;
        category = '';
        document.querySelectorAll('.wb-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        render();
        const card = list.querySelector(`[data-word="${el.dataset.jump}"]`);
        if (card) {
          card.classList.add('open');
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  search.addEventListener('input', () => {
    query = search.value;
    visible = PAGE;
    render();
  });

  loadBtn.addEventListener('click', () => {
    visible += PAGE;
    render();
  });

  render();
})();
