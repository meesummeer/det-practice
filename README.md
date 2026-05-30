# DET Practice Simulator

A **static, browser-only** practice app for the [Duolingo English Test (DET)](https://englishtest.duolingo.com/). It simulates all **19 official question types** across four sections, with timers, hints, reveal answers, section breaks, and an estimated score on the 10–160 scale.

No backend, no build step, no npm — open `index.html` or deploy to GitHub Pages.

## Run locally

1. Clone or download this folder.
2. Open **`index.html`** in any modern browser (Chrome, Firefox, Safari, Edge).

```bash
# Optional: serve locally to avoid file:// quirks (not required)
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project (root layout: `index.html` at repo root).
2. On GitHub: **Settings → Pages**.
3. **Source**: Deploy from branch **`main`** (or `master`), folder **`/ (root)`**.
4. Save. Your site will be at `https://<username>.github.io/<repo>/`.

If you prefer a `/docs` deploy, move all files into `docs/` and set Pages source to the **`/docs`** folder.

## Project structure

```
det-practice/
├── index.html          # Shell UI (welcome, test, breaks, results)
├── css/styles.css      # Light-mode DET-style layout
├── js/
│   ├── app.js          # Engine: navigation, timers, section breaks
│   ├── questions.js    # Question bank + session builder
│   ├── renderer.js     # Per-type UI renderers
│   └── results.js      # Scoring + results screen
└── README.md
```

## Question bank — adding questions

All questions live in **`js/questions.js`** in the `QUESTION_BANK` array.

Each question should include:

| Field | Description |
|--------|-------------|
| `id` | Unique string, e.g. `'fb12'` |
| `type` | One of the keys in `QUESTION_TYPES` |
| `tag`, `icon`, `qtext`, `qsub` | UI labels and prompts |
| `hint` | Strategy tip (purple Hint box) |
| `tip` | DET exam tip (shown on reveal) |
| `section_score` | Auto-set from `TYPE_META` unless overridden: `literacy`, `comprehension`, `conversation`, `production` |
| Type-specific fields | e.g. `options` + `correct` for MCQ, `words` + `correct` for read-select, `sample` for writing/speaking |

**Example — Fill in the Blanks:**

```javascript
q({
  id: 'fb99',
  type: 'fill-blanks',
  qtext: 'The results were _____ by independent auditors.',
  qsub: 'Choose the best word.',
  hint: 'Verified or checked formally.',
  tip: 'Read the whole sentence before choosing.',
  options: ['ignored', 'validated', 'hidden', 'deleted'],
  correct: 1  // index into options
})
```

**Session size:** `SESSION_TARGETS` in `questions.js` controls how many items per type are picked (~30 per run). Edit counts there to change session length.

## DET score interpretation (practice estimate)

This app **does not** produce an official Duolingo score. It maps practice performance to an **approximate** 10–160 scale for feedback only.

| Estimated score | Typical interpretation (CEFR-oriented) |
|-----------------|------------------------------------------|
| 10–55 | Basic — developing foundational skills |
| 60–85 | Intermediate — B1 range |
| 90–115 | Upper intermediate — B2 range |
| 120–135 | Advanced — C1 range |
| 140–160 | Highly proficient — C2 range |

**Subscores (percent bars):**

| Subscore | Question types |
|----------|----------------|
| **Literacy** | Read & Select, Fill in the Blanks, Read & Complete |
| **Production** | Write About Photo, Interactive Writing, Writing Sample |
| **Comprehension** | Complete Sentences/Passage, Highlight Answer, Identify Idea, Title Passage |
| **Conversation** | Read Aloud, Speak About Photo, Read Then Speak (self-assessed) |

Writing/speaking in practice mode score **attempt + word count** (writing) or **self-assessment** (speaking), not AI grading.

## Features

- Back restores previous question and answer UI state
- Hint / Reveal Answer per question
- Section break screens (once per forward section transition)
- Per-question timers (pause when leaving, resume on return)
- Mock speaking recorder with Good / OK / Needs work
- Retake generates a new random subset from the bank

## License

Use and modify freely for personal study and teaching.
