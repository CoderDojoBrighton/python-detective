# Python Detective

A detective game for CoderDojo Brighton that teaches Python to 8–14 year olds. A thief called **The Magpie** is loose in Brighton, and players write **real Python** to read files, crack codes and follow the clues. Each solved case earns XP and unlocks the next one.

It's the sister project of [Linux Detective](https://github.com/CoderDojoBrighton/linux-mystery). The case board, XP, ranks and hints work the same way. Evidence is recorded inside each objective as you go. The fake shell is replaced by a code editor and real Python ([Pyodide](https://pyodide.org)) running in the browser.

## Running it

It's a static site with no build step and no server code.

- **At a dojo:** open `index.html` in Chrome or Edge, or host the folder anywhere static (e.g. GitHub Pages).
- It needs internet access the first time, to load Pyodide, CodeMirror, xterm.js and the fonts from CDNs. After that the browser caches them.
- Progress (solved cases, XP) and each case's code are saved in the browser's localStorage.
- **Teacher mode** (link at the bottom of the case board) unlocks every case.
- **When editing it locally,** serve it with caching off, e.g. `npx http-server -c-1`. Plain `http-server` tells the browser to cache files for an hour, so it keeps running your old `engine.js` (press Ctrl+F5 to force a reload).

## How it fits together

| File | What it does |
|---|---|
| `index.html` | The page, and the list of case files to load |
| `engine.js` | Case board, editor and console, missions, hints, evidence, XP |
| `py-worker.js` | Runs Python in a Web Worker. It writes the case's files into Python's filesystem, runs the student's code, and reports what the code opened, listed and wrote |
| `checks.js` | Small helpers that cases use to decide whether a mission is done |
| `cases/NN-name.js` | One case each |
| `tests/` | Teacher solutions and a checker that runs them |

**Stopping code.** Python runs in a worker, so a never-ending loop can't freeze the page. **■ Stop**, or a 15-second timeout, throws the worker away and starts a fresh one in about a second.

**Turned off on purpose.** `input()` is switched off (cases put values in variables instead).

## Adding a case

1. Copy an existing case in `cases/`, give it a new `id`, and set `requires` to the id of the case that should unlock it.
2. Add a `<script>` line for it in `index.html`.
3. Put the case's files in `files: { '/full/path.txt': 'contents' }`. They really exist for the student's code, so `open()`, `os.walk()` and `glob` all work.
4. Each mission's `done(e)` gets called with the events from every run:
   - `open`
   - `list`
   - `write`
   - `run` (with `stdout`, `code`, `ok`)

   Use the helpers in `checks.js`, e.g. `done: e => uses(e, /len\s*\(/) && printed(e, '96')`.
5. If a mission needs data that isn't in a file (e.g. a list to loop over), put it in `data: 'badges = [...]'`. The objective card always shows it as a click-to-add box. `try` is a worked answer, so it only shows on tutorial missions or after every hint has been used.
6. When a mission reveals a clue, give it `evidence: ['field-id']`, listing the evidence question(s) it answers.
   - When the student's code passes the mission, the objective card asks those questions.
   - The next objective unlocks once they're answered correctly.
   - Bonus questions can be skipped.
   - The final mission (`final: true`) asks for any main answers still missing.
7. Write a teacher solution in `tests/solutions/<same name>.py` and run the checker (below).

## Checking the cases

```sh
cd tests
npm install           # once: installs Pyodide for Node
npm test              # runs every teacher solution through every case
node run-cases.mjs caesar -v     # one case, showing its output
```

The checker passes only if:

- every mission completes,
- every evidence answer is accepted, and
- every answer is actually printed by the solution's code.

## Arc 2 (planned)

Web scraping and APIs:

- scraping a hidden page on the CoderDojo Brighton website with `requests` and BeautifulSoup,
- reading a JSON dossier,
- calling free APIs that allow browser access (Open-Meteo, PokeAPI, REST Countries).

The live site (coderdojobrighton.org.uk) already sends `Access-Control-Allow-Origin: *`, so pages on it can be fetched from the browser. The runner already loads packages on first `import` and patches `requests` to work in the browser.
