// =====================================================================
//  Python Detective: game engine
//  Cases live in cases/*.js and push themselves onto CASES.
//  Python itself runs in a Web Worker (py-worker.js); mission checks use
//  the helpers in checks.js; snippet explanations and the 📖 Python
//  reference live in explain.js.
// =====================================================================

// Output colours. Each one means one thing, and the key above the output says so:
//   plain white = printed by the student's code      green   = Detective HQ (the game) talking
//   magenta     = tips (shown purple)                red     = errors
// Yellow is kept for "text in quotes" in the editor, so it's not used in the output.
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
function clearDraft(c) {
    try { localStorage.removeItem(draftKey(c)); } catch { /* storage unavailable */ }
}

// How far the student got in each case (objectives, hints, correct answers)
const caseKey = c => `pythonDetective.case.${c.id}`;
function loadCaseState(c) {
    try { return JSON.parse(localStorage.getItem(caseKey(c))); } catch { return null; }
}
function saveCaseState() {
    const st = { done: [...S.done], hintLevel: S.hintLevel, hintsUsed: S.hintsUsed, solved: S.solved,
        answers: S.evAns, skipped: [...S.evSkip],
        practice: S.practice && { id: S.practice.id, line: S.practice.anchor?.find()?.line } };
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

// Friendlier explanations for the errors beginners hit most
const ERROR_HELP = {
    SyntaxError: 'Python couldn\'t understand this line. Look for a missing bracket ( ), quote " or colon : at the end of an if/for line.',
    IndentationError: 'The spaces at the start of a line are wrong. Lines inside an if, for or def need 4 spaces in front.',
    TabError: 'Mixing tabs and spaces confuses Python. Use 4 spaces.',
    NameError: 'Python doesn\'t know that name. Is it spelled the same everywhere, with the same capital letters? (Print and print are different!) Did you make the variable before using it? Text needs "quotes".',
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
        evOk: new Set(), evAns: {}, evTip: {}, evSkip: new Set(),
        stuck: 0, errRepeat: 0, practice: null, celebrate: null, evWrong: null
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
        print(`${C.magenta}   💡 Is there a loop that never ends? A while loop needs something that makes it stop.${C.r}`);
        return;
    }
    if (result.stopped) { print(`${C.green}⏹  Stopped.${C.r}`); return; }
    if (result.fatal) { printErr(`Oops, something went wrong running Python (${result.fatal}). Please tell a mentor!`); return; }

    const ignored = result.error ? [] : ignoredValues(code);
    if (result.error) showError(result.error, code);
    else if (ignored.length) showIgnored(ignored);
    else if (!result.stdout) print(`${C.magenta}💡 Your code ran, but it didn't print anything, so there's nothing to see.\n   Python works silently: use print() to show a result, e.g. print(message)${C.r}`);

    const cur = currentMission(), waiting = !cur || S.done.has(cur.id), doneBefore = S.done.size;
    for (const e of result.events) checkMissions(e);
    checkMissions({ type: 'run', code, stdout: result.stdout, ok: result.ok, error: result.error });
    if (!waiting && S.done.size === doneBefore) noticeStuck(code, result, ignored.length > 0);
    S.lastOut = result.stdout;
    S.lastCode = code;
}

// =====================================================================
//  Spotting a student who's stuck
// =====================================================================
// Lines that work out an answer and then throw it away, like len(message) on its own
const KEEPS_NOTHING_AWAY = /^(if|elif|else|for|while|with|def|class|return|import|from|try|except|finally|pass|break|continue|global|nonlocal|del|assert|raise|yield|async|await)\b/;
const DOES_SOMETHING = /^(print|input|exec|help|exit|quit)\s*\(|\.(append|extend|insert|remove|sort|reverse|update|clear|pop|add|discard|write|writelines|close|seek|shuffle|sleep|seed|mkdir|makedirs|rename|chdir)\s*\(/;
function ignoredValues(code) {
    const own = [...code.matchAll(/^\s*def\s+(\w+)/gm)].map(m => m[1]);
    return splitStatements(code).filter(s => {
        const t = s.lines[0].trim();
        if (!t || t.startsWith('#') || /^("""|''')/.test(t) || KEEPS_NOTHING_AWAY.test(t) || DOES_SOMETHING.test(t)) return false;
        if (/^[\w.]+(\[[^\]]*\])*(\s*,\s*[\w.]+)*\s*([-+*/%]|\/\/|\*\*)?=(?!=)/.test(t)) return false;    // making a variable
        return !own.some(name => t.startsWith(name + '('));                                         // their own function may print
    }).map(s => ({ line: s.from, text: s.lines.join('\n').trim() }));
}

function showIgnored(list) {
    const { line, text } = list[0];
    markTipLine(line);
    const short = text.length <= 40 && !text.includes('\n');
    if (/^\w+$/.test(text)) {
        print(`${C.magenta}💡 Line ${line}: ${text} on its own doesn't show anything.\n   To see what's inside it, use print(${text})${C.r}`);
    } else {
        print(`${C.magenta}💡 Line ${line}: ${short ? text : 'this line'} works out an answer... and then nothing happens to it,\n   so you can't see it. Only print() shows things in this panel.` +
            (short ? `\n   Either print the answer straight away:   print(${text})\n   or catch it in a variable, then print that:   answer = ${text}\n                                                  print(answer)` : '') + C.r);
    }
    if (list.length > 1) print(`${C.magenta}   (The same goes for line${list.length > 2 ? 's' : ''} ${list.slice(1).map(x => x.line).join(', ')}.)${C.r}`);
}

// Called after a run that didn't finish the objective
function noticeStuck(code, result, explained) {
    S.stuck++;
    S.errRepeat = result.error && result.error.type === S.lastErr ? S.errRepeat + 1 : result.error ? 1 : 0;
    S.lastErr = result.error?.type;
    if (result.ok && !explained && result.stdout === S.lastOut && code !== S.lastCode)
        print(`${C.magenta}💡 Your output is exactly the same as last time. Your new code ran, but it didn't\n   print anything new. Only print() puts things in this panel.${C.r}`);
    if (S.errRepeat === 3)
        print(`${C.magenta}💡 That's the same error three times in a row. Compare your line with the code in the\n   panel on the right, letter by letter, or press 💡 Need a hint?${C.r}`);
    if (S.stuck === 2) renderCasePanel();          // shows "type it for me"
    if (S.stuck === 3) coach('stuck');
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
    const near = err.type === 'NameError' && sameButCapitals(err.msg, code);
    if (near) print(`${C.magenta}   💡 Did you mean ${near}? Python cares about capital letters: to Python, ${err.msg.match(/'(\w+)'/)[1]} and ${near} are different words.${C.r}`);
    else if (help) print(`${C.magenta}   💡 ${help}${C.r}`);
    coach('error');
}

// "name 'Print' is not defined": a Python word or one of their names, with different capitals
function sameButCapitals(msg, code) {
    const name = msg.match(/name '(\w+)' is not defined/)?.[1];
    if (!name) return null;
    const known = ['print', 'len', 'str', 'int', 'float', 'range', 'open', 'sorted', 'list', 'dict', 'max', 'min', 'sum',
        'True', 'False', 'None', 'enumerate', 'ord', 'chr', 'format', 'bytes', ...(code.match(/[A-Za-z_]\w*/g) || [])];
    return known.find(w => w !== name && w.toLowerCase() === name.toLowerCase()) || null;
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
        // No auto-closing brackets or quotes: beginners should type every character themselves
        // (the ghost code shows the closing ones), and surprise extra quotes confused them
        autoCloseBrackets: false,
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
    editor.on('cursorActivity', updateGhost);
}

// =====================================================================
//  Type it yourself: a mission's typeIt code is shown as grey "ghost"
//  code in the editor for the student to type over. ⟨…⟩ marks a part they
//  can change (ghost shows the example; anything typed there is fine).
// =====================================================================
const parseTemplate = line => line.split(/(⟨[^⟩]*⟩)/).filter(Boolean).map(p => p.startsWith('⟨') ? { wild: p.slice(1, -1) } : { lit: p });
const plainCode = code => code.replace(/[⟨⟩]/g, '');

// Compare what's typed on a line with one template line. Spaces are optional, like in Python.
// Returns { state: 'done' | 'partial' | 'wrong', rest: the ghost still to type, at: where it went wrong }
function matchTemplate(typed, tokens) {
    let p = 0;
    // ci is how far into token ti they've got. In a changeable part, the example keeps showing
    // while what they've typed still matches it, e.g. "A" -> ghost "gent Sparrow"
    const restFrom = (ti, ci, wildTyped = '') => tokens.slice(ti).map((t, k) =>
        k ? (t.lit ?? t.wild) : t.lit != null ? t.lit.slice(ci)
            : t.wild.toLowerCase().startsWith(wildTyped.toLowerCase()) ? t.wild.slice(wildTyped.length) : '').join('');
    for (let ti = 0; ti < tokens.length; ti++) {
        const t = tokens[ti];
        if (t.lit != null) {
            for (let ci = 0; ci < t.lit.length; ci++) {
                const want = t.lit[ci];
                while (p < typed.length && typed[p] === ' ' && want !== ' ') p++;
                if (p >= typed.length) return { state: 'partial', rest: restFrom(ti, ci) };
                if (typed[p] === want) p++;
                else if (want !== ' ') return { state: 'wrong', at: p, rest: restFrom(ti, ci) };
            }
        } else {
            const stop = tokens[ti + 1]?.lit?.[0], start = p;
            while (p < typed.length && typed[p] !== stop) p++;
            if (p >= typed.length) return { state: 'partial', rest: restFrom(ti, 0, typed.slice(start)) };
            if (p === start) return { state: 'wrong', at: p, rest: restFrom(ti, 0) };
        }
    }
    const extra = typed.slice(p).trim();
    return extra && !extra.startsWith('#') ? { state: 'wrong', at: p, rest: '' } : { state: 'done', rest: '' };
}

// The anchor is a bookmark at the end of the last line of code that was there before. Everything
// after it is where they type: the first non-blank line there is template line 1, the next is line 2...
function startPractice(m, savedLine) {
    stopPractice();
    // Data the mission needs (like the note's scraps) goes in first, above where they type
    if (m.data && !editor.getValue().includes(m.data.split('\n')[0])) appendCode(m.data);
    let a = savedLine ?? editor.lastLine();
    if (a > editor.lastLine()) a = editor.lastLine();
    if (savedLine == null) while (a >= 0 && !editor.getLine(a).trim()) a--;
    if (editor.getLine(editor.lastLine()).trim()) editor.replaceRange('\n', CodeMirror.Pos(editor.lastLine()));
    S.practice = { id: m.id, lines: m.typeIt.split('\n').map(parseTemplate), plain: plainCode(m.typeIt).split('\n'),
        anchor: a >= 0 ? editor.setBookmark(CodeMirror.Pos(a, editor.getLine(a).length)) : null, marks: [], typed: false };
    editor.setCursor(editor.lastLine(), 0);
    updateGhost();
}

function stopPractice() {
    if (!S?.practice) return;
    S.practice.marks.forEach(x => x.clear());
    S.practice.anchor?.clear();
    S.practice = null;
}

// Add code to the end without moving on to anything else
function appendCode(code) {
    const cur = editor.getValue();
    const sep = !cur.trim() ? '' : cur.endsWith('\n\n') ? '' : cur.endsWith('\n') ? '\n' : '\n\n';
    if (!cur.trim()) editor.setValue(code + '\n');
    else editor.replaceRange(sep + code + '\n', CodeMirror.Pos(editor.lastLine()));
}

// Match the lines they've typed with the template. Returns
//   start: the first line of the typing area
//   rows:  [{ line, k, r }]: editor line, template line it's matched with, and matchTemplate's result
function practiceLayout() {
    const P = S.practice, last = editor.lastLine(), cursor = editor.getCursor().line;
    const blank = d => !editor.getLine(d).trim();
    let start = (P.anchor?.find()?.line ?? -1) + 1;
    while (start > 0 && blank(start - 1)) start--;      // the line before was emptied: the area grows upwards
    // An empty line only counts if the cursor's on it, ready to type, with nothing typed below it
    const lines = [];
    for (let d = start; d <= last; d++)
        if (!blank(d) || (d === cursor && [...Array(last - d)].every((_, i) => blank(d + 1 + i)))) lines.push(d);
    const rows = [];
    for (let i = 0, k = 0; i < lines.length && k < P.lines.length; i++) {
        const d = lines[i], text = editor.getLine(d), r = matchTemplate(text, P.lines[k]);
        const next = lines[i + 1] != null && matchTemplate(editor.getLine(lines[i + 1]), P.lines[k]).state;
        // A wrong line followed by a better try at the same line (a retype, or lines in the wrong order)
        if (r.state === 'wrong' && (next === 'done' || next === 'partial')) { rows.push({ line: d, k: null, r }); continue; }
        // Two lines joined into one (Delete or Backspace at the end of a line): it stands for both
        if (r.state === 'wrong' && r.at > 0 && k + 1 < P.lines.length
            && matchTemplate(text.slice(0, r.at), P.lines[k]).state === 'done'
            && matchTemplate(text.slice(r.at), P.lines[k + 1]).state !== 'wrong') {
            rows.push({ line: d, k, r: { state: 'joined', at: r.at } }, { line: d, k: k + 1, r: { state: 'joined-2' } });
            k += 2;
            continue;
        }
        // Enter pressed in the middle of a line: the next line is the rest of this one
        const after = lines[i + 1] != null ? editor.getLine(lines[i + 1]).trim() : '';
        if (r.state === 'partial' && after && d !== cursor && matchTemplate(text + after, P.lines[k]).state !== 'wrong') {
            rows.push({ line: d, k, r: { state: 'split' }, end: lines[i + 1] }, { line: lines[i + 1], k: null, split: true });
            i++; k++;
            continue;
        }
        rows.push({ line: d, k, r });
        k++;
    }
    return { start, rows: rows.filter(x => x.k != null), extra: rows.filter(x => x.k == null) };
}

// Would the line be right if capital letters didn't matter?
function onlyCapitals(text, tokens) {
    const lower = tokens.map(t => t.lit != null ? { lit: t.lit.toLowerCase() } : t);
    return matchTemplate(text.toLowerCase(), lower).state !== 'wrong';
}

// The end of the mistake in a line: the rest of that word, or at least one character
function mistakeEnd(text, at) {
    const m = text.slice(at).match(/^\w+/);
    return Math.min(text.length, at + Math.max(1, m ? m[0].length : 1));
}

function ghostBlock(lines, cls, label) {
    const el = document.createElement('div');
    el.className = cls;
    el.innerHTML = (label ? `<div class="ghost-label">${label}</div>` : '') + `<pre>${lines.map(escapeHtml).join('\n')}</pre>`;
    return el;
}

function ghostInline(line, ch, text) {
    const span = document.createElement('span');
    span.className = 'cm-ghost';
    span.textContent = text;
    return editor.setBookmark(CodeMirror.Pos(line, ch), { widget: span, insertLeft: true });
}

function updateGhost() {
    const P = S?.practice;
    if (!P) return;
    P.marks.forEach(x => x.clear());
    P.marks = [];
    const { start, rows, extra } = practiceLayout();
    const left = P.plain.slice(rows.length);
    for (const x of extra) {
        const text = editor.getLine(x.line);
        P.marks.push(editor.markText(CodeMirror.Pos(x.line, 0), CodeMirror.Pos(x.line, text.length), { className: 'cm-ghost-wrong' }));
        const el = document.createElement('div');
        el.className = 'ghost-wrong';
        el.innerHTML = `<div class="ghost-label">${x.split
            ? '✖ This is the end of the line above! Click at the start of this line and press Backspace to join them.'
            : '✖ This line isn\'t the next one to type. Delete it, or move it to the right place.'}</div>`;
        P.marks.push(editor.addLineWidget(x.line, el));
    }
    if (!left.length && !extra.length && rows.every(x => x.r.state === 'done')) {
        if (!P.typed) { P.typed = true; $('#run-hint').classList.add('show'); toast('✔ You typed it all! Now press ▶ Run'); }
        return;
    }
    P.typed = false;
    for (const { line, k, r } of rows) {
        const text = editor.getLine(line);
        if (r.state === 'partial') P.marks.push(ghostInline(line, text.length, r.rest));
        else if (r.state === 'joined') {
            P.marks.push(editor.markText(CodeMirror.Pos(line, r.at), CodeMirror.Pos(line, text.length), { className: 'cm-ghost-wrong' }));
            P.marks.push(editor.addLineWidget(line, ghostBlock([], 'ghost-wrong', '✖ Two lines have joined together! Click just before the red bit and press Enter to split them.')));
        } else if (r.state === 'wrong') {
            if (r.at < text.length) P.marks.push(editor.markText(CodeMirror.Pos(line, r.at), CodeMirror.Pos(line, mistakeEnd(text, r.at)), { className: 'cm-ghost-wrong' }));
            let from = r.at;
            while (from > 0 && /\w/.test(text[from - 1])) from--;           // the whole word, e.g. codeName
            const typo = text.slice(from, mistakeEnd(text, r.at)).match(/\w+/)?.[0] ?? '';
            const right = P.plain[k].match(/\w+/g)?.find(w => w !== typo && w.toLowerCase() === typo.toLowerCase());
            P.marks.push(editor.addLineWidget(line, ghostBlock([P.plain[k]], 'ghost-wrong', onlyCapitals(text, P.lines[k])
                ? `✖ Watch the capital letters! To Python, ${right ? `${typo} and ${right}` : 'Print and print'} are different words. It should be:`
                : '✖ Not quite. Check the red bit. It should be:')));
        }
    }
    // Lines they haven't started yet: under the last one they've typed, on an empty line, or at the end
    if (left.length) {
        const lastTyped = Math.max(-1, ...rows.map(x => x.end ?? x.line), ...extra.map(x => x.line));
        const empty = [...Array(editor.lastLine() - start + 1)].map((_, i) => start + i)
            .find(d => !editor.getLine(d).trim() && d > lastTyped);
        if (lastTyped >= 0 && (empty == null || empty > lastTyped + 1)) {
            P.marks.push(editor.addLineWidget(lastTyped, ghostBlock(left, 'ghost-lines')));
        } else if (empty != null) {
            P.marks.push(ghostInline(empty, 0, left[0]));
            if (left.length > 1) P.marks.push(editor.addLineWidget(empty, ghostBlock(left.slice(1), 'ghost-lines')));
        } else {
            P.marks.push(editor.addLineWidget(editor.lastLine(), ghostBlock(left, 'ghost-lines', '↵ Press Enter for a new line, then type:')));
        }
    }
    coach('ghost');
}

// The "Really stuck?" button: type the rest for them, from the first line that isn't right yet
function typeForMe() {
    const P = S?.practice;
    if (!P) return;
    // Lines in the wrong place go first (bottom up, so the line numbers above don't move)
    for (const x of practiceLayout().extra.reverse()) editor.replaceRange('', CodeMirror.Pos(x.line, 0), CodeMirror.Pos(x.line + 1, 0));
    const { start, rows } = practiceLayout();
    const bad = rows.find(x => x.r.state !== 'done');
    const k = bad ? bad.k : rows.length;
    const from = bad ? bad.line : rows.length ? rows[rows.length - 1].line + 1 : start;
    const rest = P.plain.slice(k).join('\n') + '\n';
    if (from > editor.lastLine()) editor.replaceRange('\n' + rest, CodeMirror.Pos(editor.lastLine()));
    else editor.replaceRange(rest, CodeMirror.Pos(from, 0), CodeMirror.Pos(editor.lastLine()));
    editor.focus();
    editor.setCursor(editor.lastLine(), 0);
    updateGhost();
}

// One line at a time is coloured to show an error (red) or a tip (purple)
let errorLine = null;
function markErrorLine(n, cls = 'cm-error-line') {
    clearErrorLine();
    errorLine = { handle: editor.addLineClass(n - 1, 'background', cls), cls };
}
const markTipLine = n => markErrorLine(n, 'cm-tip-line');
function clearErrorLine() {
    if (errorLine) editor.removeLineClass(errorLine.handle, 'background', errorLine.cls);
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
    S.stuck = S.errRepeat = 0;
    if (S.practice?.id === m.id) stopPractice();
    if (!m.final) {
        // An objective with evidence finishes once its answers are recorded (see saveEvidence)
        const needsEvidence = evidenceNeeded(m).length > 0;
        let msg = `\n${C.green}${C.b}★ ${needsEvidence ? 'YOUR CODE WORKED' : 'OBJECTIVE COMPLETE'}: ${m.title}${C.r}`;
        if (m.clue) msg += `\n${C.green}  ↳ ${m.clue}${C.r}`;
        if (needsEvidence) {
            msg += `\n${C.green}  📝 Type what you found into the Objectives panel → to unlock the next objective${C.r}`;
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
        // A main answer shows a "Correct!" card first; its button moves on (and closes the case
        // once every main answer is in). Late bonus answers still add XP.
        if (S.solved) recordResult(bonusCount());
        else if (!f.bonus) { S.celebrate = id; confetti(30); }
    } else {
        S.evTip[id] = '💡 ' + (f.tips?.[v] || f.tip);
        S.evWrong = id;
    }
    saveCaseState();
    renderCasePanel();
    renderBonus();
    return res;
}

const bonusCount = () => S.c.evidence.filter(x => x.bonus && S.evOk.has(x.id)).length;

// The button on the "Correct!" card
function continueOn() {
    S.celebrate = null;
    if (!S.solved && S.c.evidence.every(x => x.bonus || S.evOk.has(x.id))) solve(bonusCount());
    renderCasePanel(true);
    const input = $('#mission [data-ev-input]');
    if (input) input.focus(); else editor.focus();
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
    if (S.celebrate) {
        const f = S.c.evidence.find(x => x.id === S.celebrate);
        const closing = !S.solved && S.c.evidence.every(x => x.bonus || S.evOk.has(x.id));
        $('#mission').innerHTML = `<div class="card mission celebrate">
            <div class="tick">✔</div>
            <h2>Correct! Well done, Detective!</h2>
            <p>${cleanLabel(f)}</p>
            <p class="answer">${escapeHtml(S.evAns[f.id])}</p>
            <p class="small">🗂 It's on your Evidence Board now.</p>
            <button class="primary" data-continue>${closing ? '🎉 Close the case!' : cur && pendingEvidence(cur).length ? 'Next question →' : 'Next objective →'}</button>
        </div>`;
    } else if (!cur) {
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
            ${cur.data && cur.typeIt ? `<div class="try"><span class="small">📋 We've added this to the bottom of your code for you:</span>
                ${snippetHtml(cur.data, { click: false, open: false })}</div>`
            : cur.data ? `<div class="try"><span class="small">📋 You'll need this. Click it to add it to your code:</span>
                ${snippetHtml(cur.data)}</div>` : ''}
            ${cur.typeIt ? `<div class="try"><div class="type-label">✍️ TYPE THIS INTO THE EDITOR</div>
                ${snippetHtml(plainCode(cur.typeIt), { click: false, open: true })}
                <p class="small">The grey <b>ghost code</b> in the editor shows you what to type. Typing it yourself is the best way to remember it!</p>
                ${S.stuck >= 2 || lvl >= cur.hints.length ? '<button class="link-btn" data-type-for-me>😵 Really stuck? Type it in for me</button>' : ''}</div>` : ''}
            ${cur.tools?.length ? `<div class="row"><span class="small">📖 Click to read about:</span>${cur.tools.map(t =>
                `<button class="chip" data-ref="${escapeHtml(t)}" title="Click to read about ${escapeHtml(t)} in the output panel">📖 ${escapeHtml(t)}</button>`).join('')}</div>` : ''}
            ${lvl ? `<ul class="hints">${cur.hints.slice(0, lvl).map(h => `<li>💡 ${h}</li>`).join('')}</ul>` : ''}
            ${showTry && !cur.typeIt && cur.try?.length ? `<div class="try"><span class="small">💡 Here's some code that does it. Click it to add it to your code, read what each line does, then press <kbd>▶ Run</kbd>:</span>
                ${cur.try.map(c => snippetHtml(c)).join('')}</div>` : ''}
            ${lvl < cur.hints.length ? `<button class="hint-btn" data-hint>💡 ${lvl ? 'Another hint' : 'Need a hint?'} <span>(${cur.hints.length - lvl} left${hintCostText()})</span></button>` : ''}
        </div>`;
        });
    }

    const found = S.c.evidence.filter(f => S.evOk.has(f.id));
    $('#found').innerHTML = found.length ? `<div class="found"><b>🗂 Evidence Board</b><ul>${found.map(f =>
        `<li>${f.bonus ? '⭐ ' : ''}${cleanLabel(f)} <span>${escapeHtml(S.evAns[f.id])}</span></li>`).join('')}</ul></div>` : '';

    highlightCode($('#mission'));
    highlightCode($('#learned'));
    S.evWrong = null;

    // Something new in the objective panel (next objective, evidence, "Correct!"): start it at the top
    const panelKey = `${cur?.id}:${S.celebrate}:${cur ? pendingEvidence(cur).length > 0 : ''}`;
    if (S.panelKey !== panelKey) { S.panelKey = panelKey; $('.tab-body').scrollTop = 0; }
    // Moved on to a new objective: flash it, and the first few times point it out
    if (cur && !S.celebrate && S.panelMission !== cur.id) {
        if (S.panelMission) {
            $('#mission .mission')?.classList.add('fresh');
            if (!S.solved) coach('next');
        }
        S.panelMission = cur.id;
    }

    // Ghost code while the current objective is waiting to be typed
    const typing = !S.celebrate && cur?.typeIt && !S.done.has(cur.id);
    if (typing && S.practice?.id !== cur.id) {
        startPractice(cur, S.resume?.id === cur.id ? S.resume.line : null);
        saveCaseState();
    } else if (!typing) stopPractice();
    S.resume = null;

    // First-time tips for things that have just appeared
    if ($('#mission .ev-ask')) coach('evidence');
    if ($('#mission .snip-code')) coach('click');

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
    return `<div class="ev-q${S.evTip[f.id] ? ' tried' : ''}${S.evWrong === f.id ? ' wrong' : ''}">
        <label for="${where}-${f.id}">${f.bonus ? '⭐ BONUS: ' : ''}${cleanLabel(f)}</label>
        <span class="ev-q-row">
            <input id="${where}-${f.id}" data-ev-input="${f.id}" placeholder="${escapeHtml(f.ph || '')}" autocomplete="off" spellcheck="false">
            <button class="tb-btn run" data-ev-save="${f.id}">✔ Check</button>
            ${canSkip ? `<button class="tb-btn" data-ev-skip="${f.id}" title="Bonus questions are optional">Skip</button>` : ''}
        </span>
        ${S.evTip[f.id] ? `<div class="ev-no">✖ Not quite. Have another look.</div><div class="ev-tip">${escapeHtml(S.evTip[f.id])}</div>` : ''}
    </div>`;
}

function evidenceAskHtml(cur, fields) {
    return `<div class="ev-ask">
        <div class="eyebrow">📝 RECORD YOUR EVIDENCE</div>
        <p>${cur.final ? 'Answer these to close the case.' : '✅ Your code worked! Look at the <b>Output panel</b> to find the answer, type it in the box, then press <b>✔ Check</b>.'}</p>
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
    if (res === 'ok' && panel.dataset.panel === 'bonus') toast('⭐ Correct! Bonus XP earned');
    if (res === 'ok' && S.celebrate) $('#mission [data-continue]')?.focus();
    else if (res !== 'empty') panel.querySelector('[data-ev-input]')?.focus();
}

function showTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== name; });
    $('.tab-body').scrollTop = 0;
}

function renderCheats() {
    $('#cheats').innerHTML = '<p class="small" style="margin-top:0">Every Python command used in the cases. Click a 📖 name to read more about it in the output panel, or click a glowing example to add it to your code.</p>' +
        Object.entries(PYREF).map(([name, r]) =>
        `<div class="cheat"><button class="chip ref" data-ref="${escapeHtml(name)}" title="Read about ${escapeHtml(name)}">📖 ${escapeHtml(name)}</button><span class="small">${r.desc}</span>
         ${snippetHtml(r.ex, { open: false })}</div>`
    ).join('');
    highlightCode($('#cheats'));
}

// Colour some Python exactly like the editor does. Returns one HTML string per line
function highlightLines(code) {
    const lines = code.split('\n').map(() => '');
    if (!window.CodeMirror?.runMode) return code.split('\n').map(escapeHtml);
    CodeMirror.runMode(code, 'python', (text, style, line) => {
        if (line == null) return;            // the line break between lines
        const html = escapeHtml(text);
        lines[line] += style ? `<span class="${style.split(' ').map(s => 'cm-' + s).join(' ')}">${html}</span>` : html;
    });
    return lines;
}

// Give every <code> inside el the editor's colours, so "text in quotes" is the same yellow everywhere
function highlightCode(el) {
    el.querySelectorAll('code:not(.hl)').forEach(c => {
        c.innerHTML = highlightLines(c.textContent).join('\n');
        c.classList.add('hl', 'cm-s-detective');
    });
}

// A glowing, clickable piece of code with a numbered "What does each line do?" underneath.
// Explanations are open to start with on easy cases.
function snippetHtml(code, { open = S?.c.difficulty === 'easy', click = true } = {}) {
    const lines = highlightLines(code);
    const steps = explainSnippet(code, S?.c.explain);
    const numbered = steps.length > 1 || code.includes('\n');
    const pre = `<pre>${lines.map((l, i) => `${numbered ? `<span class="snip-ln">${i + 1}</span>` : ''}${l}`).join('\n')}</pre>`;
    return `<div class="snippet">
        ${click ? `<button class="snip-code cm-s-detective" data-code="${escapeHtml(code)}" title="Click to add this code to the end of yours">
            <span class="snip-add">＋ Add to my code</span>${pre}
        </button>` : `<div class="snip-code static cm-s-detective">${pre}</div>`}
        <details class="snip-explain"${open ? ' open' : ''}>
            <summary>🔍 What does ${numbered ? 'each line' : 'this'} do?</summary>
            <ol>${steps.map(s => `<li>${numbered ? `<span class="snip-ln">${s.from === s.to ? s.from : `${s.from}–${s.to}`}</span>` : ''}<span>${s.html || 'Try running it and see what happens!'}</span></li>`).join('')}</ol>
        </details>
    </div>`;
}

// Flash a snippet when it's been added, so it's obvious something happened
function snippetAdded(btn) {
    btn.classList.add('added');
    btn.querySelector('.snip-add').textContent = '✔ Added to your code!';
    setTimeout(() => {
        btn.classList.remove('added');
        btn.querySelector('.snip-add').textContent = '＋ Add to my code';
    }, 1600);
}

function printRef(name) {
    const r = PYREF[name];
    if (!r) return;
    print(`\n${C.b}${C.green}📖 ${name}: ${r.desc}${C.r}\n${C.green}${r.man}${C.r}\n`);
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
            ${x.code ? snippetHtml(x.code) : ''}</div>`).join('');
    });
    highlightCode($('#bonus'));
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

function confetti(pieces = 90) {
    const colours = ['#39ff88', '#4fd1ff', '#ffc94d', '#ff5c7a', '#b48cff'];
    for (let i = 0; i < pieces; i++) {
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
//  The tour, and first-time tips
//  The tour is a few steps the first time a case opens. Tips (TIPS) show
//  once each, the first time something new appears. Each step lights up
//  the first of its targets that's showing (a selector or a function).
// =====================================================================
const TOUR = [
    { target: ['.editor-window'], title: '📝 The code editor',
      body: '<p>This is where you write <b>code</b>: instructions for the computer, in a language called <b>Python</b>.</p>' },
    { target: ['#run-btn'], title: '▶ The Run button',
      body: '<p>Python only follows your code when you press <b>Run</b>.</p>' },
    { target: ['.console-window'], title: '🖥 The Output panel',
      body: '<p>When your code <b>prints</b> something, it shows up here.</p>' },
    { target: ['aside'], title: '🎯 Your mission',
      body: '<p>This tells you what to do next. <b>Start here!</b></p>' }
];

// times: how many times a tip is shown (once if not given)
const TIPS = {
    next: { target: ['#mission .mission'], title: '🎯 New objective!', times: 3,
      body: '<p>✔ You finished that objective! This panel now shows your <b>next one</b>.</p><p>Read it to find out what to do next.</p>' },
    ghost: { target: [() => $('.cm-ghost')?.closest('.CodeMirror-line'), () => $('.ghost-lines'), '.editor-window'], title: '👻 Ghost code',
      body: '<p>The <b>grey code</b> in the editor shows you what to type.</p><p>Type it in yourself, letter by letter. It turns into real code as you go!</p>' },
    click: { target: ['#mission .snip-code:not(.static)'], title: '✨ Glowing code',
      body: '<p>Code that <b>glows</b> can be clicked. Clicking adds it to the end of your code.</p>' },
    evidence: { target: ['#mission .ev-ask'], title: '📝 You found a clue!',
      body: '<p>Look at the <b>Output panel</b> to find the answer. Type it in this box, then press <b>✔ Check</b>.</p>' },
    error: { target: ['.console-window'], title: '🟥 An error!',
      body: '<p>Red means Python got stuck. It tells you <b>which line</b>, and the <b>purple tip</b> says how to fix it.</p><p>Don\'t worry: every coder gets errors!</p>' },
    stuck: { target: ['#mission [data-hint]', '#mission [data-type-for-me]', '#mission'], title: '💡 Need a hand?',
      body: '<p>Press here for a hint. Each press gives you a bit more help.</p>' }
};

let tour = null;               // { steps, at, tip } while the tour or a tip is showing
const tipQueue = [];

function startTour() {
    if (!S) return;
    closeBriefing();
    showTab('mission');
    tour = { steps: TOUR, at: 0 };
    $('#tour').hidden = false;
    showTourStep();
}

// Show a tip the first time its moment comes (after the tour and any open window)
const tipDone = id => (progress.seen?.[id] || 0) >= (TIPS[id].times || 1);     // seen counts showings (true = once)

function coach(id) {
    if (!S || tipDone(id) || tipQueue.includes(id)) return;
    tipQueue.push(id);
    setTimeout(nextTip, 400);
}

function nextTip() {
    if (tour || !S || !tipQueue.length) return;
    if (!progress.toured || $('#briefing').classList.contains('show') || $('#modal').classList.contains('show')) return;
    const id = tipQueue.shift();
    if (tipDone(id)) return nextTip();
    const step = TIPS[id];
    if (!findTarget(step)) return nextTip();       // the moment's passed
    tour = { steps: [step], at: 0, tip: id };
    $('#tour').hidden = false;
    showTourStep();
}

function endTour() {
    $('#tour').hidden = true;
    if (tour?.tip) progress.seen = { ...progress.seen, [tour.tip]: (+progress.seen?.[tour.tip] || 0) + 1 };
    else progress.toured = true;
    tour = null;
    saveProgress(progress);
    editor?.focus();
    setTimeout(nextTip, 300);
}

const findTarget = step => (step.target || []).map(t => typeof t === 'function' ? t() : $(t)).find(el => el && el.offsetParent);

function showTourStep() {
    const step = tour.steps[tour.at], last = tour.at === tour.steps.length - 1;
    const target = findTarget(step);
    $('#tour-step').textContent = tour.tip ? '✨ NEW!' : `${tour.at + 1} OF ${tour.steps.length}`;
    $('#tour-title').textContent = step.title;
    $('#tour-body').innerHTML = step.body;
    highlightCode($('#tour-body'));
    $('#tour-back').hidden = tour.at === 0;
    $('#tour-skip').hidden = !!tour.tip;
    $('#tour-next').textContent = tour.tip ? 'Got it! 👍' : last ? '🔍 Let\'s go!' : 'Next →';
    target?.scrollIntoView({ block: 'nearest' });
    placeTour(target);
    $('#tour-next').focus();
}

// Put the spotlight on the target and the card next to it, wherever there's room
function placeTour(target) {
    const spot = $('#tour-spot'), card = $('#tour-card');
    const vw = innerWidth, vh = innerHeight, gap = 14;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
    spot.classList.toggle('none', !target);
    if (!target) {
        Object.assign(spot.style, { left: vw / 2 + 'px', top: vh / 2 + 'px', width: '0px', height: '0px' });
        Object.assign(card.style, { left: (vw - cw) / 2 + 'px', top: (vh - ch) / 2 + 'px' });
        return;
    }
    const r = target.getBoundingClientRect(), pad = 6;
    Object.assign(spot.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
    const spots = [
        [r.bottom + gap + ch < vh, () => [clamp(r.left, gap, vw - cw - gap), r.bottom + gap]],
        [r.top - gap - ch > 0, () => [clamp(r.left, gap, vw - cw - gap), r.top - gap - ch]],
        [r.left - gap - cw > 0, () => [r.left - gap - cw, clamp(r.top, gap, vh - ch - gap)]],
        [r.right + gap + cw < vw, () => [r.right + gap, clamp(r.top, gap, vh - ch - gap)]],
        [true, () => [clamp(r.left + (r.width - cw) / 2, gap, vw - cw - gap), clamp(r.bottom - ch - gap * 2, gap, vh - ch - gap)]]
    ];
    const [left, top] = spots.find(([fits]) => fits)[1]();
    Object.assign(card.style, { left: left + 'px', top: top + 'px' });
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
    if (tour) endTour();
    stopPractice();
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
    stopPractice();
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
        S.resume = saved.practice;
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
        `${C.green}  This is the OUTPUT panel. When you press ▶ Run, anything your`,
        `  code prints appears down here in white.`,
        ``,
        `  Your objective (what to do next) is in the panel on the right →${C.r}`,
        `  ${C.magenta}Stuck? Press 💡 Need a hint? in that panel.${C.r}${hintNote}`,
        ...(S.done.size ? ['', `  ${C.green}Welcome back! ${S.done.size}/${c.missions.length} objectives already done. (↻ Restart to start again)${C.r}`] : []),
        ''
    ].join('\n'));
    setTimeout(() => { fit(); editor.refresh(); editor.focus(); }, 30);
    const fresh = !S.done.size && !S.solved;
    $('#briefing').classList.toggle('show', fresh);
    if (fresh) setTimeout(() => $('#briefing-go').focus(), 40);
    else if (!progress.toured) setTimeout(startTour, 60);
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
    if (code) { insertCode(code.dataset.code); snippetAdded(code); return; }
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
    if (e.target.closest('[data-continue]') && S) { continueOn(); return; }
    if (e.target.closest('[data-type-for-me]') && S) { typeForMe(); return; }
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
        stopPractice();
        editor.setValue(S.c.starter || '');
        saveDraft(S.c, editor.getValue());
        renderCasePanel();
    }
});
// The very first time, the tour follows the briefing
function briefingDone() {
    closeBriefing();
    if (!progress.toured) startTour();
    else setTimeout(nextTip, 300);
}
$('#briefing-go').addEventListener('click', briefingDone);
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.dataset?.evInput && S) saveEvidence(e.target);
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && tour) endTour();
    else if (e.key === 'Escape' && $('#briefing').classList.contains('show')) briefingDone();
});
$('#tour-btn').addEventListener('click', startTour);
$('#tour-skip').addEventListener('click', endTour);
$('#tour-back').addEventListener('click', () => { tour.at--; showTourStep(); });
$('#tour-next').addEventListener('click', () => {
    if (++tour.at < tour.steps.length) showTourStep();
    else endTour();
});
window.addEventListener('resize', () => { if (tour) showTourStep(); });
$('#modal-close').addEventListener('click', () => { $('#modal').classList.remove('show'); editor.focus(); setTimeout(nextTip, 300); });
$('#restart').addEventListener('click', () => {
    if (S && confirm('Start this case again from the beginning? Your code will go back to the starting code.')) {
        clearCaseState(S.c);
        clearDraft(S.c);
        openCase(S.c);
    }
});
$('#font-inc').addEventListener('click', () => setFontSize(Math.min(26, term.options.fontSize + 1)));
$('#font-dec').addEventListener('click', () => setFontSize(Math.max(10, term.options.fontSize - 1)));
$('#teacher-toggle').addEventListener('click', () => { progress.teacher = !progress.teacher; saveProgress(progress); renderBoard(); });
$('#reset-progress').addEventListener('click', () => {
    if (confirm('Forget all solved cases, XP and code, and start again from the beginning?')) {
        progress = { solved: {}, teacher: progress.teacher };
        saveProgress(progress);
        CASES.forEach(c => { clearCaseState(c); clearDraft(c); });
        renderBoard();
    }
});
window.addEventListener('hashchange', route);

// Start Python straight away so it's warmed up by the time a case opens
pyStart();

// Wait briefly for the web font so the console measures characters correctly
Promise.race([document.fonts.load("14px 'JetBrains Mono'"), sleep(1500)]).finally(route);
