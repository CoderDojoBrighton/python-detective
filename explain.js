// =====================================================================
//  Python Detective: the 📖 Python reference, and the "What does each
//  line do?" explanations under every clickable code snippet.
//
//  A snippet line is explained by the first of these that knows it:
//    1. the case's own  explain: { 'exact line': 'explanation' }
//    2. EXPLAIN below (lines that turn up in lots of cases)
//    3. the patterns in RULES (simple prints, variables, loops...)
//  tests/run-cases.mjs fails if any snippet line has no explanation.
// =====================================================================

const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const codeHtml = s => `<code>${escapeHtml(s)}</code>`;

// =====================================================================
//  Python reference (the 📖 Python tab and the mission tool chips)
// =====================================================================
const PYREF = {
    'print':      { desc: 'show something in the Output panel',  ex: 'print("Hello, detective!")',
                    man: 'Python does its work silently. print() is how you ask it to SHOW you something.\nWhatever is inside the brackets appears in the output panel.\n\n  print("hello")            text goes in quotes\n  print(42)                 numbers don\'t need quotes\n  print("Age:", 12)         commas print several things with spaces between\n  print("a", "b", sep="")   sep="" means no spaces' },
    'variables':  { desc: 'store a value in a labelled box',     ex: 'codename = "Agent Sparrow"\nprint(codename)',
                    man: 'A variable is a labelled box that holds a value, so you can use it later.\nYou choose the label (the name). Pick one that says what\'s inside.\n\n  name = "Ada"           put the text "Ada" in a box called name\n  age = 12               put the number 12 in a box called age\n  print(name)            no quotes: show what\'s IN the box -> Ada\n  print("name")          quotes: show the word itself -> name\n\n  Names can\'t have spaces: use_underscores_instead' },
    'strings':    { desc: 'text in quotes',                      ex: 'message = "part one " + "part two"',
                    man: 'A string is text inside quotes: "like this" or \'like this\'.\nThe quotes tell Python where the text starts and ends. They aren\'t printed.\n\n  "abc" + "def"          join strings  -> "abcdef"\n  "ha" * 3               repeat        -> "hahaha"\n  len("hello")           how long      -> 5\n  "hello".upper()        -> "HELLO"\n  "Bandstand".lower()    -> "bandstand"\n  "banana".count("a")    -> 3' },
    'f-strings':  { desc: 'put variables inside text',           ex: 'print(f"Agent {codename} reporting")',
                    man: 'An f-string has an f before the quotes. Anything in {curly brackets} is filled in.\n\n  name = "Ada"\n  print(f"Hello {name}!")         -> Hello Ada!\n  print(f"2 + 2 = {2 + 2}")       -> 2 + 2 = 4' },
    'len':        { desc: 'how long a string or list is',        ex: 'print(len(message))',
                    man: 'len() is a FUNCTION: a little machine with a name. Put something in its brackets,\nand it hands back an answer: how many things are in it. It doesn\'t SHOW the answer,\nso catch it in a variable and print that (or print it straight away).\n\n  length = len("hello")  catch the answer (5) in a box called length\n  print(length)          -> 5   (spaces count too!)\n  print(len([3, 1, 4]))  -> 3 items in a list' },
    'maths':      { desc: 'add, subtract, multiply, divide',     ex: 'print(3600 // 900)',
                    man: 'Python is a brilliant calculator.\n\n  7 + 3    -> 10        7 - 3    -> 4\n  7 * 3    -> 21        7 / 2    -> 3.5\n  7 // 2   -> 3   (whole-number divide)\n  7 % 2    -> 1   (the REMAINDER left over)\n  2 ** 3   -> 8   (power: 2 x 2 x 2)' },
    'int/str':    { desc: 'turn text into numbers and back',     ex: 'code = str(4) + str(2)',
                    man: 'Numbers and text are different types.\n\n  "4" + "2"        -> "42"   (joining text)\n  4 + 2            -> 6      (adding numbers)\n  str(4)           -> "4"    number to text\n  int("42")        -> 42     text to number\n\n  "Age: " + 12  is an ERROR. Use "Age: " + str(12)' },
    'if':         { desc: 'only do something when it\'s true',   ex: 'if code > 5000:\n    print("ALARM")\nelse:\n    print("SAFE")',
                    man: 'if runs the indented lines only when the test is True.\n\n  if score > 100:\n      print("High score!")\n  elif score > 50:\n      print("Not bad")\n  else:\n      print("Keep trying")\n\n  Tests:  ==  equal    !=  not equal    <  >  <=  >=\n  Don\'t forget the colon : and the 4 spaces!' },
    'lists':      { desc: 'a collection of things',              ex: 'suspects = ["Zara", "Ben", "Chloe"]',
                    man: 'A list holds lots of values, in order, in [square brackets].\n\n  names = ["Ada", "Ben", "Chloe"]\n  names[0]               -> "Ada"   (counting starts at 0!)\n  names[-1]              -> "Chloe" (the last one)\n  len(names)             -> 3\n  names.append("Dev")    add to the end\n  sorted(names)          a sorted copy' },
    'for':        { desc: 'repeat for each item',                ex: 'for name in names:\n    print(name)',
                    man: 'for repeats the indented lines once for each item.\n\n  for name in names:\n      print(name)\n\n  for i in range(5):      i = 0, 1, 2, 3, 4\n      print(i)\n\n  for letter in "abc":    works on strings too!\n      print(letter)' },
    'in':         { desc: 'is it in there?',                     ex: 'if "Ben" not in signed_out:\n    print("Ben is still inside")',
                    man: 'in checks whether something is inside a list or string.\n\n  "Ben" in ["Ada", "Ben"]       -> True\n  "Zoe" not in ["Ada", "Ben"]   -> True\n  "pier" in "west pier"         -> True' },
    'open':       { desc: 'open a file to read it',              ex: 'with open("case_file.txt") as file:\n    text = file.read()\nprint(text)',
                    man: 'open() opens a file. "with" closes it again for you.\n\n  with open("notes.txt") as file:\n      text = file.read()            the whole file as one string\n\n  with open("notes.txt") as file:\n      lines = file.readlines()      a list of lines\n\n  with open("notes.txt") as file:\n      for line in file:             one line at a time\n          print(line.strip())' },
    'write':      { desc: 'save text into a file',               ex: 'with open("report.txt", "w") as file:\n    file.write("Case closed!")',
                    man: 'Open a file with "w" to write to it (careful: it replaces what was there).\n\n  with open("report.txt", "w") as file:\n      file.write("line one\\n")\n      file.write("line two\\n")\n\n  "a" adds to the end instead of replacing.' },
    'enumerate':  { desc: 'count while you loop',                ex: 'for number, line in enumerate(lines, 1):\n    print(number, line)',
                    man: 'enumerate() gives you a counter AND the item.\n\n  for i, name in enumerate(["a", "b"], 1):\n      print(i, name)       -> 1 a   then   2 b' },
    'strip':      { desc: 'remove spaces and newlines at the ends', ex: 'line = line.strip()',
                    man: 'Lines read from a file end with an invisible newline "\\n".\n\n  "  hello\\n".strip()     -> "hello"' },
    'split':      { desc: 'chop a string into a list',           ex: 'words = line.split()',
                    man: 'split() chops text into a list.\n\n  "a b c".split()           -> ["a", "b", "c"]   (on spaces)\n  "1,2,3".split(",")        -> ["1", "2", "3"]\n  "KEY=value".split("=")    -> ["KEY", "value"]' },
    'startswith': { desc: 'does the text start (or end) with...', ex: 'if line.startswith("Day"):\n    print(line)',
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
                    man: 'def makes a reusable function.\n\n  def double(number):\n      return number * 2\n\n  print(double(21))    -> 42' },
    'base64':     { desc: 'decode base64, hex and binary',       ex: 'import base64\nprint(base64.b64decode("SGk=").decode())',
                    man: 'Ways computers write bytes as text:\n\n  import base64\n  base64.b64decode("SGk=").decode()       -> "Hi"\n  base64.b64encode(b"Hi").decode()        -> "SGk="\n\n  bytes.fromhex("4869").decode()          -> "Hi"\n  int("01001000", 2)                      -> 72  (then chr(72) -> "H")' },
    'hashlib':    { desc: 'make a fingerprint (hash) of text',   ex: 'import hashlib\nprint(hashlib.sha256(b"hello").hexdigest())',
                    man: 'A hash is a fingerprint of some data. The same text always gives\nthe same hash, but you can\'t turn a hash back into the text.\n\n  import hashlib\n  hashlib.sha256("hello".encode()).hexdigest()' },
    'xor':        { desc: 'flip bits with a secret key',         ex: 'print(chr(107 ^ 42))',
                    man: '^ is XOR. Doing it twice with the same key gets you back where you started:\n\n  65 ^ 42       -> 107\n  107 ^ 42      -> 65\n\n  secret = ""\n  for byte in bytes.fromhex("6b4f"):\n      secret += chr(byte ^ 42)' }
};

// =====================================================================
//  Explanations for lines that turn up in lots of snippets
// =====================================================================
const EXPLAIN = {
    'text = file.read()': 'Reads the <b>whole</b> file into one long string, and stores it in a variable called <code>text</code>.',
    'lines = file.readlines()': 'Reads the file as a <b>list of lines</b>, and stores it in a variable called <code>lines</code>. Each line is one item in the list.',
    'print(line.strip())': 'Shows the line, with <code>.strip()</code> removing the invisible "new line" character from its end (otherwise you\'d get blank lines in between).',
    'line = line.strip()': 'Removes spaces and the invisible "new line" character from both ends of <code>line</code>, and puts the tidy version back in <code>line</code>.',
    'counts = {}': 'Makes an empty <b>dictionary</b> called <code>counts</code>. A dictionary is like a list, but you look things up by name instead of by position.',
    'counts[name] = counts.get(name, 0) + 1': 'Adds 1 to the count for <code>name</code>. <code>counts.get(name, 0)</code> gets the count so far, or 0 if this is the first time.',
    'word = "".join(letters)': 'Glues every string in the list <code>letters</code> together, with nothing (<code>""</code>) in between.',
    'words = line.split()': 'Chops <code>line</code> into a list of words wherever there\'s a space.',
    'file.write("Case closed!")': 'Writes the text <code>"Case closed!"</code> into the file.',
    'print(ord("A"), chr(66))': 'Shows the number code for the letter A (<code>ord</code>), then the letter whose code is 66 (<code>chr</code>).',
    'return word.upper() + "!"': 'Sends back the word in CAPITALS with an <code>!</code> stuck on the end. That\'s the function\'s answer.',
    'print(base64.b64decode("SGk=").decode())': 'Decodes the base64 text <code>"SGk="</code> back into bytes, turns the bytes into normal text with <code>.decode()</code>, and shows it.',
    'print(hashlib.sha256(b"hello").hexdigest())': 'Makes the SHA-256 fingerprint (hash) of the word hello and shows it as hex digits.',
    'print(chr(107 ^ 42))': 'XORs the number 107 with the key 42 (giving 65), then shows the letter with that code.',
    'print(text[::-1])': 'Shows <code>text</code> backwards. <code>[::-1]</code> means "every character, stepping backwards".',
    'print(os.listdir())': 'Lists the files and folders in the folder you\'re in, and shows them.',
    'code = str(4) + str(2)': 'Turns the numbers 4 and 2 into text with <code>str()</code>, then glues them together with <code>+</code>. So <code>code</code> holds the text <code>"42"</code>, not the number 6.',
    'for number, line in enumerate(lines, 1):': 'A <b>loop</b> over <code>lines</code>. <code>enumerate(..., 1)</code> counts as it goes, starting at 1, so each time round <code>number</code> is the count and <code>line</code> is the line.',
    'print(number, line)': 'Shows the count, then the line, with a space in between.',
    'for folder, subfolders, files in os.walk("/evidence"):': 'A <b>loop</b> that visits the folder <code>"/evidence"</code> and every folder inside it. Each time round, <code>folder</code> is where it is now, <code>subfolders</code> is a list of the folders inside it, and <code>files</code> is a list of the files.',
    'for name in files:': 'A <b>loop</b> inside the loop: goes through every file name in this folder, one at a time, calling each one <code>name</code>.',
    'print(os.path.join(folder, name))':'Sticks the folder and the file name together with a <code>/</code> to make the file\'s full path, and shows it.'
};

// =====================================================================
//  Patterns for simple lines. Each returns some HTML, or null if it
//  can't explain this exact line (the next rule is then tried).
// =====================================================================

// Split on commas that aren't inside brackets or quotes
function splitTop(s, sep) {
    const out = [];
    let depth = 0, quote = null, start = 0;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
        if (ch === '"' || ch === "'") quote = ch;
        else if ('([{'.includes(ch)) depth++;
        else if (')]}'.includes(ch)) depth--;
        else if (depth === 0 && s.startsWith(sep, i)) { out.push(s.slice(start, i).trim()); start = i + sep.length; i += sep.length - 1; }
    }
    out.push(s.slice(start).trim());
    return out;
}

const isStr = s => /^"[^"\\]*"$|^'[^'\\]*'$/.test(s);

// Describe a small Python expression in words, e.g. 'len(message)' -> 'how long message is'
function describe(x) {
    x = x.trim();
    let m;
    if (isStr(x)) return `the text ${codeHtml(x)}`;
    if (/^f"[^"]*"$/.test(x)) return `the text ${codeHtml(x.slice(1))}, with each <code>{curly bracket}</code> part swapped for what's in that variable`;
    if (/^-?\d+(\.\d+)?$/.test(x)) return `the number ${codeHtml(x)}`;
    if (/^\w+$/.test(x)) return `what's inside ${codeHtml(x)}`;
    if (/^[\d\s+\-*/%().]+$/.test(x) && /[+\-*/%]/.test(x)) return `the answer to ${codeHtml(x)}`;
    if ((m = x.match(/^len\((\w+)\)$/))) return `how long ${codeHtml(m[1])} is (<code>len()</code> counts its characters or items)`;
    if ((m = x.match(/^str\((.+)\)$/)) && describe(m[1])) return `${describe(m[1])}, turned into text`;
    if ((m = x.match(/^int\((.+)\)$/)) && describe(m[1])) return `${describe(m[1])}, turned into a whole number`;
    if ((m = x.match(/^(\w+)\.upper\(\)$/))) return `${codeHtml(m[1])} in CAPITAL LETTERS`;
    if ((m = x.match(/^(\w+)\.lower\(\)$/))) return `${codeHtml(m[1])} in small letters`;
    if ((m = x.match(/^(\w+)\.count\(("[^"]*")\)$/))) return `how many times ${codeHtml(m[2])} appears in ${codeHtml(m[1])}`;
    if ((m = x.match(/^sorted\((\w+)\)$/))) return `a copy of ${codeHtml(m[1])} sorted into order`;
    if ((m = x.match(/^(\w+)\[0\]$/))) return `the first item in ${codeHtml(m[1])} (Python counts from 0!)`;
    if ((m = x.match(/^(\w+)\[-1\]$/))) return `the last item in ${codeHtml(m[1])}`;
    if ((m = x.match(/^("[^"]*") \* (\d+)$/))) return `the text ${codeHtml(m[1])} repeated ${m[2]} times`;
    const terms = splitTop(x, ' + ');
    if (terms.length > 1 && terms.every(t => isStr(t) || /^\w+$/.test(t))) {
        const list = terms.map(codeHtml);
        const joined = list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
        return terms.every(isStr) ? `${joined} joined together into one string` : `${joined} added together with <code>+</code> (if they hold text, <code>+</code> joins them)`;
    }
    return null;
}

// Mention once per snippet that variable names are up to you
function nameNote(name, st) {
    if (st.named) return '';
    st.named = true;
    return ` (${codeHtml(name)} is just a name we picked. You could call it anything, but a name that says what's inside makes your code easier to read.)`;
}

const RULES = [
    [/^#/, () => 'A <b>comment</b>. Python ignores everything after a <code>#</code>. Comments are notes for humans.'],
    [/^import (\w+)$/, m => `Loads Python's ${codeHtml(m[1])} module (a toolkit of extra commands) so the lines below can use it.`],
    [/^print\((.*)\)$/, m => {
        const args = splitTop(m[1], ',').filter(a => !/^\w+=/.test(a));
        const parts = args.map(describe);
        if (!args[0] || parts.includes(null)) return null;
        const what = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ', then ' + parts[parts.length - 1];
        const spaces = parts.length > 1 ? ', with spaces in between' : '';
        const quoteNote = args.some(isStr) ? ' The quotes don\'t get shown: they just tell Python where the text starts and ends.' : '';
        return `Shows ${what} in the Output panel${spaces}.${quoteNote}`;
    }],
    [/^(\w+) = \[/, (m, st) => `Makes a <b>list</b> called ${codeHtml(m[1])}: lots of values inside <code>[square brackets]</code>, separated by commas. A list is like a variable that holds many things, in order.${nameNote(m[1], st)}`],
    [/^(\w+) = ""$/, (m, st) => `Makes a variable called ${codeHtml(m[1])} holding an <b>empty string</b>: text with nothing in it yet. Letters get added to it below.${nameNote(m[1], st)}`],
    [/^(\w+) = \1\.strip\(\)$/, m => `Removes spaces and the invisible "new line" character from both ends of ${codeHtml(m[1])}, and puts the tidy version back in ${codeHtml(m[1])}.`],
    [/^(\w+) = (\w+)\.read\(\)\.strip\(\)$/, m => `Reads the <b>whole</b> file into one string, removes the invisible "new line" from its end with <code>.strip()</code>, and stores it in ${codeHtml(m[1])}.`],
    [/^(\w+) = (\w+) \+ 1$/, m => m[1] === m[2] ? `Adds 1 to ${codeHtml(m[1])}: it works out ${codeHtml(m[1] + ' + 1')}, then puts the answer back in ${codeHtml(m[1])}.` : null],
    [/^(\w+) \+= 1$/, m => `Adds 1 to ${codeHtml(m[1])}. <code>+= 1</code> is a shortcut for ${codeHtml(`${m[1]} = ${m[1]} + 1`)}.`],
    [/^(\w+) = (.+)$/, (m, st) => {
        const what = describe(m[2]);
        return what && `Makes a <b>variable</b> (a labelled box) called ${codeHtml(m[1])} and puts ${what} in it.${nameNote(m[1], st)}`;
    }],
    [/^for (\w+) in (.+):$/, (m, st) => {
        const what = /^\w+$/.test(m[2]) ? codeHtml(m[2]) : describe(m[2]);
        return what && `A <b>loop</b>: repeats the indented lines below once for every item in ${what}. Each time round, the current item is put in ${codeHtml(m[1])}.${nameNote(m[1], st)}`;
    }],
    [/^if (\w+) not in (\w+):$/, m => `Checks whether ${codeHtml(m[1])} is <b>not</b> in ${codeHtml(m[2])}. The indented lines below only run if it isn't.`],
    [/^if (.+):$/, m => `Checks whether ${codeHtml(m[1])} is true. The indented lines below only run if it is.`],
    [/^elif (.+):$/, m => `If the test above was false, checks whether ${codeHtml(m[1])} is true instead.`],
    [/^else:$/, () => 'Otherwise (if the test above was false), the indented lines below run instead.'],
    [/^with open\(("[^"]+")\) as (\w+):$/, m => `Opens the file ${codeHtml(m[1])} so you can read it, and calls it ${codeHtml(m[2])} inside the indented lines below. <code>with</code> closes the file again afterwards.`],
    [/^with open\(("[^"]+"), "w"\) as (\w+):$/, m => `Opens the file ${codeHtml(m[1])} for <b>writing</b> (<code>"w"</code>), and calls it ${codeHtml(m[2])} inside the indented lines below. Careful: writing replaces anything already in the file.`],
    [/^(\w+) = (\w+)\.read\(\)$/, m => `Reads the <b>whole</b> file${m[2] === 'file' ? '' : ' ' + codeHtml(m[2])} into one long string, and stores it in a variable called ${codeHtml(m[1])}.`],
    [/^def (\w+)\((.*)\):$/, m => `Makes your own <b>function</b> called ${codeHtml(m[1])}${m[2] ? `. When you use it, you give it ${m[2].split(',').map(a => codeHtml(a.trim())).join(' and ')}` : ''}. The indented lines below are what it does.`],
    [/^return (.+)$/, m => `Sends ${describe(m[1]) || codeHtml(m[1])} back as the function's answer.`],
    [/^(\w+)\.append\((.+)\)$/, m => `Adds ${describe(m[2]) || codeHtml(m[2])} to the end of the list ${codeHtml(m[1])}.`]
];

// Split a snippet into statements. A list or call spread over several lines counts as one
function splitStatements(code) {
    const out = [];
    let cur = null, depth = 0;
    code.split('\n').forEach((line, i) => {
        if (!cur && !line.trim()) return;
        if (!cur) cur = { from: i + 1, to: i + 1, lines: [] };
        cur.lines.push(line);
        cur.to = i + 1;
        const bare = line.replace(/"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/g, '""').replace(/#.*/, '');
        for (const ch of bare) depth += '([{'.includes(ch) ? 1 : ')]}'.includes(ch) ? -1 : 0;
        if (depth <= 0) { out.push(cur); cur = null; depth = 0; }
    });
    if (cur) out.push(cur);
    return out;
}

const INDENT_NOTES = {
    for: 'It\'s indented, so it runs every time the loop goes round.',
    while: 'It\'s indented, so it runs every time the loop goes round.',
    if: 'It\'s indented, so it only runs when the <code>if</code> test is true.',
    elif: 'It\'s indented, so it only runs when that <code>elif</code> test is true.',
    else: 'It\'s indented, so it only runs when the <code>else</code> part is used.',
    with: 'It\'s indented, so it happens while the file is open.',
    def: 'It\'s indented, so it\'s part of the function.'
};

// Explain one line on its own; null if nothing knows it
function explainLine(line, extra, st = {}) {
    const key = line.trim();
    const known = extra?.[key] ?? EXPLAIN[key];
    if (known) return known;
    for (const [re, fn] of RULES) {
        const m = key.match(re);
        if (!m) continue;
        const html = fn(m, st);
        if (html) return html;
    }
    return null;
}

// Every statement in a snippet with its explanation: [{from, to, html}] (html is null when unexplained)
function explainSnippet(code, extra) {
    const st = {}, stmts = splitStatements(code);
    return stmts.map((s, i) => {
        let html = explainLine(s.lines[0], extra, st);
        const indent = s.lines[0].match(/^ */)[0].length;
        if (html && indent) {
            const parent = stmts.slice(0, i).reverse().find(p => p.lines[0].match(/^ */)[0].length < indent);
            const word = parent?.lines[0].trim().match(/^\w+/)?.[0];
            if (INDENT_NOTES[word]) html += ` <i class="indent-note">${INDENT_NOTES[word]}</i>`;
        }
        return { from: s.from, to: s.to, html };
    });
}
