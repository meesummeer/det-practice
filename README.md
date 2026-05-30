# DET Practice — Tutoring & Test Prep

A **static** Duolingo English Test (DET) practice hub: mock exam with Roman Urdu tutor, grammar mini-games, and a 120-word vocabulary bank. No frameworks, no build step — deploy on GitHub Pages or open `index.html` locally.

**Roman Urdu mein:** Ye app DET ki tayyari ke liye hai — mock test, Urdu mein tutor tips, grammar games, aur words ki practice. Sab free, browser mein chal jata hai.

---

## Pages

| Page | File | What it does |
|------|------|----------------|
| **Home** | `index.html` | Hub, streak, XP, links to all sections |
| **Practice Test** | `practice-test.html` | ~27-question mock DET (11 types), timers, tutor after each answer |
| **Mini-Games** | `minigames.html` | Has/Have, Is/Are/Was/Were, Word Drop, Odd One Out |
| **Word Bank** | `wordbank.html` | 120 words, categories, search, mark learned |
Speaking tasks (Read Aloud, Speak About Photo, Read Then Speak) are **not** included — no AI speaking judge in this version.

---

## Run locally

```bash
open index.html
# or
python3 -m http.server 8080
# visit http://localhost:8080
```

---

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo (`index.html` at repo root).
2. **Settings → Pages → Branch:** `main` → **Folder:** `/ (root)`.
3. Site URL: `https://<username>.github.io/<repo>/`

---

## Add questions (`js/questions.js`)

Copy an existing `q({ ... })` block. Required fields:

- `id`, `type`, `qtext`, `qsub`, `hint`, `tip`
- `explanationEN`, `explanationUR` (2–3 sentences each; Roman Urdu = conversational Pakistani style)
- Type-specific: `options` + `correct` (index) for MCQ; `words` + `correct` for read-select; `gaps` for read-complete; etc.

Session length: edit `SESSION_TARGETS` (currently ~27 questions, no speaking).

```javascript
q({
  id: 'fb99',
  type: 'fill-blanks',
  qtext: 'The data was _____ by experts.',
  qsub: 'Choose the best word.',
  hint: 'Checked carefully.',
  tip: 'Read the whole sentence first.',
  options: ['ignored', 'verified', 'deleted', 'hidden'],
  correct: 1,
  explanationEN: '...',
  explanationUR: '...'
})
```

---

## Add word bank entries (`js/wordbank-data.js`)

```javascript
{
  word: 'example',
  phonetic: 'eg-ZAM-pul',
  pos: 'noun',
  meaningEN: 'One simple sentence definition.',
  meaningUR: 'Roman Urdu matlab, short and clear.',
  synonyms: ['sample', 'instance'],
  example: 'DET-level sentence here.',
  memoryTip: 'Mnemonic or root.',
  category: 'Academic & Formal'  // must match one of 8 category names
}
```

---

## localStorage keys

| Key | Purpose |
|-----|---------|
| `det_xp` | Cosmetic XP |
| `det_streak` | Daily practice streak |
| `det_learned_words` | Word bank “learned” marks |
| `det_highscores` | Mini-game high scores |

---

## DET score table (practice estimate)

| Score | Rough level |
|-------|-------------|
| 10–55 | Basic |
| 60–85 | Intermediate (B1) |
| 90–115 | Upper intermediate (B2) |
| 120–135 | Advanced (C1) |
| 140–160 | Highly proficient (C2) |

**Subscores in practice test:** Literacy (adaptive), Production (writing), Comprehension (interactive reading).

---

## Writing AI (future)

`judgeWriting()` in `js/shared.js` is a placeholder. Replace with an API call when ready (`// TODO: Replace with Anthropic API call`).

---

## Tech

- Vanilla HTML/CSS/JS
- Fonts: Google Fonts (Nunito)
- Optional: canvas-confetti (CDN) on section complete / test finish

License: use freely for study and teaching.
