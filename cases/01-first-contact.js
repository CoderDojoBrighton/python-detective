// CASE 1 (EASY): First Contact
// print(), variables, joining strings, len() and .count(). No files yet.
(() => {
const HOME = '/home/detective';
const SCRAP1 = 'Catch me if you can, Detective! ';
const SCRAP2 = 'My next prize is waiting by the ';
const SCRAP3 = 'Bandstand. Caw caw! - The Magpie';
const MESSAGE = SCRAP1 + SCRAP2 + SCRAP3;
const LENGTH = MESSAGE.length;
const E_COUNT = MESSAGE.split('e').length - 1;
const SCRAPS = `scrap1 = "${SCRAP1}"\nscrap2 = "${SCRAP2}"\nscrap3 = "${SCRAP3}"`;

CASES.push({
    id: 'first-contact',
    title: 'First Contact',
    icon: '🐍',
    difficulty: 'easy',
    xp: 100,
    hintCost: 0,
    summary: 'The Golden Deckchair has been stolen from Brighton Pier, and the thief left a torn-up note. Learn to print, use variables and join strings to read it.',
    skills: ['print()', 'variables', 'strings', 'len()'],
    home: HOME,
    intro: [
        '\x1b[1mWelcome to the \x1b[93mBrighton Byte Bureau\x1b[0m\x1b[1m, Detective.\x1b[0m',
        'Last night someone stole the \x1b[93mGolden Deckchair\x1b[0m trophy from Brighton Pier.',
        'All they left behind was a torn note signed \x1b[96mThe Magpie\x1b[0m.',
        '',
        'Detectives here solve cases with \x1b[92mPython\x1b[0m. Let\'s get you started!'
    ],
    starter: [
        '# Welcome to Python Detective!',
        '# This is your code editor. Lines starting with # are comments:',
        '# notes for humans. Python skips them.',
        '#',
        '# The line below is an instruction. print() means "show this".',
        '# Press the green Run button (or Ctrl+Enter) to run it.',
        '',
        'print("Detective reporting for duty!")',
        ''
    ].join('\n'),
    files: {},

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'print("I am the best detective in Brighton!")': 'Shows the words between the quotes in the Output panel. Use your own words! The quotes don\'t get shown: they just tell Python where the text starts and ends.',
        'codename = "Agent Sparrow"': 'Makes a <b>variable</b> (a labelled box) called <code>codename</code> and puts the text <code>"Agent Sparrow"</code> inside it. Put your own codename between the quotes!',
        'print(codename)': 'Shows what\'s inside the <code>codename</code> box. There are no quotes around <code>codename</code>, so Python looks inside the box instead of printing the word "codename".',
        'message = scrap1 + scrap2 + scrap3': 'Makes a new variable called <code>message</code>. The <code>+</code> signs glue the three scraps together, in order, into one long piece of text.',
        'print(message)': 'Shows what\'s inside <code>message</code>: the whole note, taped back together.',
        'length = len(message)': 'Gives <code>message</code> to the <code>len()</code> function, which counts its characters and hands back the answer. <code>length =</code> catches that answer in a new variable called <code>length</code>. Nothing is shown yet!',
        'print(length)': 'Shows what\'s inside the <code>length</code> box: the number of characters.',
        'print(len(message))': '<code>len(message)</code> counts the characters in <code>message</code>, then <code>print()</code> shows the answer straight away, without a variable in between.'
    },

    // typeIt is code the student types over grey "ghost" code in the editor; ⟨…⟩ is a part they can change
    missions: [
        {
            id: 'hello', title: 'Run your first program',
            story: 'A <b>program</b> is a list of instructions for a computer. Detectives at the Bureau write their programs in a language called <b>Python</b>.<br><br>The code editor already has a tiny program in it. The grey lines starting with <b>#</b> are notes for humans. The last line is the instruction: <code>print("Detective reporting for duty!")</code>',
            task: 'Press the green <kbd>▶ Run</kbd> button above the editor, and watch the Output panel underneath it.',
            hints: ['The green <b>▶ Run</b> button is at the top right of the editor.'],
            learn: 'Python only follows your code when you press <b>▶ Run</b>. It reads your code from the top line to the bottom.',
            done: e => ran(e) && e.stdout.trim() !== ''
        },
        {
            id: 'print', title: 'Your own message',
            story: 'You just ran your first program! <code>print()</code> is an instruction that means <b>"show this on the screen"</b>. Python works silently, so <code>print()</code> is how you get it to show you something.<br><br>The text inside the quotes is called a <b>string</b>. The quotes tell Python where the text starts and ends, so they don\'t get shown.',
            task: 'Type the line below at the bottom of your code, but put <b>your own words</b> between the quotes. Then press <kbd>▶ Run</kbd>.',
            tools: ['print'],
            hints: [
                'Click on the empty line at the bottom of the editor, then start typing <code>print("</code>',
                'Make sure your line ends with <code>")</code>: a closing quote, then a closing bracket.'
            ],
            typeIt: 'print("⟨I am the best detective in Brighton!⟩")',
            learn: '<code>print()</code> shows whatever is inside its brackets in the Output panel. Text inside quotes is called a <b>string</b>.',
            done: e => ran(e) && e.stdout.split('\n').some(l => l.trim() && l.trim() !== 'Detective reporting for duty!')
        },
        {
            id: 'variable', title: 'Pick a codename',
            story: 'Inspector Ada needs a codename for your case file. Python can remember things for you, in <b>variables</b>.<br><br>A variable is like a box with a label on it. You put something in the box, and later you use the label to get it back out. Here <code>=</code> means "put this in the box", not "equals" like in maths.<br><br><b>You choose the label!</b> <code>codename</code>, <code>my_name</code>, even <code>pizza</code> would all work. Pick a name that says what\'s inside, and use <code>_</code> instead of spaces.',
            task: 'Type the two lines below at the bottom of your code, with <b>your own codename</b> in the quotes. Then press <kbd>▶ Run</kbd>.<br><br>Spot that there are no quotes around <code>codename</code> in the print line. <code>print("codename")</code> would print the word codename. <code>print(codename)</code> prints what\'s <b>inside</b> the box.',
            tools: ['variables'],
            hints: [
                'The first line makes the box: <code>codename = "</code>, your codename, then <code>"</code>',
                'The second line shows what\'s in the box: <code>print(codename)</code> with no quotes.'
            ],
            typeIt: 'codename = "⟨Agent Sparrow⟩"\nprint(codename)',
            learn: 'A <b>variable</b> is a labelled box for a value. <code>codename = "Agent Sparrow"</code> puts a string into it, and <code>print(codename)</code> shows what\'s inside.',
            done: e => uses(e, /\bcodename\s*=/, /print\s*\([^)]*\bcodename\b/) && e.stdout.trim() !== ''
        },
        {
            id: 'join', title: 'Tape the note back together',
            story: `Byte, the Bureau's robot dog 🐕, found the Magpie's note torn into three scraps of paper. We've added the scraps to the bottom of your code, each in its own variable: <code>scrap1</code>, <code>scrap2</code> and <code>scrap3</code>.<br><br>To read the note, glue the scraps back together. In Python, <code>+</code> joins pieces of text: <code>"Brigh" + "ton"</code> makes <code>"Brighton"</code>. We'll keep the joined-up note in a new variable called <code>message</code>.`,
            task: 'Type the two lines below at the bottom of your code, then press <kbd>▶ Run</kbd>. What does the Magpie say?',
            tools: ['strings', 'variables'],
            hints: [
                'The first line glues the scraps together and puts the result in a box called <code>message</code>.',
                'The second line, <code>print(message)</code>, shows what\'s in the box.'
            ],
            data: SCRAPS,
            typeIt: 'message = scrap1 + scrap2 + scrap3\nprint(message)',
            learn: '<code>+</code> joins strings together: <code>"Brigh" + "ton"</code> makes <code>"Brighton"</code>. The spaces inside the quotes count too!',
            clue: 'The Magpie says where the next prize is. Add the place to the Evidence Board →',
            evidence: ['place'],
            done: e => printed(e, MESSAGE)
        },
        {
            id: 'length', title: 'Measure the message',
            story: 'Inspector Ada wants to know how many characters (letters, spaces and punctuation) are in the message. Counting by hand would take ages! Python has a <b>function</b> called <code>len()</code> that counts for you. <code>len</code> is short for <b>length</b>.<br><br>A <b>function</b> is like a little machine with a name. You put something in its brackets, it does a job, and it <b>hands you back an answer</b>. You\'ve already used one: <code>print()</code> is a function whose job is to show things.<br><br><code>len(message)</code> counts the characters in <code>message</code> and hands back the answer... but it <b>doesn\'t show it</b>! Only <code>print()</code> shows things. So catch the answer in a variable, then print the variable.',
            task: 'Type the two lines below at the bottom of your code, then press <kbd>▶ Run</kbd>.<br><br>Keep the lines above them! Every time you press Run, Python starts again from the top, so it needs those lines to make <code>message</code>.',
            tools: ['len'],
            hints: [
                '<code>len(message)</code> on its own counts the characters... then throws the answer away. The <code>length =</code> part catches it.',
                'Then <code>print(length)</code> shows what\'s inside the <code>length</code> box.'
            ],
            typeIt: 'length = len(message)\nprint(length)',
            learn: 'A <b>function</b> is a little machine: something goes in its brackets, and an answer comes out. <code>len()</code> hands back a number but doesn\'t show it, so you catch it in a variable (<code>length = len(message)</code>) and then <code>print()</code> it.',
            clue: 'Add the length to the Evidence Board →',
            evidence: ['length'],
            done: e => uses(e, /len\s*\(/) && printed(e, String(LENGTH))
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'You\'ve read the Magpie\'s note. Time to tell Inspector Ada what you found!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['Where does the note say the next prize is? And what number did <code>print(length)</code> show?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'place', label: '1. Where is the Magpie\'s next prize?', ph: 'a place in Brighton',
          check: v => v.includes('bandstand'),
          tip: 'Print the whole message (scrap1 + scrap2 + scrap3) and read the end of it.' },
        { id: 'length', label: '2. How many characters are in the whole message?', ph: 'a number',
          check: v => v === String(LENGTH),
          tip: 'length = len(message), then print(length). Make sure message is ALL three scraps joined.',
          tips: { [String(SCRAP1.length + SCRAP2.length)]: 'That\'s only two of the scraps. Join all three!' } },
        { id: 'es', label: 'How many times does the letter "e" (lower case) appear in the message?', bonus: true, ph: 'a number',
          check: v => v === String(E_COUNT),
          tip: 'Strings can count things for you: message.count("e")' }
    ],

    bonus: [
        { title: 'Count letters.', text: 'Strings have a <code>.count()</code> method. How many lower-case "e"s are in the message? That\'s a bonus answer!', code: 'print(message.count("e"))' },
        { title: 'SHOUT IT.', text: 'Try <code>message.upper()</code> and <code>message.lower()</code>.', code: 'print(message.upper())' },
        { title: 'Repeat yourself.', text: 'What happens if you multiply a string? Try <code>"Caw! " * 10</code>.', code: 'print("Caw! " * 10)' }
    ]
});
})();
