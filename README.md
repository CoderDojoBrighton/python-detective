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
| `explain.js` | The 📖 Python reference, and the "What does each line do?" explanations under every clickable code snippet |
| `cases/NN-name.js` | One case each |
| `tests/` | Teacher solutions and a checker that runs them |

**Stopping code.** Python runs in a worker, so a never-ending loop can't freeze the page. **■ Stop**, or a 15-second timeout, throws the worker away and starts a fresh one in about a second.

**First-time tour.** The first time someone opens a case, a short tour lights up each part of the screen in turn. **❓ Tour** in the header replays it, and "Reset my progress" shows it again.

**Colours mean one thing each.** In the output panel: white is what the student's code printed, green is the game talking, purple is a tip, red is an error. Yellow is kept for "text in quotes" in the editor, and code in the side panel is coloured exactly like the editor.

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
5. If a mission needs data that isn't in a file (e.g. a list to loop over), put it in `data: 'badges = [...]'`. With `typeIt` (below) it's added to the student's code for them; without it, the objective card shows it as a click-to-add box.
6. When a mission reveals a clue, give it `evidence: ['field-id']`, listing the evidence question(s) it answers.
   - When the student's code passes the mission, the objective card asks those questions.
   - The next objective unlocks once they're answered correctly.
   - Bonus questions can be skipped.
   - The final mission (`final: true`) asks for any main answers still missing.
7. Every clickable snippet (`try`, `data`, bonus `code`) shows a numbered explanation of each line. `explain.js` covers simple lines (prints, variables, loops, if...). For anything else, add it to the case's `explain: { 'the exact line': 'what it does' }`. The checker fails if any snippet line has no explanation.
   - Use variable names that say what's inside (`scrap1`, not `part1`; `file`, not `f`).
   - Every mission makes the student **type** the code rather than click it: give it `typeIt: 'code'`. It appears as grey ghost code in the editor for them to type over. Put a part they should change in `⟨…⟩`, e.g. `codename = "⟨Agent Sparrow⟩"`. If the mission also has `data`, that's added to their code for them first.
   - `typeIt` can't have blank lines, and should only hold the new lines for that mission. Code from earlier missions is still in the editor, so build on it rather than retyping it.
   - In **easy** cases the code is shown straight away. In **medium** and **hard** cases it stays hidden until the student has used every hint, so they try writing it themselves first. Write those tasks as a goal ("print every DENIED line"), not "type the lines below", and make `done` check the result rather than the exact wording of the `typeIt` code.
   - The ghost code doesn't mind spacing that Python doesn't mind (`x=1`, `print( x )`, any spacing inside quotes). It does flag spacing that would be a Python error: a missing space between words (`fornamein`), a space inside a name or a sign (`sig ned_in`, `/ /`), and spaces at the start of a line that Python would reject.
8. Write a teacher solution in `tests/solutions/<same name>.py` and run the checker (below).

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
