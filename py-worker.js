// =====================================================================
//  Python Detective: the Python runner
//  Pyodide (real CPython compiled to WebAssembly) runs inside a Web Worker,
//  so a never-ending loop can't freeze the page: the engine just throws the
//  worker away and starts a fresh one.
//
//  The worker is built from a Blob (see makePyWorker) so the game still works
//  when index.html is opened straight from disk. The pd* functions are also
//  used by tests/run-cases.mjs to check every case against Node's Pyodide.
// =====================================================================

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

// Runs once when Python starts. Everything is prefixed _pd so it can't clash
// with a student's own names (each run gets its own fresh globals anyway).
const PY_PRELUDE = String.raw`
import builtins, gc, io, json, os, shutil, sys, traceback

_pd_events = []
_pd_written = set()
_pd_listed = set()
_pd_roots = set()
_pd_home = '/home/detective'
_PD_SYSTEM = {'/', '/bin', '/dev', '/etc', '/lib', '/proc', '/sys', '/tmp', '/usr'}
_PD_MAX_OUT = 60000

def _pd_abs(p):
    return os.path.abspath(os.fsdecode(p))

# Notice which files the student opens and which folders they look inside,
# so missions can tick off "you opened the diary" or "you listed the laptop".
_pd_real_open = io.open
def _pd_open(file, mode='r', *args, **kwargs):
    f = _pd_real_open(file, mode, *args, **kwargs)
    if isinstance(file, (str, bytes, os.PathLike)):
        p = _pd_abs(file)
        _pd_events.append({'type': 'open', 'path': p, 'mode': mode})
        if any(ch in mode for ch in 'wax+'):
            _pd_written.add(p)
    return f
builtins.open = io.open = _pd_open

def _pd_note_list(path):
    if isinstance(path, (str, bytes, os.PathLike)):
        p = _pd_abs(path)
        if p not in _pd_listed:
            _pd_listed.add(p)
            _pd_events.append({'type': 'list', 'path': p})

_pd_real_listdir, _pd_real_scandir = os.listdir, os.scandir
def _pd_listdir(path='.'):
    _pd_note_list(path)
    return _pd_real_listdir(path)
def _pd_scandir(path='.'):
    _pd_note_list(path)
    return _pd_real_scandir(path)
os.listdir, os.scandir = _pd_listdir, _pd_scandir   # os.walk and glob use these too

def _pd_input(prompt=''):
    raise RuntimeError('input() is switched off in Python Detective. '
                       'Put the value straight into a variable instead, e.g. name = "Ada"')
builtins.input = _pd_input

class _PdTee:
    """Sends print() output to the console and keeps a copy for the missions."""
    def __init__(self, real):
        self.real, self.parts, self.size, self.cut = real, [], 0, False
    def write(self, s):
        s = str(s)
        if self.size < _PD_MAX_OUT * 3:
            self.parts.append(s)
        self.size += len(s)
        if self.size <= _PD_MAX_OUT:
            self.real.write(s)
        elif not self.cut:
            self.cut = True
            self.real.write('\n... (that is a LOT of output, so the rest is hidden)\n')
        return len(s)
    def flush(self):
        self.real.flush()
    def text(self):
        return ''.join(self.parts)

def _pd_load_case(data):
    global _pd_home
    d = json.loads(data)
    for r in sorted(_pd_roots):
        shutil.rmtree(r, ignore_errors=True)
    _pd_roots.clear()
    _pd_home = d['home']
    for p in [*d['files'], *d['dirs'], _pd_home]:
        root = '/' + p.strip('/').split('/')[0]
        if root not in _PD_SYSTEM:
            _pd_roots.add(root)
    os.makedirs(_pd_home, exist_ok=True)
    for p in d['dirs']:
        os.makedirs(p, exist_ok=True)
    for p, content in d['files'].items():
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with _pd_real_open(p, 'w', encoding='utf-8') as f:
            f.write(content)
    os.chdir(_pd_home)

def _pd_describe(e):
    line = None
    if isinstance(e, SyntaxError) and e.filename == 'detective.py':
        line = e.lineno
    mine = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == 'detective.py']
    if mine:
        line = mine[-1].lineno
    # The last line of a full traceback includes Python's "Did you mean ...?" suggestions
    msg = ''.join(traceback.format_exception(e)).rstrip().splitlines()[-1]
    return {'type': type(e).__name__, 'msg': msg, 'line': line}

def _pd_run(src):
    _pd_events.clear(); _pd_written.clear(); _pd_listed.clear()
    try:
        os.chdir(_pd_home)
    except OSError:
        pass
    if 'requests' in src:
        try:
            import pyodide_http
            pyodide_http.patch_all()
        except ImportError:
            pass
    real = sys.stdout
    out = sys.stdout = _PdTee(real)
    err = None
    ns = {'__name__': '__main__', '__builtins__': builtins}
    try:
        exec(compile(src, 'detective.py', 'exec'), ns)
    except SystemExit:
        pass
    except BaseException as e:
        err = _pd_describe(e)
    finally:
        sys.stdout = real
    ns.clear()     # closes any files the student forgot to close
    gc.collect()
    text = out.text()
    if text and not text.endswith('\n'):
        real.write('\n')
    real.flush()
    for p in sorted(_pd_written):
        try:
            with _pd_real_open(p, encoding='utf-8', errors='replace') as f:
                _pd_events.append({'type': 'write', 'path': p, 'text': f.read(20000)})
        except OSError:
            pass
    return json.dumps({'ok': err is None, 'error': err, 'stdout': text[:_PD_MAX_OUT * 3], 'events': _pd_events})
`;

function pdInit(pyodide) {
    pyodide.runPython(PY_PRELUDE);
}

function pdLoadCase(pyodide, c) {
    pyodide.globals.get('_pd_load_case')(JSON.stringify({ files: c.files, dirs: c.dirs || [], home: c.home }));
}

async function pdRun(pyodide, code, onStart) {
    try { await pyodide.loadPackagesFromImports(code); } catch { /* unknown modules fail later with a friendly error */ }
    onStart?.();
    return JSON.parse(pyodide.globals.get('_pd_run')(code));
}

// Messages in:  {t:'case', c:{files, dirs, home}}   {t:'run', id, code}
// Messages out: {t:'ready'}  {t:'out', s, err}  {t:'started', id}  {t:'done', id, result}  {t:'fatal', msg}
function pyWorkerMain() {
    let pyodide;
    const ready = (async () => {
        importScripts(PYODIDE_URL + 'pyodide.js');
        pyodide = await loadPyodide({
            indexURL: PYODIDE_URL,
            stdout: s => postMessage({ t: 'out', s }),
            stderr: s => postMessage({ t: 'out', s, err: true })
        });
        pdInit(pyodide);
        postMessage({ t: 'ready', version: pyodide.version });
    })();
    ready.catch(err => postMessage({ t: 'fatal', msg: String(err && err.message || err) }));

    self.onmessage = async ({ data: m }) => {
        await ready;
        try {
            if (m.t === 'case') pdLoadCase(pyodide, m.c);
            else if (m.t === 'run') {
                const result = await pdRun(pyodide, m.code, () => postMessage({ t: 'started', id: m.id }));
                postMessage({ t: 'done', id: m.id, result });
            }
        } catch (err) {
            postMessage({ t: 'fatal', id: m.id, msg: String(err && err.message || err) });
        }
    };
}

function makePyWorker() {
    const src = [
        `const PYODIDE_URL = ${JSON.stringify(PYODIDE_URL)};`,
        `const PY_PRELUDE = ${JSON.stringify(PY_PRELUDE)};`,
        String(pdInit), String(pdLoadCase), String(pdRun),
        `(${pyWorkerMain})();`
    ].join('\n');
    return new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
}
