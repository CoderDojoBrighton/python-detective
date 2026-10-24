// CASE 7 (MEDIUM): Backwards Day
// String slicing ([::-1], [::2]), first letters with a loop and join(), isupper().
(() => {
const HOME = '/home/detective';
const DIR = `${HOME}/messages`;

const PLAIN1 = 'Jackdaw here. The boat is ready and the tide is high. Meet me by the old ticket booth on the West Pier at midnight. ' +
    'Bring the Golden Deckchair and all the shiny spoons. Watch out for that detective and their robot dog!';
const MSG1 = [...PLAIN1].reverse().join('');

const PLAIN2 = 'the password is hidden in my poem. read the first letter of every line and keep it safe. do not write it down anywhere!';
const JUNK = 'zqxjkvwy';
const MSG2 = [...PLAIN2].map((ch, i) => ch + JUNK[i % JUNK.length]).join('');

const PASSWORD = 'SANDCASTLE';
const POEM = [
    'Seagulls circle round the pier,',
    '  All the shiny things are near.',
    'Never tell the Bureau where',
    'Deckchairs glint in salty air.',
    '    Count the waves and count the tide,',
    'All my treasures safe inside:',
    'Silver spoons and golden chairs,',
    '  Tucked away from prying stares.',
    'Leave no clue for them to find,',
    'Even Byte will fall behind!'
];

// Hide the boat's name as the only capital letters in an otherwise lower-case note
const BOAT = 'KIPPER';
const BASE3 = 'dear magpie, the weather looks perfect for a quiet trip across the water tonight. pack something warm, ' +
    'the sea breeze gets very chilly after dark. remember to keep the lights off when we leave the pier, and please stop ' +
    'humming that silly tune. the seagulls are watching us. see you soon, your friend the jackdaw.';
const chars3 = [...BASE3];
let at = 0;
for (const letter of BOAT.toLowerCase()) {
    at = chars3.indexOf(letter, at + 25);
    chars3[at] = letter.toUpperCase();
}
const MSG3 = chars3.join('');

CASES.push({
    id: 'backwards-day',
    title: 'Backwards Day',
    icon: '🔄',
    difficulty: 'medium',
    xp: 250,
    hintCost: 0.05,
    requires: 'lost-and-found',
    summary: 'The Magpie\'s accomplice, the Jackdaw, writes in tricky codes: backwards, with junk letters, and hidden in poems. Slice and dice the strings to read them.',
    skills: ['[::-1]', 'slicing', 'join()', 'isupper()'],
    home: HOME,
    intro: [
        '\x1b[1mThe Byte Bureau intercepted four messages from the \x1b[93mJackdaw\x1b[0m\x1b[1m!\x1b[0m',
        'They\'re in your \x1b[96mmessages\x1b[0m folder, but they look like gobbledygook.',
        'The Magpie\'s plan said "our messages will be written backwards"...'
    ],
    starter: [
        '# Case 7: Backwards Day',
        'import os',
        'print(os.listdir("messages"))',
        '',
        'with open("messages/msg1.txt") as f:',
        '    text = f.read().strip()',
        'print(text)',
        ''
    ].join('\n'),
    files: {
        [`${HOME}/case_file.txt`]: [
            '==================== CASE FILE #0049 ====================',
            ' TO:      Detective',
            ' FROM:    Inspector Ada, Brighton Byte Bureau',
            ' SUBJECT: The Jackdaw\'s messages',
            '',
            ' We caught four messages flying between the Magpie',
            ' and their accomplice, the Jackdaw. They are in your',
            ' messages folder:',
            '',
            '   msg1.txt   looks backwards?',
            '   msg2.txt   full of junk letters',
            '   poem.txt   a poem... a suspicious poem',
            '   msg3.txt   a friendly note with odd CAPITALS',
            '',
            ' Find out WHEN they are meeting, the PASSWORD,',
            ' and (if you can) the name of the getaway boat.',
            '',
            ' - Ada',
            '=========================================================='
        ].join('\n'),
        [`${DIR}/msg1.txt`]: MSG1 + '\n',
        [`${DIR}/msg2.txt`]: MSG2 + '\n',
        [`${DIR}/poem.txt`]: POEM.join('\n') + '\n',
        [`${DIR}/msg3.txt`]: MSG3 + '\n'
    },

    missions: [
        {
            id: 'reverse', title: 'Read it backwards', tutorial: true,
            story: '<code>msg1.txt</code> starts with "!god tobor"... It\'s written <b>backwards</b>! You could try reading it in a mirror, or you could ask Python to flip it round in one go.',
            task: 'Read <code>messages/msg1.txt</code> and print it the right way round.',
            tools: ['slicing', 'strip'],
            hints: [
                'A slice has three parts: <code>[start:stop:step]</code>. A step of <code>-1</code> walks backwards.',
                '<code>text[::-1]</code> is the whole of <code>text</code>, backwards.'
            ],
            try: ['with open("messages/msg1.txt") as f:\n    text = f.read().strip()\nprint(text[::-1])'],
            learn: '<code>text[::-1]</code> reverses a string. Leaving start and stop empty means "all of it", and step <code>-1</code> means "go backwards".',
            clue: 'Now you know when they\'re meeting. Add it to the Evidence Board →',
            evidence: ['when'],
            done: e => uses(e, /::\s*-\s*1/) && printed(e, PLAIN1)
        },
        {
            id: 'every-other', title: 'Ditch the junk letters',
            story: 'Byte sniffed <code>msg2.txt</code> and sneezed. 🐕 It\'s full of junk! Look closely: the <b>real</b> letters are the 1st, 3rd, 5th, 7th... and a junk letter sits after each one.',
            task: 'Print only every <b>second</b> character of <code>msg2.txt</code>, starting with the first one.',
            tools: ['slicing'],
            hints: [
                'In <code>[start:stop:step]</code>, the step is how far to jump each time.',
                '<code>text[::2]</code> takes characters 0, 2, 4, 6...'
            ],
            try: ['with open("messages/msg2.txt") as f:\n    text = f.read().strip()\nprint(text[::2])'],
            learn: '<code>text[::2]</code> takes every 2nd character. <code>text[1::2]</code> would start from the second one instead.',
            done: e => uses(e, /:\s*2\s*\]/) && printed(e, PLAIN2)
        },
        {
            id: 'acrostic', title: 'The suspicious poem',
            story: 'The message said: <i>the password is hidden in my poem. Read the first letter of every line.</i> Careful: some lines start with spaces!',
            task: 'Loop over the lines of <code>poem.txt</code>, collect the first letter of each line, and print them joined together as one word.',
            tools: ['for', 'strip', 'join'],
            hints: [
                '<code>line.strip()</code> removes the spaces at the start, so <code>line.strip()[0]</code> is the first real letter.',
                'Start with an empty list <code>letters = []</code> and <code>letters.append(...)</code> each first letter.',
                '<code>"".join(letters)</code> glues a list of letters into one word.'
            ],
            try: ['letters = []\nwith open("messages/poem.txt") as f:\n    for line in f:\n        letters.append(line.strip()[0])\nprint("".join(letters))'],
            learn: '<code>"".join(letters)</code> joins a list of strings with nothing in between. <code>" ".join(...)</code> would put a space between each one.',
            clue: 'That word is the password! Add it to the Evidence Board →',
            evidence: ['password'],
            done: e => uses(e, /join|\+=|\+\s*line/) && printed(e, PASSWORD)
        },
        {
            id: 'capitals', title: 'Shouting letters',
            story: '<code>msg3.txt</code> looks like a friendly note... but a few letters in the middle of words are CAPITALS. That\'s no typo. They spell out a secret!',
            task: 'Go through <code>msg3.txt</code> letter by letter, keep only the capital letters, and print them as one word.',
            tools: ['for', 'if', 'join'],
            hints: [
                '<code>for ch in text:</code> loops over every character of a string.',
                '<code>ch.isupper()</code> is True when <code>ch</code> is a capital letter.',
                'Collect them in a list and <code>"".join()</code> it, or add them to a string with <code>+=</code>.'
            ],
            try: ['with open("messages/msg3.txt") as f:\n    text = f.read()\n\nsecret = ""\nfor ch in text:\n    if ch.isupper():\n        secret += ch\nprint(secret)'],
            learn: '<code>.isupper()</code> checks for capital letters (and <code>.islower()</code> for small ones). Looping over a string gives you one character at a time.',
            clue: 'That\'s the name of the getaway boat. Bonus evidence! →',
            evidence: ['boat'],
            done: e => uses(e, /isupper/) && printed(e, BOAT)
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'You\'ve cracked the Jackdaw\'s codes. Inspector Ada needs to know what they say!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['When does the backwards message say they meet? And what word did the first letters of the poem spell?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'when', label: '1. What time are the Magpie and the Jackdaw meeting?', ph: 'a time',
          check: v => v.includes('midnight') || /^(12|00)[:.]?00( ?am)?$/.test(v),
          tip: 'Print msg1.txt backwards with text[::-1] and look for a time.' },
        { id: 'password', label: '2. What is the password hidden in the poem?', ph: 'one word',
          check: v => v === PASSWORD.toLowerCase(),
          tip: 'Take the first letter of every line of poem.txt. Use line.strip() first because some lines start with spaces.',
          tips: { [POEM.map(l => l[0]).join('').toLowerCase()]: 'Some of those are spaces! Use line.strip()[0] to skip them.' } },
        { id: 'boat', label: 'What is the name of the getaway boat?', bonus: true, ph: 'a boat name',
          check: v => v === BOAT.toLowerCase(),
          tip: 'Keep only the characters in msg3.txt where ch.isupper() is True.' }
    ],

    bonus: [
        { title: 'The boat.', text: 'Find the getaway boat\'s name hidden in the capitals of msg3.txt. That\'s a bonus answer!' },
        { title: 'Write backwards.', text: 'Write your own backwards message to a friend.', code: 'secret = "meet me at the climbing wall"\nprint(secret[::-1])' },
        { title: 'Palindromes.', text: 'A palindrome reads the same both ways. Is "racecar" one? Python can check: <code>word == word[::-1]</code>', code: 'for word in ["racecar", "pier", "level", "kayak", "magpie"]:\n    print(word, word == word[::-1])' }
    ]
});
})();
