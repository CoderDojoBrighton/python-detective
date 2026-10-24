// CASE 1 (EASY): First Contact
// print(), variables, joining strings, len() and .count(). No files yet.
(() => {
const HOME = '/home/detective';
const PART1 = 'Catch me if you can, Detective! ';
const PART2 = 'My next prize is waiting by the ';
const PART3 = 'Bandstand. Caw caw! - The Magpie';
const MESSAGE = PART1 + PART2 + PART3;
const LENGTH = MESSAGE.length;
const E_COUNT = MESSAGE.split('e').length - 1;
const SCRAPS = `part1 = "${PART1}"\npart2 = "${PART2}"\npart3 = "${PART3}"`;

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
        '# This is your code editor. Lines starting with # are comments: Python ignores them.',
        '# Press the green Run button (or Ctrl+Enter) to run your code.',
        '',
        'print("Detective reporting for duty!")',
        ''
    ].join('\n'),
    files: {},

    missions: [
        {
            id: 'hello', title: 'Run your first program', tutorial: true,
            story: 'Every detective needs a notebook. Yours is the <b>code editor</b> on the left. Python reads your code from top to bottom and does what it says.',
            task: 'Press <kbd>▶ Run</kbd> to run the code that\'s already there. Then change the words inside the quotes to your own message and run it again.',
            tools: ['print'],
            hints: [
                'The green <b>▶ Run</b> button is at the top right of the editor.',
                'Keep the quotes! <code>print("your message here")</code>'
            ],
            try: ['print("I am the best detective in Brighton!")'],
            learn: '<code>print()</code> shows things in the output panel. Text inside quotes is called a <b>string</b>.',
            done: e => ran(e) && /print\s*\(/.test(codeOf(e)) && e.stdout.trim() !== ''
        },
        {
            id: 'variable', title: 'Pick a codename', tutorial: true,
            story: 'Inspector Ada needs a codename for your case file. In Python you store things in <b>variables</b>: a variable is a box with a name on the label.',
            task: 'Make a variable called <code>codename</code> that holds your detective codename, then <code>print(codename)</code>. (No quotes around <code>codename</code> when you print it: you want what\'s inside the box!)',
            tools: ['variables', 'f-strings'],
            hints: [
                'Make the variable with <code>=</code>, e.g. <code>codename = "Agent Sparrow"</code>',
                'Then on the next line: <code>print(codename)</code>'
            ],
            try: ['codename = "Agent Sparrow"\nprint(codename)\nprint(f"Welcome to the Bureau, {codename}!")'],
            learn: '<code>codename = "Agent Sparrow"</code> puts a string into a variable. <code>print(codename)</code> prints what\'s inside it. An <b>f-string</b> like <code>f"Hi {codename}"</code> drops a variable into some text.',
            done: e => uses(e, /\bcodename\s*=/, /print\s*\([^)]*\bcodename\b/) && e.stdout.trim() !== ''
        },
        {
            id: 'join', title: 'Tape the note back together', tutorial: true,
            story: `Byte, the Bureau's robot dog 🐕, found the Magpie's note torn into three scraps. We've typed each scrap into a variable for you. In Python you can join strings with <code>+</code>.`,
            task: 'Add the three scraps to your code, join them into one variable called <code>message</code>, and print it. What does the Magpie say?',
            tools: ['strings', 'variables'],
            hints: [
                'Click the code below the hint button to add the scraps to your code.',
                '<code>message = part1 + part2 + part3</code> then <code>print(message)</code>'
            ],
            try: [`${SCRAPS}\n\nmessage = part1 + part2 + part3\nprint(message)`],
            learn: '<code>+</code> joins strings together: <code>"Brigh" + "ton"</code> makes <code>"Brighton"</code>. The spaces inside the quotes count too!',
            clue: 'The Magpie says where the next prize is. Add the place to the Evidence Board →',
            evidence: ['place'],
            done: e => printed(e, MESSAGE)
        },
        {
            id: 'length', title: 'Measure the message',
            story: 'Inspector Ada wants to know how long the message is, so the lab can match it to the Magpie\'s typewriter. Counting by hand would take ages (and spaces count too!). Python can do it instantly with <code>len()</code>.',
            task: 'Print the number of characters in <code>message</code>.',
            tools: ['len'],
            hints: [
                '<code>len(something)</code> tells you how long something is.',
                'Put it inside a print: <code>print(len(...))</code> with your variable in the middle.'
            ],
            try: ['print(len(message))'],
            learn: '<code>len()</code> counts the characters in a string, including spaces and punctuation.',
            clue: 'Add the length to the Evidence Board →',
            evidence: ['length'],
            done: e => uses(e, /len\s*\(/) && printed(e, String(LENGTH))
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'You\'ve read the Magpie\'s note. Time to tell Inspector Ada what you found!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['Where does the note say the next prize is? And what number did <code>len(message)</code> print?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'place', label: '1. Where is the Magpie\'s next prize?', ph: 'a place in Brighton',
          check: v => v.includes('bandstand'),
          tip: 'Print the whole message (part1 + part2 + part3) and read the end of it.' },
        { id: 'length', label: '2. How many characters are in the whole message?', ph: 'a number',
          check: v => v === String(LENGTH),
          tip: 'Use print(len(message)). Make sure message is ALL three parts joined.',
          tips: { [String(PART1.length + PART2.length)]: 'That\'s only two of the scraps. Join all three!' } },
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
