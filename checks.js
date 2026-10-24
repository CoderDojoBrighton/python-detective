// =====================================================================
//  Python Detective: helpers for mission checks in cases/*.js
//
//  Every time the student presses Run, each mission's done(e) is called
//  with these events (in this order):
//    {type:'open',  path, mode}    a file was opened (absolute path)
//    {type:'list',  path}          a folder was looked inside (listdir, walk, glob...)
//    {type:'write', path, text}    a file was written; text is what it holds now
//    {type:'run',   code, stdout, ok, error}   the run itself (error: {type, msg, line})
// =====================================================================

// The student's code with # comments removed, so hints in comments don't count
const codeOf = e => (e.code || '').split('\n').map(l => l.replace(/#[^'"]*$/, '')).join('\n');

// Ran without an error
const ran = e => e.type === 'run' && e.ok;

// Ran OK and printed every piece of text given (ignoring capitals)
const printed = (e, ...texts) => ran(e) && texts.every(t => e.stdout.toLowerCase().includes(String(t).toLowerCase()));

// Ran OK and the code matches every pattern given
const uses = (e, ...patterns) => ran(e) && patterns.every(re => re.test(codeOf(e)));

// A file whose path ends with the given text was opened / written
const opened = (e, end) => e.type === 'open' && e.path.endsWith(end);
const wrote = (e, end) => e.type === 'write' && e.path.endsWith(end);

// The student looked inside this exact folder
const listed = (e, path) => e.type === 'list' && e.path === path;
