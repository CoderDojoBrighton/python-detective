// Checks every case against its teacher solution, using the same Python
// prelude (py-worker.js) and mission checks (checks.js) as the browser.
//
//   cd tests && npm install && npm test            all cases
//   node run-cases.mjs caesar -v                   cases whose file name matches, printing output
//
// A solution lives in tests/solutions/<case file name>.py:
//   # answer <evidence id>: <value>          the answer typed into the evidence board
//   # ---- run                                each block is one press of the Run button
//   # ---- run expect-error                   a run that is meant to fail
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadPyodide } from 'pyodide';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = process.argv.slice(2);
const verbose = args.includes('-v');
const filter = args.find(a => !a.startsWith('-'));

// Load the game's scripts in the same order as index.html
const ctx = vm.createContext({ console, CASES: [] });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let scripts = [...html.matchAll(/<script src="((?:checks|cases\/[^"]+|py-worker)\.js)"><\/script>/g)].map(m => m[1]);
const missing = scripts.filter(s => !fs.existsSync(path.join(root, s)));
missing.forEach(s => console.log(`✖ index.html loads ${s}, which doesn't exist`));
scripts = scripts.filter(s => !missing.includes(s));
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });
const caseFiles = scripts.filter(s => s.startsWith('cases/'));

const py = await loadPyodide({ stdout: s => verbose && console.log('    │ ' + s), stderr: s => verbose && console.log('    │ ' + s) });
vm.runInContext('pdInit', ctx)(py);
const pdLoadCase = vm.runInContext('pdLoadCase', ctx);
const pdRun = vm.runInContext('pdRun', ctx);

function parseSolution(text) {
    const answers = {}, runs = [];
    let cur = null;
    for (const line of text.split('\n')) {
        const a = line.match(/^# answer ([\w-]+):\s*(.*)$/);
        const r = line.match(/^# ---- run(.*)$/);
        if (a && !cur) answers[a[1]] = a[2].trim();
        else if (r) runs.push(cur = { code: '', expectError: r[1].includes('expect-error') });
        else if (cur) cur.code += line + '\n';
    }
    return { answers, runs };
}

let failures = missing.length;
const fail = msg => { failures++; console.log(`  ✖ ${msg}`); };

const CASES = vm.runInContext('CASES', ctx);
for (const [i, c] of CASES.entries()) {
    const file = caseFiles[i];
    if (filter && !file.includes(filter) && !c.id.includes(filter)) continue;
    console.log(`\n${file}  (${c.id})`);
    if (c.requires && !CASES.some(x => x.id === c.requires)) fail(`requires unknown case "${c.requires}"`);
    for (const m of c.missions) for (const id of m.evidence || [])
        if (!c.evidence.some(f => f.id === id)) fail(`mission "${m.id}" asks for unknown evidence "${id}"`);

    const solPath = path.join(here, 'solutions', path.basename(file, '.js') + '.py');
    if (!fs.existsSync(solPath)) { fail(`no solution at ${path.relative(root, solPath)}`); continue; }
    const sol = parseSolution(fs.readFileSync(solPath, 'utf8'));

    pdLoadCase(py, c);
    const done = new Set();
    let allOut = '';
    for (const [n, run] of sol.runs.entries()) {
        if (verbose) console.log(`  ── run ${n + 1}`);
        const res = await pdRun(py, run.code);
        allOut += res.stdout;
        if (res.error && !run.expectError) fail(`run ${n + 1} failed: ${res.error.type} on line ${res.error.line}: ${res.error.msg}`);
        if (!res.error && run.expectError) fail(`run ${n + 1} was meant to fail but didn't`);
        const events = [...res.events, { type: 'run', code: run.code, stdout: res.stdout, ok: res.ok, error: res.error }];
        for (const e of events) for (const m of c.missions) {
            if (!done.has(m.id) && !m.final && m.done(e)) {
                done.add(m.id);
                console.log(`  ★ run ${n + 1} completed: ${m.title}`);
            }
        }
    }
    for (const m of c.missions) if (!m.final && !done.has(m.id)) fail(`mission never completed: ${m.title}`);

    for (const f of c.evidence) {
        const v = sol.answers[f.id];
        if (v == null) { if (!f.bonus) fail(`no answer given for evidence "${f.id}"`); continue; }
        if (!f.check(v.trim().toLowerCase())) fail(`evidence "${f.id}" rejected the answer "${v}"`);
        else if (!allOut.toLowerCase().includes(v.toLowerCase())) fail(`evidence "${f.id}": "${v}" is never printed by the solution`);
        else console.log(`  ✔ evidence ${f.id}: ${v}`);
    }
    for (const id of Object.keys(sol.answers)) if (!c.evidence.some(f => f.id === id)) fail(`answer for unknown evidence "${id}"`);
}

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll cases OK ✔');
process.exit(failures ? 1 : 0);
