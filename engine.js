// =====================================================================
//  Python Detective: game engine
//  Cases live in cases/*.js and push themselves onto CASES.
//  Python itself runs in a Web Worker (py-worker.js); mission checks use
//  the helpers in checks.js.
// =====================================================================

const C = {
    r: '\x1b[0m', b: '\x1b[1m', dim: '\x1b[2m',
    red: '\x1b[91m', green: '\x1b[92m', yellow: '\x1b[93m', blue: '\x1b[94m',
    magenta: '\x1b[95m', cyan: '\x1b[96m'
};

const DIFFICULTIES = {
    easy:   { label: 'EASY',   blurb: 'New to Python? Start here. Step-by-step objectives teach you the basics.' },
    medium: { label: 'MEDIUM', blurb: 'Real files and messy data. Hints cost a little XP.' },
    hard:   { label: 'HARD',   blurb: 'Codes, ciphers and secrets. Hints cost more XP.' }
};

const RANKS = [
    [0, 'Rookie Coder'], [150, 'Junior Pythonista'], [450, 'Code Detective'],
    [1100, 'Senior Sleuth'], [2000, 'Python Legend']
];

const RUN_TIMEOUT_MS = 15000;

// =====================================================================
//  Saved progress (browser storage; the game still works without it)
// =====================================================================
const STORE_KEY = 'pythonDetective.v1';
function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { solved: {}, teacher: false }; }
    catch { return { solved: {}, teacher: false }; }
}
function saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}
let progress = loadProgress();

// The student's code for each case, so it survives a page reload
const draftKey = c => `pythonDetective.code.${c.id}`;
function loadDraft(c) {
    try { return localStorage.getItem(draftKey(c)); } catch { return null; }
}
function saveDraft(c, code) {
    try { localStorage.setItem(draftKey(c), code); } catch { /* storage unavailable */ }
}

// How far the student got in each case (objectives, hints, correct answers)
const caseKey = c => `pythonDetective.case.${c.id}`;
function loadCaseState(c) {
    try { return JSON.parse(localStorage.getItem(caseKey(c))); } catch { return null; }
}
function saveCaseState() {
    const st = { done: [...S.done], hintLevel: S.hintLevel, hintsUsed: S.hintsUsed, solved: S.solved,
        answers: S.evAns, skipped: [...S.evSkip] };
    try { localStorage.setItem(caseKey(S.c), JSON.stringify(st)); } catch { /* storage unavailable */ }
}
function clearCaseState(c) {
    try { localStorage.removeItem(caseKey(c)); } catch { /* storage unavailable */ }
}

const totalXp = () => Object.values(progress.solved).reduce((s, r) => s + r.xp, 0);
const rankFor = xp => RANKS.filter(([min]) => xp >= min).pop()[1];
const caseById = id => CASES.find(x => x.id === id);

// Each case can name the case that must be solved before it
function isUnlocked(c) {
    return progress.teacher || !c.requires || !!progress.solved[c.requires];
}

// =====================================================================
//  Helpers
// =====================================================================
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Case intros are wrapped by hand to fit the terminal. For the briefing, join lines back into
// paragraphs, keeping blank lines, indented lines (lists) and the line before a list (ends in ":")
function reflowIntro(lines) {
    const plain = l => l.replace(/\x1b\[\d+m/g, '');
    return lines.reduce((text, l, i) => {
        if (i === 0) return l;
        const prev = plain(lines[i - 1]), cur = plain(l);
        const join = cur.trim() && prev.trim() && !/^\s/.test(cur) && !/^\s/.test(prev) && !prev.trimEnd().endsWith(':');
        return text + (join ? ' ' : '\n') + l;
    }, '');
}

// Case intros are written with terminal colours; turn them into HTML for the briefing
function ansiToHtml(text) {
    let open = 0;
    const html = escapeHtml(text).replace(/\x1b\[(\d+)m/g, (_, code) => {
        if (code === '0') { const close = '</span>'.repeat(open); open = 0; return close; }
        open++;
        return `<span class="ansi-${code === '1' ? 'b' : code}">`;
    });
    return html + '</span>'.repeat(open);
}

function showBriefing() {
    $('#briefing').classList.add('show');
    $('#briefing-go').focus();
}
function closeBriefing() {
    $('#briefing').classList.remove('show');
    editor?.focus();
}

const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// =====================================================================
//  Python reference (the 📖 Python tab and the mission tool chips)
// =====================================================================
const PYREF = {
    'print':      { desc: 'show something on the screen',        ex: 'print("Hello, detective!")',
                    man: 'print() shows things in the output panel.\n\n  print("hello")            text goes in quotes\n  print(42)                 numbers don\'t need quotes\n  print("Age:", 12)         commas print several things with spaces between\n  print("a", "b", sep="")   sep="" means no spaces' },
    'variables':  { desc: 'store a value with a name',           ex: 'codename = "Agent Sparrow"',
                    man: 'A variable is a labelled box that holds a value.\n\n  name = "Ada"           a string (text)\n  age = 12               a number\n  print(name)            use the box\'s name to get the value back\n\n  Names can\'t have spaces: use_underscores_instead' },
    'strings':    { desc: 'text in quotes',                      ex: 'message = "part one " + "part two"',
                    man: 'A string is text inside quotes: "like this" or \'like this\'.\n\n  "abc" + "def"          join strings  -> "abcdef"\n  "ha" * 3               repeat        -> "hahaha"\n  len("hello")           how long      -> 5\n  "hello".upper()        -> "HELLO"\n  "Bandstand".lower()    -> "bandstand"\n  "banana".count("a")    -> 3' },
    'f-strings':  { desc: 'put variables inside text',           ex: 'print(f"Agent {codename} reporting")',
                    man: 'An f-string has an f before the quotes. Anything in {curly brackets} is filled in.\n\n  name = "Ada"\n  print(f"Hello {name}!")         -> Hello Ada!\n  print(f"2 + 2 = {2 + 2}")       -> 2 + 2 = 4' },
    'len':        { desc: 'how long a string or list is',        ex: 'print(len(message))',
                    man: 'len() counts things.\n\n  len("hello")           -> 5 characters (spaces count too!)\n  len([3, 1, 4])         -> 3 items in a list' },
    'maths':      { desc: 'add, subtract, multiply, divide',     ex: 'print(3600 // 900)',
                    man: 'Python is a brilliant calculator.\n\n  7 + 3    -> 10        7 - 3    -> 4\n  7 * 3    -> 21        7 / 2    -> 3.5\n  7 // 2   -> 3   (whole-number divide)\n  7 % 2    -> 1   (the REMAINDER left over)\n  2 ** 3   -> 8   (power: 2 x 2 x 2)' },
    'int/str':    { desc: 'turn text into numbers and back',     ex: 'code = str(4) + str(2)',
                    man: 'Numbers and text are different types.\n\n  "4" + "2"        -> "42"   (joining text)\n  4 + 2            -> 6      (adding numbers)\n  str(4)           -> "4"    number to text\n  int("42")        -> 42     text to number\n\n  "Age: " + 12  is an ERROR. Use "Age: " + str(12)' },
    'if':         { desc: 'only do something when it\'s true',   ex: 'if code > 5000:\n    print("ALARM")\nelse:\n    print("SAFE")',
                    man: 'if runs the indented lines only when the test is True.\n\n  if score > 100:\n      print("High score!")\n  elif score > 50:\n      print("Not bad")\n  else:\n      print("Keep trying")\n\n  Tests:  ==  equal    !=  not equal    <  >  <=  >=\n  Don\'t forget the colon : and the 4 spaces!' },
    'lists':      { desc: 'a collection of things',              ex: 'suspects = ["Ada", "Ben", "Chloe"]',
                    man: 'A list holds lots of values, in order, in [square brackets].\n\n  names = ["Ada", "Ben", "Chloe"]\n  names[0]               -> "Ada"   (counting starts at 0!)\n  names[-1]              -> "Chloe" (the last one)\n  len(names)             -> 3\n  names.append("Dev")    add to the end\n  sorted(names)          a sorted copy' },
    'for':        { desc: 'repeat for each item',                ex: 'for name in names:\n    print(name)',
                    man: 'for repeats the indented lines once for each item.\n\n  for name in names:\n      print(name)\n\n  for i in range(5):      i = 0, 1, 2, 3, 4\n      print(i)\n\n  for letter in "abc":    works on strings too!\n      print(letter)' },
    'in':         { desc: 'is it in there?',                     ex: 'if "Ben" not in signed_out:',
                    man: 'in checks whether something is inside a list or string.\n\n  "Ben" in ["Ada", "Ben"]       -> True\n  "Zoe" not in ["Ada", "Ben"]   -> True\n  "pier" in "west pier"         -> True' },
    'open':       { desc: 'open a file to read it',              ex: 'with open("case_file.txt") as f:\n    text = f.read()\nprint(text)',
                    man: 'open() opens a file. "with" closes it again for you.\n\n  with open("notes.txt") as f:\n      text = f.read()            the whole file as one string\n\n  with open("notes.txt") as f:\n      lines = f.readlines()      a list of lines\n\n  with open("notes.txt") as f:\n      for line in f:             one line at a time\n          print(line.strip())' },
    'write':      { desc: 'save text into a file',               ex: 'with open("report.txt", "w") as f:\n    f.write("Case closed!")',
                    man: 'Open a file with "w" to write to it (careful: it replaces what was there).\n\n  with open("report.txt", "w") as f:\n      f.write("line one\\n")\n      f.write("line two\\n")\n\n  "a" adds to the end instead of replacing.' },
    'enumerate':  { desc: 'count while you loop',                ex: 'for number, line in enumerate(lines, 1):\n    print(number, line)',
                    man: 'enumerate() gives you a counter AND the item.\n\n  for i, name in enumerate(["a", "b"], 1):\n      print(i, name)       -> 1 a   then   2 b' },
    'strip':      { desc: 'remove spaces and newlines at the ends', ex: 'line = line.strip()',
                    man: 'Lines read from a file end with an invisible newline "\\n".\n\n  "  hello\\n".strip()     -> "hello"' },
    'split':      { desc: 'chop a string into a list',           ex: 'parts = line.split()',
                    man: 'split() chops text into a list.\n\n  "a b c".split()           -> ["a", "b", "c"]   (on spaces)\n  "1,2,3".split(",")        -> ["1", "2", "3"]\n  "KEY=value".split("=")    -> ["KEY", "value"]' },
    'startswith': { desc: 'does the text start (or end) with...', ex: 'if line.startswith("Day"):',
                    man: 'Check the start or end of a string.\n\n  "Day 4: rain".startswith("Day")   -> True\n  "photo.jpg".endswith(".jpg")      -> True' },
    'dict':       { desc: 'look things up by name; count things', ex: 'counts = {}\ncounts[name] = counts.get(name, 0) + 1',
                    man: 'A dictionary maps keys to values, in {curly brackets}.\n\n  ages = {"Ada": 12, "Ben": 11}\n  ages["Ada"]               -> 12\n  ages["Chloe"] = 13        add a new key\n\n  Counting things:\n  counts = {}\n  for word in words:\n      counts[word] = counts.get(word, 0) + 1\n\n  Biggest value:  max(counts, key=counts.get)' },
    'os':         { desc: 'look inside folders',                 ex: 'import os\nprint(os.listdir())',
                    man: 'The os module explores files and folders.\n\n  import os\n  os.listdir()                   what\'s in this folder\n  os.listdir("/evidence")        what\'s in another folder\n  os.path.join("a", "b.txt")     -> "a/b.txt"\n  os.path.isdir(path)            is it a folder?\n  os.getcwd()                    which folder am I in?' },
    'os.walk':    { desc: 'visit every folder inside a folder',  ex: 'for folder, subfolders, files in os.walk("/evidence"):\n    for name in files:\n        print(os.path.join(folder, name))',
                    man: 'os.walk() visits a folder, then every folder inside it, and inside those...\n\n  import os\n  for folder, subfolders, files in os.walk("/evidence"):\n      print(folder, files)\n\n  Or use glob with ** to match files anywhere:\n  import glob\n  glob.glob("/evidence/**/*.txt", recursive=True)' },
    'slicing':    { desc: 'take part of a string or list',       ex: 'print(text[::-1])',
                    man: 'Square brackets with colons take slices: [start:stop:step]\n\n  s = "detective"\n  s[0]        -> "d"\n  s[0:3]      -> "det"\n  s[-3:]      -> "ive"\n  s[::2]      -> "dtcie"   every 2nd letter\n  s[::-1]     -> "evitceted"   backwards!' },
    'join':       { desc: 'glue a list of strings together',     ex: 'word = "".join(letters)',
                    man: 'join() is the opposite of split().\n\n  "".join(["a", "b", "c"])      -> "abc"\n  " ".join(["hi", "there"])     -> "hi there"' },
    'ord/chr':    { desc: 'letters are secretly numbers',        ex: 'print(ord("A"), chr(66))',
                    man: 'Every character has a number code.\n\n  ord("A")    -> 65\n  chr(66)     -> "B"\n\n  Shift a capital letter by 3, wrapping Z round to A:\n  chr((ord(letter) - 65 + 3) % 26 + 65)' },
    'def':        { desc: 'make your own function',              ex: 'def shout(word):\n    return word.upper() + "!"',
                    man: 'def makes a reusable function.\n\n  def double(n):\n      return n * 2\n\n  print(double(21))    -> 42' },
    'base64':     { desc: 'decode base64, hex and binary',       ex: 'import base64\nprint(base64.b64decode(text).decode())',
                    man: 'Ways computers write bytes as text:\n\n  import base64\n  base64.b64decode("SGk=").decode()       -> "Hi"\n  base64.b64encode(b"Hi").decode()        -> "SGk="\n\n  bytes.fromhex("4869").decode()          -> "Hi"\n  int("01001000", 2)                      -> 72  (then chr(72) -> "H")' },
    'hashlib':    { desc: 'make a fingerprint (hash) of text',   ex: 'import hashlib\nprint(hashlib.sha256(b"hello").hexdigest())',
                    man: 'A hash is a fingerprint of some data. The same text always gives\nthe same hash, but you can\'t turn a hash back into the text.\n\n  import hashlib\n  hashlib.sha256("hello".encode()).hexdigest()' },
    'xor':        { desc: 'flip bits with a secret key',         ex: 'print(chr(byte ^ 42))',
                    man: '^ is XOR. Doing it twice with the same key gets you back where you started:\n\n  65 ^ 42       -> 107\n  107 ^ 42      -> 65\n\n  data = bytes.fromhex("6b4f")\n  "".join(chr(b ^ 42) for b in data)' }
};

// Friendlier explanations for the errors beginners hit most
const ERROR_HELP = {
    SyntaxError: 'Python couldn\'t understand this line. Look for a missing bracket ( ), quote " or colon : at the end of an if/for line.',
    IndentationError: 'The spaces at the start of a line are wrong. Lines inside an if, for or def need 4 spaces in front.',
    TabError: 'Mixing tabs and spaces confuses Python. Use 4 spaces.',
    NameError: 'Python doesn\'t know that name. Is it spelled the same everywhere? Did you make the variable before using it? Text needs "quotes".',
    TypeError: 'You mixed up types, like adding a number to text. Try str(number) to turn it into text, or int(text) to make a number.',
    FileNotFoundError: 'There\'s no file with that name here. Check the spelling and the folder. Try print(os.listdir()) to see what\'s here.',
    IsADirectoryError: 'That\'s a folder, not a file. Use os.listdir() to look inside it.',
    NotADirectoryError: 'That\'s a file, not a folder. Use open() to read it.',
    IndexError: 'You asked for an item past the end of a list or string. Remember: counting starts at 0!',
    KeyError: 'That key isn\'t in the dictionary. Check the spelling and capital letters.',
    ValueError: 'The value was the wrong kind for that, like int("abc").',
    ZeroDivisionError: 'You divided by zero. Even Python can\'t do that!',
    AttributeError: 'That doesn\'t have a method with that name. Check the spelling, e.g. .upper() not .uper()',
    ModuleNotFoundError: 'Python can\'t find that module. Check the spelling after import.',
    UnicodeDecodeError: 'These bytes aren\'t plain text. Maybe they still need decoding?',
    Error: 'Decoding went wrong. Is the text really in that format? Check you\'re decoding the right thing.',
    RecursionError: 'A function kept calling itself forever.',
    RuntimeError: ''
};

// =====================================================================
//  Game state for the case being played
// =====================================================================
let S = null;          // current case state
let term = null, fitAddon = null, editor = null;

function newState(c) {
    return {
        c, runs: 0, running: false,
        done: new Set(), hintLevel: {}, hintsUsed: 0, lastLearned: null, solved: false,
        evOk: new Set(), evAns: {}, evTip: {}, evSkip: new Set()
    };
}

function print(text) {
    if (text == null || text === '') return;
    term.write(text.endsWith('\n') ? text : text + '\n');
}
const printErr = msg => print(`${C.red}${msg}${C.r}`);

// =====================================================================
//  Python (runs in a Web Worker; see py-worker.js)
// =====================================================================
const PY = { worker: null, ready: false, caseMsg: null, runId: 0, pending: null, timer: null };

function pyStart() {
    PY.ready = false;
    PY.worker = makePyWorker();
    PY.worker.onmessage = onPyMessage;
    PY.worker.onerror = e => {
        e.preventDefault?.();
        pyFailed(e.message || 'the Python worker crashed');
    };
    if (PY.caseMsg) PY.worker.postMessage(PY.caseMsg);
    renderRunState();
}

function pyLoadCase(c) {
    PY.caseMsg = { t: 'case', c: { files: c.files || {}, dirs: c.dirs || [], home: c.home } };
    PY.worker.postMessage(PY.caseMsg);
}

function pyRun(code) {
    return new Promise(resolve => {
        const id = ++PY.runId;
        PY.pending = { id, resolve };
        PY.worker.postMessage({ t: 'run', id, code });
    });
}

// Throw the worker away (the only way to stop a stuck loop) and start a fresh one
function pyStop(reason) {
    clearTimeout(PY.timer);
    PY.worker.terminate();
    const p = PY.pending;
    PY.pending = null;
    pyStart();
    p?.resolve({ stopped: reason });
}

function pyFailed(msg) {
    const p = PY.pending;
    PY.pending = null;
    clearTimeout(PY.timer);
    if (p) p.resolve({ fatal: msg });
    else if (term) printErr(`🐍 Python couldn't start (${msg}). Check the internet connection, then reload the page.`);
}

function onPyMessage({ data: m }) {
    if (m.t === 'ready') { PY.ready = true; renderRunState(); return; }
    if (m.t === 'out') { if (term && PY.pending) print(m.err ? `${C.red}${m.s}${C.r}` : m.s); return; }
    if (m.t === 'fatal') { pyFailed(m.msg); return; }
    if (!PY.pending || m.id !== PY.pending.id) return;          // from a run we already stopped
    if (m.t === 'started') {
        clearTimeout(PY.timer);
        PY.timer = setTimeout(() => pyStop('timeout'), RUN_TIMEOUT_MS);
    } else if (m.t === 'done') {
        clearTimeout(PY.timer);
        const p = PY.pending;
        PY.pending = null;
        p.resolve(m.result);
    }
}

async function runCode() {
    if (!S || S.running) return;
    if (!PY.ready) { toast('🐍 Python is still waking up. Try again in a moment!'); return; }
    const code = editor.getValue();
    saveDraft(S.c, code);
    clearErrorLine();
    $('#run-hint').classList.remove('show');
    S.runs++;
    S.running = true;
    renderRunState();
    print(`${C.dim}──────── ▶ run ${S.runs} ────────${C.r}`);

    const caseState = S;
    const result = await pyRun(code);
    if (S !== caseState) return;                // the student left the case mid-run
    S.running = false;
    renderRunState();

    if (result.stopped === 'timeout') {
        printErr(`⏱  Your code ran for ${RUN_TIMEOUT_MS / 1000} seconds, so I stopped it.`);
        print(`${C.dim}   Is there a loop that never ends? A while loop needs something that makes it stop.${C.r}`);
        return;
    }
    if (result.stopped) { print(`${C.yellow}⏹  Stopped.${C.r}`); return; }
    if (result.fatal) { printErr(`Oops, something went wrong running Python (${result.fatal}). Please tell a mentor!`); return; }

    if (result.error) showError(result.error, code);
    else if (!result.stdout) print(`${C.dim}(your code ran, but didn't print anything. Use print() to see results)${C.r}`);

    for (const e of result.events) checkMissions(e);
    checkMissions({ type: 'run', code, stdout: result.stdout, ok: result.ok, error: result.error });
}

function showError(err, code) {
    const where = err.line ? ` on line ${err.line}` : '';
    printErr(`${C.b}✖ ${err.type}${where}${C.r}`);
    if (err.line) {
        const src = code.split('\n')[err.line - 1];
        if (src != null) print(`${C.dim}   ${err.line} │${C.r} ${src}`);
        markErrorLine(err.line);
    }
    print(`${C.red}   ${err.msg.replace(/\[Errno \d+\] /, '')}${C.r}`);
    const help = ERROR_HELP[err.type];
    if (help) print(`${C.yellow}   💡 ${help}${C.r}`);
}

function renderRunState() {
    const btn = $('#run-btn');
    if (!btn) return;
    const running = !!S?.running;
    btn.disabled = running || !PY.ready;
    btn.textContent = !PY.ready ? '⏳ Python loading…' : running ? '⏳ Running…' : '▶ Run';
    $('#stop-btn').disabled = !running;
}

// =====================================================================
//  Output console (xterm.js, output only) & code editor (CodeMirror)
// =====================================================================
function ensureConsole() {
    if (term) return;
    term = new Terminal({
        convertEol: true,
        disableStdin: true,
        cursorBlink: false,
        fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
        fontSize: 14,
        lineHeight: 1.15,
        scrollback: 5000,
        theme: {
            background: '#05070a', foreground: '#d3dde8', cursor: '#05070a', cursorAccent: '#05070a',
            selectionBackground: '#1f8f5288',
            black: '#1b2230', red: '#ff5c7a', green: '#39ff88', yellow: '#ffc94d', blue: '#5aa9ff',
            magenta: '#b48cff', cyan: '#4fd1ff', white: '#d3dde8',
            brightBlack: '#5c6b7d', brightRed: '#ff5c7a', brightGreen: '#39ff88', brightYellow: '#ffc94d',
            brightBlue: '#6cb6ff', brightMagenta: '#c9a8ff', brightCyan: '#4fd1ff', brightWhite: '#ffffff'
        }
    });
    fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open($('#terminal'));
    new ResizeObserver(fit).observe($('#terminal'));
    term.attachCustomKeyEventHandler(e => {
        if (e.type === 'keydown' && e.ctrlKey && e.key.toLowerCase() === 'c' && term.hasSelection()) {
            navigator.clipboard?.writeText(term.getSelection());
            term.clearSelection();
            return false;
        }
        return true;
    });
}

function fit() { try { fitAddon?.fit(); } catch { /* not visible yet */ } }

function clearConsole() { term.write('\x1b[2J\x1b[3J\x1b[H'); }

function ensureEditor() {
    if (editor) return;
    editor = CodeMirror($('#editor'), {
        mode: 'python',
        theme: 'detective',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {
            'Ctrl-Enter': runCode, 'Cmd-Enter': runCode,
            'Tab': cm => cm.somethingSelected() ? cm.indentSelection('add') : cm.replaceSelection('    '),
            'Shift-Tab': cm => cm.indentSelection('subtract'),
            'Ctrl-/': 'toggleComment', 'Cmd-/': 'toggleComment'
        }
    });
    let saveTimer;
    editor.on('change', () => {
        clearErrorLine();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => S && saveDraft(S.c, editor.getValue()), 400);
    });
}

let errorLine = null;
function markErrorLine(n) {
    clearErrorLine();
    errorLine = editor.addLineClass(n - 1, 'background', 'cm-error-line');
}
function clearErrorLine() {
    if (errorLine) editor.removeLineClass(errorLine, 'background', 'cm-error-line');
    errorLine = null;
}

// Add a snippet to the end of the student's code
function insertCode(code) {
    if (!S) return;
    const cur = editor.getValue();
    const sep = !cur.trim() ? '' : cur.endsWith('\n\n') ? '' : cur.endsWith('\n') ? '\n' : '\n\n';
    if (!cur.trim()) editor.setValue(code + '\n');
    else editor.replaceRange(sep + code + '\n', CodeMirror.Pos(editor.lastLine()));
    const last = editor.lastLine();
    editor.focus();
    editor.setCursor(last, 0);
    editor.scrollIntoView(null, 60);
    $('#run-hint').classList.add('show');
}

function setFontSize(px) {
    term.options.fontSize = px;
    $('#editor').style.fontSize = px + 'px';
    editor.refresh();
    fit();
}

// =====================================================================
//  Missions, hints & evidence
// =====================================================================
// Evidence questions an objective still needs (skipped bonus ones don't count)
const evidenceNeeded = m => S.c.evidence.filter(f =>
    (m.evidence || []).includes(f.id) && !S.evOk.has(f.id) && !S.evSkip.has(f.id));
// Finished = the code worked and its evidence has been recorded
const isFinished = m => S.done.has(m.id) && !evidenceNeeded(m).length;
const currentMission = () => S.c.missions.find(m => !isFinished(m));

function checkMissions(e) {
    for (const m of S.c.missions) {
        if (S.done.has(m.id)) continue;
        let ok = false;
        try { ok = m.done(e); } catch (err) { console.error(`Mission ${m.id} check failed`, err); }
        if (ok) completeMission(m);
    }
}

function completeMission(m) {
    S.done.add(m.id);
    if (!m.final) {
        // An objective with evidence finishes once its answers are recorded (see saveEvidence)
        const needsEvidence = evidenceNeeded(m).length > 0;
        let msg = `\n${C.yellow}${C.b}★ ${needsEvidence ? 'YOUR CODE WORKED' : 'OBJECTIVE COMPLETE'}: ${m.title}${C.r}`;
        if (m.clue) msg += `\n${C.cyan}  ↳ ${m.clue}${C.r}`;
        if (needsEvidence) {
            msg += `\n${C.cyan}  📝 Type what you found into the Objectives panel → to unlock the next objective${C.r}`;
            showTab('mission');
            setTimeout(() => $('#mission [data-ev-input]')?.focus(), 50);
        }
        print(msg);
        toast(`★ ${needsEvidence ? 'Your code worked' : 'Objective complete'}: ${m.title}`);
    }
    if (m.learn) S.lastLearned = m;
    saveCaseState();
    renderCasePanel(true);
}

const hintCostText = () => S.c.hintCost ? ` (−${Math.round(S.c.hintCost * 100)}% XP)` : '';

function revealHint() {
    const m = currentMission();
    if (!m) return;
    const lvl = S.hintLevel[m.id] || 0;
    if (lvl < m.hints.length) {
        S.hintLevel[m.id] = lvl + 1;
        S.hintsUsed++;
        saveCaseState();
        renderCasePanel();
    }
}

function xpFor(bonusOk) {
    const c = S.c;
    const base = Math.round(c.xp * Math.max(0.5, 1 - S.hintsUsed * (c.hintCost || 0)));
    return base + Math.round(c.xp * 0.1 * bonusOk);
}

// Labels are numbered by the engine, so drop any "1. " the case wrote itself
const cleanLabel = f => f.label.replace(/^\d+\.\s*/, '');

// Check one evidence answer and remember it. Returns 'ok', 'bad' or 'empty'
function submitAnswer(id, value) {
    const f = S.c.evidence.find(x => x.id === id);
    const typed = String(value ?? '').trim(), v = typed.toLowerCase();
    if (!f || !v) return 'empty';
    delete S.evTip[id];
    let res = 'bad';
    if (f.check(v)) {
        res = 'ok';
        S.evOk.add(id);
        S.evAns[id] = typed;
        // Every main answer in closes the case; late bonus answers still add XP
        const bonusOk = S.c.evidence.filter(x => x.bonus && S.evOk.has(x.id)).length;
        if (S.c.evidence.every(x => x.bonus || S.evOk.has(x.id))) {
            if (!S.solved) solve(bonusOk);
            else recordResult(bonusOk);
        }
    } else {
        S.evTip[id] = '💡 ' + (f.tips?.[v] || f.tip);
    }
    saveCaseState();
    renderCasePanel();
    renderBonus();
    return res;
}

// Save the best result for this case; returns XP earned this time
function recordResult(bonusOk) {
    const xp = xpFor(bonusOk);
    const prev = progress.solved[S.c.id];
    if (!prev || xp > prev.xp) {
        progress.solved[S.c.id] = { xp, hints: S.hintsUsed, stars: bonusOk };
        saveProgress(progress);
    }
    return xp;
}

function solve(bonusOk) {
    S.solved = true;
    const before = totalXp();
    const wasLocked = CASES.filter(c => !isUnlocked(c)).map(c => c.id);
    const xp = recordResult(bonusOk);
    const finalM = S.c.missions.find(m => m.final);
    if (finalM) completeMission(finalM);
    const after = totalXp();
    const rank = rankFor(after);

    print(['', ...asciiBox(['C A S E   C L O S E D', `+${xp} XP`], 44), ''].join('\n'));

    const newlyUnlocked = CASES.filter(c => wasLocked.includes(c.id) && isUnlocked(c));
    const bonusTotal = S.c.evidence.filter(f => f.bonus).length;
    $('#modal-xp').textContent = `+${xp} XP`;
    $('#modal-rank').innerHTML = `Your rank: <b style="color:var(--amber)">${rank}</b>` +
        (rankFor(before) !== rank ? ' <span style="color:var(--green)">⬆ PROMOTED!</span>' : '');
    $('#modal-stats').innerHTML =
        `<div><b>${S.runs}</b>times you ran code</div>` +
        `<div><b>${S.hintsUsed}</b>hints used</div>` +
        `<div><b>${bonusOk}/${bonusTotal}</b>bonus ⭐</div>`;
    const next = newlyUnlocked[0];
    $('#modal-note').innerHTML = next
        ? `🔓 New case unlocked: <b>${escapeHtml(next.title)}</b>`
        : 'Missed a bonus question? Answer it in the 🏆 Bonus tab to earn more XP.';
    $('#modal-board').textContent = next ? `Next case: ${next.title} →` : 'Back to the case board';
    $('#modal-board').href = next ? `#/case/${next.id}` : '#/';
    $('#modal').classList.add('show');
    confetti();
}

// =====================================================================
//  Case view rendering
// =====================================================================
function renderCasePanel(animateLearned) {
    const ms = S.c.missions, total = ms.length;
    const finished = ms.filter(isFinished).length;
    $('#prog-fill').style.width = (finished / total * 100) + '%';
    $('#prog-count').textContent = `${finished}/${total}`;

    const L = S.lastLearned;
    $('#learned').innerHTML = L
        ? `<div class="card learned"${animateLearned ? '' : ' style="animation:none"'}><b>✅ Objective ${ms.indexOf(L) + 1} · you learned:</b><p>${L.learn}</p></div>` : '';

    const cur = currentMission();
    if (!cur) {
        $('#mission').innerHTML = `<div class="card mission"><div class="eyebrow">CASE CLOSED</div>
            <h2>🎉 Brilliant work, Detective!</h2>
            <p>Try the <a href="#" data-tab="bonus">🏆 bonus challenges</a>, keep experimenting with your code, or head back to the <a href="#/">case board</a> for your next case.</p></div>`;
    } else {
        const i = ms.indexOf(cur);
        const lvl = S.hintLevel[cur.id] || 0;
        const hard = S.c.difficulty === 'hard';
        const showTry = cur.tutorial || (!hard && lvl >= cur.hints.length);
        const fields = pendingEvidence(cur);
        keepTyped($('#mission'), () => {
        if (fields.length) $('#mission').innerHTML = `<div class="card mission">
            <div class="eyebrow">OBJECTIVE ${i + 1} OF ${total}</div>
            <h2>${cur.title}</h2>
            ${evidenceAskHtml(cur, fields)}
        </div>`;
        else $('#mission').innerHTML = `<div class="card mission">
            <div class="eyebrow">OBJECTIVE ${i + 1} OF ${total}</div>
            <h2>${cur.title}</h2>
            <p>${cur.story}</p>
            <div class="task"><span class="task-label">YOUR TASK</span>${cur.task}</div>
            ${cur.data ? `<div class="try"><span class="small">📋 Click to add this to your code:</span>
                <button class="chip cmd" data-code="${escapeHtml(cur.data)}"><pre>${escapeHtml(cur.data)}</pre></button></div>` : ''}
            ${cur.tools?.length ? `<div class="row"><span class="small">🧰 Useful Python:</span>${cur.tools.map(t =>
                `<button class="chip" data-ref="${escapeHtml(t)}" title="Click to read about ${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}</div>` : ''}
            ${lvl ? `<ul class="hints">${cur.hints.slice(0, lvl).map(h => `<li>💡 ${h}</li>`).join('')}</ul>` : ''}
            ${showTry && cur.try?.length ? `<div class="try"><span class="small">Click to add it to your code, then press <kbd>▶ Run</kbd>:</span>
                ${cur.try.map(c => `<button class="chip cmd" data-code="${escapeHtml(c)}"><pre>${escapeHtml(c)}</pre></button>`).join('')}</div>` : ''}
            ${lvl < cur.hints.length ? `<button class="hint-btn" data-hint>💡 ${lvl ? 'Another hint' : 'Need a hint?'} <span>(${cur.hints.length - lvl} left${hintCostText()})</span></button>` : ''}
        </div>`;
        });
    }

    const found = S.c.evidence.filter(f => S.evOk.has(f.id));
    $('#found').innerHTML = found.length ? `<div class="found"><b>🗂 Evidence Board</b><ul>${found.map(f =>
        `<li>${f.bonus ? '⭐ ' : ''}${cleanLabel(f)} <span>${escapeHtml(S.evAns[f.id])}</span></li>`).join('')}</ul></div>` : '';

    renderTaskBar(cur);

    // Compact progress dots: click a finished one to re-read what it taught
    $('#steps').innerHTML = ms.map((m, i) => {
        const st = isFinished(m) ? 'done' : m === cur ? 'current' : 'todo';
        const tip = `${i + 1}. ${m.title}` + (st === 'done' && m.learn ? ' (click to review)' : '');
        return `<li class="${st}"><button class="step" ${st === 'done' ? `data-step="${i}"` : 'tabindex="-1"'} title="${escapeHtml(tip)}">${st === 'done' ? '✔' : i + 1}</button></li>`;
    }).join('');
}

// Evidence the current objective is asking for: its own questions once its code has worked,
// or, on the final report, any main question still unanswered
function pendingEvidence(cur) {
    if (cur.final) return S.solved ? [] : S.c.evidence.filter(f => !f.bonus && !S.evOk.has(f.id));
    return S.done.has(cur.id) ? evidenceNeeded(cur) : [];
}

// One evidence question with its answer box. `where` keeps the ids unique per panel
function evQuestionHtml(f, where, canSkip) {
    return `<div class="ev-q">
        <label for="${where}-${f.id}">${f.bonus ? '⭐ BONUS: ' : ''}${cleanLabel(f)}</label>
        <span class="ev-q-row">
            <input id="${where}-${f.id}" data-ev-input="${f.id}" placeholder="${escapeHtml(f.ph || '')}" autocomplete="off" spellcheck="false">
            <button class="tb-btn run" data-ev-save="${f.id}">✔ Check</button>
            ${canSkip ? `<button class="tb-btn" data-ev-skip="${f.id}" title="Bonus questions are optional">Skip</button>` : ''}
        </span>
        ${S.evTip[f.id] ? `<div class="ev-tip">${escapeHtml(S.evTip[f.id])}</div>` : ''}
    </div>`;
}

function evidenceAskHtml(cur, fields) {
    return `<div class="ev-ask">
        <div class="eyebrow">📝 RECORD YOUR EVIDENCE</div>
        <p>${cur.final ? 'Answer these to close the case.' : '✅ Your code worked! Look at your output and type what you found to unlock the next objective.'}</p>
        ${fields.map(f => evQuestionHtml(f, 'tbin', f.bonus)).join('')}
    </div>`;
}

// Redraw a panel's evidence questions without losing anything half-typed
function keepTyped(panel, draw) {
    const typed = {};
    panel.querySelectorAll('[data-ev-input]').forEach(x => { typed[x.id] = x.value; });
    draw();
    Object.entries(typed).forEach(([id, v]) => { const x = document.getElementById(id); if (x) x.value = v; });
}

// Check an answer typed into an objective card or the Bonus tab
function saveEvidence(input) {
    const panel = input.closest('[data-panel]');
    const res = submitAnswer(input.dataset.evInput, input.value);
    if (res === 'ok' && !S.solved) toast('🗂 Evidence recorded!');
    if (res !== 'empty') panel.querySelector('[data-ev-input]')?.focus();
}

// A short copy of the current objective, right above the editor
function renderTaskBar(cur) {
    const bar = $('#task-bar'), ms = S.c.missions;
    const fields = cur ? pendingEvidence(cur) : [];
    const key = cur ? cur.id + (fields.length ? ':evidence' : '') : 'closed';
    if (!cur) {
        bar.innerHTML = `<div class="tb-main"><div class="eyebrow">🎉 CASE CLOSED</div>
            <div class="tb-task">Brilliant work, Detective! Try the <a href="#" data-tab="bonus">🏆 bonus challenges</a> or head back to the <a href="#/">case board</a>.</div></div>`;
    } else {
        const lvl = S.hintLevel[cur.id] || 0;
        bar.innerHTML = `<div class="tb-main">
                <div class="eyebrow">🎯 OBJECTIVE ${ms.indexOf(cur) + 1} OF ${ms.length}<b>${cur.title}</b></div>
                <div class="tb-task">${fields.length
                    ? `📝 ${cur.final ? 'Answer' : 'Your code worked! Now type'} what you found in the <a href="#" data-tab="mission">Objectives panel →</a> ${cur.final ? 'to close the case' : 'to unlock the next objective'}.`
                    : cur.task}</div>
                ${lvl ? `<div class="tb-hint">💡 ${cur.hints[lvl - 1]}</div>` : ''}
            </div>
            <div class="tb-side">
                ${lvl < cur.hints.length ? `<button class="hint-btn" data-hint>💡 ${lvl ? 'Another hint' : 'Hint'}</button>` : ''}
                <button class="chip" data-tab="mission" title="Read the whole objective on the right">📜 Details</button>
                <button class="chip" data-briefing title="Read the case story again">📁 Briefing</button>
            </div>`;
    }
    // Flash it when a new objective appears
    if (bar.dataset.key !== key) {
        bar.dataset.key = key;
        bar.classList.remove('new');
        void bar.offsetWidth;
        bar.classList.add('new');
    }
}

function showTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== name; });
    $('.tab-body').scrollTop = 0;
}

function renderCheats() {
    $('#cheats').innerHTML = Object.entries(PYREF).map(([name, r]) =>
        `<div class="cheat"><button class="chip ref" data-ref="${escapeHtml(name)}" title="Read about ${escapeHtml(name)}">${escapeHtml(name)}</button><span class="small">${r.desc}</span>
         <button class="chip cmd" data-code="${escapeHtml(r.ex)}" title="Click to add it to your code"><pre>${escapeHtml(r.ex)}</pre></button></div>`
    ).join('') + '<p class="small">Click a name to read about it in the output panel, or click an example to add it to your code.</p>';
}

function printRef(name) {
    const r = PYREF[name];
    if (!r) return;
    print(`\n${C.b}${C.cyan}📖 ${name}${C.r}${C.dim}: ${r.desc}${C.r}\n${r.man}\n`);
}

function renderBonus() {
    const b = S.c.bonus || [], qs = S.c.evidence.filter(f => f.bonus);
    $('#tab-bonus').hidden = !b.length && !qs.length;
    keepTyped($('#bonus'), () => {
        $('#bonus').innerHTML = (qs.length ? `<div class="ev-ask">
            <div class="eyebrow">⭐ BONUS QUESTIONS</div>
            <p class="small">Each right answer adds 10% XP, even after the case is closed.</p>
            ${qs.map(f => S.evOk.has(f.id)
                ? `<div class="ev-q done">✔ ${cleanLabel(f)} <b>${escapeHtml(S.evAns[f.id])}</b></div>`
                : evQuestionHtml(f, 'bnin', false)).join('')}
        </div>` : '') +
        b.map((x, i) => `<div class="bonus-item"><b>${i + 1}. ${x.title}</b> ${x.text}
            ${x.code ? `<button class="chip cmd" data-code="${escapeHtml(x.code)}"><pre>${escapeHtml(x.code)}</pre></button>` : ''}</div>`).join('');
    });
}

function asciiBox(lines, width) {
    const centre = s => {
        const left = Math.floor((width - s.length) / 2);
        return ' '.repeat(left) + s + ' '.repeat(width - s.length - left);
    };
    return [
        `${C.green}${C.b}  ╔${'═'.repeat(width)}╗`,
        ...lines.map(l => `  ║${centre(l)}║`),
        `  ╚${'═'.repeat(width)}╝${C.r}`
    ];
}

function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 3300);
}

function confetti() {
    const colours = ['#39ff88', '#4fd1ff', '#ffc94d', '#ff5c7a', '#b48cff'];
    for (let i = 0; i < 90; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colours[i % colours.length];
        c.style.animationDuration = 2 + Math.random() * 2.5 + 's';
        c.style.animationDelay = Math.random() * .6 + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 5500);
    }
}

// =====================================================================
//  Case board
// =====================================================================
function renderBoard() {
    const xp = totalXp();
    const solvedCount = CASES.filter(c => progress.solved[c.id]).length;
    $('#hdr-xp').textContent = $('#board-xp').textContent = xp;
    $('#hdr-rank').textContent = $('#board-rank').textContent = rankFor(xp);
    $('#board-solved').textContent = `${solvedCount}/${CASES.length}`;
    $('#teacher-toggle').textContent = progress.teacher ? '🔓 Teacher mode ON (all cases unlocked)' : 'Teacher mode: unlock all cases';

    $('#tiers').innerHTML = Object.entries(DIFFICULTIES).map(([key, d]) => {
        const cases = CASES.filter(c => c.difficulty === key);
        if (!cases.length) return '';
        return `<section class="tier ${key}">
            <div class="tier-head"><h2>${d.label}</h2><p>${d.blurb}</p></div>
            <div class="cards">${cases.map(caseCard).join('')}</div>
        </section>`;
    }).join('');
}

function caseCard(c) {
    const solved = progress.solved[c.id];
    const locked = !isUnlocked(c);
    const need = caseById(c.requires);
    const foot = locked ? `<span>🔒 Solve “${escapeHtml(need?.title || 'the case before')}” to unlock</span>`
        : solved ? `<span>✔ Solved · ${solved.xp} XP${solved.stars ? ' ' + '⭐'.repeat(solved.stars) : ''}</span><span>Replay →</span>`
        : `<span>Start case →</span>`;
    return `<button class="case-card ${c.difficulty} ${solved ? 'solved' : ''} ${locked ? 'locked' : ''}" data-case="${c.id}" ${locked ? 'aria-disabled="true"' : ''}>
        <div class="cc-top"><span class="badge ${c.difficulty}">CASE ${CASES.indexOf(c) + 1} · ${DIFFICULTIES[c.difficulty].label}</span><span class="cc-xp">${c.xp} XP</span></div>
        ${solved ? '<span class="stamp">SOLVED</span>' : ''}
        <div class="cc-icon">${locked ? '🔒' : c.icon}</div>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${c.summary}</p>
        <div class="skills">${c.skills.map(s => `<span>${s}</span>`).join('')}</div>
        <div class="cc-foot">${foot}</div>
    </button>`;
}

// =====================================================================
//  Routing between the board and a case
// =====================================================================
function showBoard() {
    if (S?.running) pyStop('left');
    S = null;
    $('#modal').classList.remove('show');
    $('#case-view').hidden = true;
    $('#hdr-case').hidden = true;
    $('#board-view').hidden = false;
    $('#hdr-board').hidden = false;
    document.title = 'Python Detective';
    renderBoard();
}

function openCase(c) {
    if (S?.running) pyStop('left');
    $('#board-view').hidden = true;
    $('#hdr-board').hidden = true;
    $('#case-view').hidden = false;
    $('#hdr-case').hidden = false;
    $('#modal').classList.remove('show');
    document.title = `${c.title} | Python Detective`;

    $('#hdr-badge').className = 'badge ' + c.difficulty;
    $('#hdr-badge').textContent = DIFFICULTIES[c.difficulty].label;
    $('#hdr-case-name').textContent = c.title;

    S = newState(c);
    const saved = loadCaseState(c);
    if (saved) {
        S.done = new Set((saved.done || []).filter(id => c.missions.some(m => m.id === id)));
        S.hintLevel = saved.hintLevel || {};
        S.hintsUsed = saved.hintsUsed || 0;
        S.solved = !!saved.solved;
        S.evSkip = new Set(saved.skipped || []);
        for (const f of c.evidence) {
            const v = saved.answers?.[f.id];
            if (v && f.check(v.trim().toLowerCase())) { S.evOk.add(f.id); S.evAns[f.id] = v; }
        }
    }
    pyLoadCase(c);
    ensureConsole();
    ensureEditor();
    term.reset();
    editor.setValue(loadDraft(c) ?? c.starter ?? '');
    editor.clearHistory();
    fit();
    renderCasePanel();
    const story = ansiToHtml(reflowIntro(c.intro));
    $('#briefing-title').textContent = c.title;
    $('#briefing-body').innerHTML = story;
    $('#briefing-text').innerHTML = story;
    $('#briefing-card').open = true;
    renderCheats();
    renderBonus();
    renderRunState();
    $('#learned').innerHTML = '';
    $('#run-hint').classList.remove('show');
    showTab('mission');

    const hintNote = c.hintCost ? `   ${C.dim}(hints cost ${Math.round(c.hintCost * 100)}% XP each)${C.r}` : '';
    print([
        ...asciiBox([c.title.toUpperCase().split('').join(' ').slice(0, 44), `${DIFFICULTIES[c.difficulty].label} CASE · ${c.xp} XP`], 46),
        '',
        `  ${C.dim}Your current objective is above the code${C.r} ${C.cyan}↑${C.r}${C.dim}, with the full story on the right${C.r} ${C.cyan}→${C.r}`,
        `  ${C.dim}Write Python in the editor above, then press${C.r} ${C.green}▶ Run${C.r} ${C.dim}(or Ctrl+Enter).${C.r}`,
        `  ${C.dim}Stuck? Press${C.r} ${C.magenta}💡 Need a hint?${C.r}${hintNote}`,
        ...(S.done.size ? ['', `  ${C.green}Welcome back! ${S.done.size}/${c.missions.length} objectives already done.${C.r} ${C.dim}(↻ Restart to start again)${C.r}`] : []),
        ''
    ].join('\n'));
    setTimeout(() => { fit(); editor.refresh(); editor.focus(); }, 30);
    $('#briefing').classList.toggle('show', !S.done.size && !S.solved);
    if (!S.done.size && !S.solved) setTimeout(() => $('#briefing-go').focus(), 40);
}

function route() {
    const m = location.hash.match(/^#\/case\/([\w-]+)/);
    const c = m && caseById(m[1]);
    if (c && isUnlocked(c)) openCase(c);
    else {
        if (m) history.replaceState(null, '', '#/');
        showBoard();
    }
}

// =====================================================================
//  Wiring
// =====================================================================
document.addEventListener('click', e => {
    const card = e.target.closest('[data-case]');
    if (card) {
        const c = caseById(card.dataset.case);
        if (c && isUnlocked(c)) location.hash = `#/case/${c.id}`;
        else toast('🔒 Solve the case before this one first!');
        return;
    }
    const code = e.target.closest('[data-code]');
    if (code) { insertCode(code.dataset.code); return; }
    const ref = e.target.closest('[data-ref]');
    if (ref) { printRef(ref.dataset.ref); return; }
    const tab = e.target.closest('[data-tab]');
    if (tab) { e.preventDefault(); showTab(tab.dataset.tab); return; }
    const step = e.target.closest('[data-step]');
    if (step && S) {
        const m = S.c.missions[+step.dataset.step];
        if (m.learn) { S.lastLearned = m; renderCasePanel(true); }
        return;
    }
    if (e.target.closest('[data-hint]')) revealHint();
    if (e.target.closest('[data-briefing]')) showBriefing();
    const save = e.target.closest('[data-ev-save]');
    if (save && S) saveEvidence(save.closest('.ev-q').querySelector('[data-ev-input]'));
    const skip = e.target.closest('[data-ev-skip]');
    if (skip && S) { S.evSkip.add(skip.dataset.evSkip); saveCaseState(); renderCasePanel(); }
});
$('#run-btn').addEventListener('click', runCode);
$('#stop-btn').addEventListener('click', () => { if (S?.running) pyStop('button'); });
$('#clear-btn').addEventListener('click', () => term && clearConsole());
$('#reset-code').addEventListener('click', () => {
    if (S && confirm('Throw away your code and go back to the starting code for this case?')) {
        editor.setValue(S.c.starter || '');
        saveDraft(S.c, editor.getValue());
    }
});
$('#briefing-go').addEventListener('click', closeBriefing);
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.dataset?.evInput && S) saveEvidence(e.target);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#briefing').classList.contains('show')) closeBriefing(); });
$('#modal-close').addEventListener('click', () => { $('#modal').classList.remove('show'); editor.focus(); });
$('#restart').addEventListener('click', () => {
    if (S && confirm('Start this case again from the beginning? (Your code is kept.)')) { clearCaseState(S.c); openCase(S.c); }
});
$('#font-inc').addEventListener('click', () => setFontSize(Math.min(26, term.options.fontSize + 1)));
$('#font-dec').addEventListener('click', () => setFontSize(Math.max(10, term.options.fontSize - 1)));
$('#teacher-toggle').addEventListener('click', () => { progress.teacher = !progress.teacher; saveProgress(progress); renderBoard(); });
$('#reset-progress').addEventListener('click', () => {
    if (confirm('Forget all solved cases and XP?')) { progress = { solved: {}, teacher: progress.teacher }; saveProgress(progress); CASES.forEach(clearCaseState); renderBoard(); }
});
window.addEventListener('hashchange', route);

// Start Python straight away so it's warmed up by the time a case opens
pyStart();

// Wait briefly for the web font so the console measures characters correctly
Promise.race([document.fonts.load("14px 'JetBrains Mono'"), sleep(1500)]).finally(route);
