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
        'with open("messages/msg1.txt") as file:',
        '    message = file.read().strip()',
        'print(message)',
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

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'message = file.read().strip()': 'Reads the whole file into one string, <code>.strip()</code> trims the invisible "new line" character off the end, and the result goes into a variable called <code>message</code>.',
        'print(message[::-1])': 'Shows <code>message</code> backwards. <code>[::-1]</code> is a slice: empty start and stop mean "all of it", and the step <code>-1</code> means "walk backwards".',
        'print(message[::2])': 'Shows every 2nd character of <code>message</code>: characters 0, 2, 4 and so on. <code>[::2]</code> means "all of it, jumping 2 each time", which skips the junk letters.',
        'first_letters = []': 'Makes an empty <b>list</b> called <code>first_letters</code>. The empty <code>[]</code> means there\'s nothing in it yet: the loop will fill it up.',
        'for line in file:': 'A <b>loop</b> over the open file. Each time round, <code>line</code> holds the next line of the poem.',
        'first_letters.append(line.strip()[0])': '<code>line.strip()</code> removes the spaces at the start (and the new line at the end). <code>[0]</code> takes the first character of what\'s left, and <code>.append()</code> adds it to the end of the list.',
        'print("".join(first_letters))': 'Glues all the letters in <code>first_letters</code> into one word, with nothing (<code>""</code>) between them, and shows it.',
        'message = file.read()': 'Reads the whole file into one long string, and stores it in a variable called <code>message</code>. No <code>.strip()</code> this time: the new line at the end isn\'t a capital, so the loop will skip it anyway.',
        'capitals = ""': 'Makes a variable called <code>capitals</code> that holds empty text, <code>""</code>. The loop will add each capital letter it finds to the end.',
        'for letter in message:': 'A <b>loop</b> over a string: it goes through <code>message</code> one character at a time, putting each one in <code>letter</code>. Spaces and commas count as characters too.',
        'if letter.isupper():': 'Checks whether <code>letter</code> is a capital letter. <code>.isupper()</code> is True for capitals and False for everything else, including spaces.',
        'capitals += letter': 'Sticks <code>letter</code> on the end of <code>capitals</code>. <code>+=</code> is a shortcut for <code>capitals = capitals + letter</code>.',
        'print(capitals)': 'Shows all the capital letters that were found. It\'s not indented, so it runs once, after the loop has finished.',
        'print(my_message[::-1])': 'Shows <code>my_message</code> backwards, using the <code>[::-1]</code> slice. Change the words in the quotes to write your own!',
        'for word in ["racecar", "pier", "level", "kayak", "magpie"]:': 'A <b>loop</b> over a list of words, written straight into the line. Each time round, the next word is put in <code>word</code>.',
        'print(word, word == word[::-1])': 'Shows the word, then <code>True</code> or <code>False</code>. <code>==</code> asks "are these the same?", so it checks whether the word is the same as itself backwards.'
    },

    missions: [
        {
            id: 'reverse', title: 'Read it backwards',
            story: '<code>msg1.txt</code> starts with "!god tobor"... It\'s written <b>backwards</b>! You could read it in a mirror, or you could ask Python to flip it round in one go.<br><br>Your starter code already reads the message into a variable called <code>message</code>. In the door log, <code>lines[:5]</code> was a <b>slice</b>: part of a list. Strings can be sliced too, and a slice can have three parts: <code>[start:stop:step]</code>. Leave start and stop empty to mean "all of it". The <b>step</b> is how far to move each time, and a step of <code>-1</code> walks backwards.',
            task: 'Print <code>message</code> the right way round, using a slice.<br><br>Keep the starter code above! It makes <code>message</code>.',
            tools: ['slicing', 'strip'],
            hints: [
                'A slice has three parts: <code>[start:stop:step]</code>. Leave start and stop empty, and use a step of <code>-1</code> to walk backwards.',
                'That\'s two colons with nothing between them, then <code>-1</code>. Put the slice straight after <code>message</code>, inside a <code>print()</code>.'
            ],
            typeIt: 'print(message[::-1])',
            learn: '<code>message[::-1]</code> reverses a string. Empty start and stop mean "all of it", and step <code>-1</code> means "go backwards". <code>.strip()</code> removed the new line from the end of the file first, so the flipped message doesn\'t start with a blank line.',
            clue: 'Now you know when they\'re meeting. Add it to the Evidence Board →',
            evidence: ['when'],
            done: e => uses(e, /::\s*-\s*1|reversed/) && printed(e, PLAIN1)
        },
        {
            id: 'every-other', title: 'Ditch the junk letters',
            story: 'Byte sniffed <code>msg2.txt</code> and sneezed. 🐕 It\'s full of junk! Look closely: the <b>real</b> letters are the 1st, 3rd, 5th, 7th... and a junk letter sits after each one.<br><br>The step in a slice can fix this too. A step of <code>2</code> jumps two characters each time, so it lands on every other one and skips the junk.',
            task: 'Read <code>messages/msg2.txt</code> and print only every <b>second</b> character, starting with the first one.',
            tools: ['slicing'],
            hints: [
                'Open the file the same way the starter code opens <code>msg1.txt</code>. The line that reads it needs 4 spaces in front, so it\'s inside the <code>with</code>.',
                'This time the step is <code>2</code>, and start and stop are empty again: <code>[::2]</code> takes characters 0, 2, 4, 6... (Python counts from 0, so character 0 is the 1st one.)'
            ],
            typeIt: 'with open("messages/msg2.txt") as file:\n    message = file.read().strip()\nprint(message[::2])',
            learn: '<code>message[::2]</code> takes every 2nd character, starting from the first. <code>message[1::2]</code> would start from the second one instead, and give you only the junk.',
            done: e => uses(e, /:\s*2\s*\]/) && printed(e, PLAIN2)
        },
        {
            id: 'acrostic', title: 'The suspicious poem',
            story: 'The message said: <i>the password is hidden in my poem. Read the first letter of every line.</i> Careful: some lines start with spaces!<br><br>You can collect the letters in a <b>list</b>, adding one at a time with <code>.append()</code>. At the end, <code>"".join(first_letters)</code> glues the list into one word. The <code>""</code> at the front is what goes <b>between</b> the letters: here, nothing at all.',
            task: 'Loop over the lines of <code>messages/poem.txt</code>, collect the first letter of each line, and print them joined together as one word.',
            tools: ['for', 'strip', 'join'],
            hints: [
                'Start with an empty list, <code>first_letters = []</code>, before you open the file.',
                'You can loop straight over an open file: <code>for line in file:</code> gives you one line each time round. It needs 4 spaces in front, because it\'s inside the <code>with</code>.',
                '<code>line.strip()</code> removes the spaces at the start, so <code>line.strip()[0]</code> is the first real letter. <code>.append()</code> it to your list, with 8 spaces in front. Then, with no spaces in front, print <code>"".join(first_letters)</code>.'
            ],
            typeIt: 'first_letters = []\nwith open("messages/poem.txt") as file:\n    for line in file:\n        first_letters.append(line.strip()[0])\nprint("".join(first_letters))',
            learn: '<code>"".join(first_letters)</code> joins a list of strings with nothing in between. <code>" ".join(...)</code> would put a space between each one. <code>join</code> is the opposite of <code>split</code>.',
            clue: 'That word is the password! Add it to the Evidence Board →',
            evidence: ['password'],
            done: e => uses(e, /join|\+=|\+\s*line/) && printed(e, PASSWORD)
        },
        {
            id: 'capitals', title: 'Shouting letters',
            story: '<code>msg3.txt</code> looks like a friendly note... but a few letters in the middle of words are CAPITALS. That\'s no typo. They spell out a secret!<br><br>A <code>for</code> loop over a <b>string</b> gives you one character at a time: <code>for letter in message:</code>. And every string can test itself: <code>letter.isupper()</code> is True when <code>letter</code> is a capital (or "upper case") letter.',
            task: 'Go through <code>messages/msg3.txt</code> letter by letter, keep only the capital letters, and print them as one word.',
            tools: ['for', 'if', 'join'],
            hints: [
                'Read the file into <code>message</code>, then make a variable that starts as empty text: <code>capitals = ""</code>.',
                'Loop with <code>for letter in message:</code>. Inside it, with 4 spaces in front, ask <code>if letter.isupper():</code>',
                'Inside the <code>if</code>, with 8 spaces in front, <code>capitals += letter</code> adds the capital to the end. After the loop, with no spaces in front, print <code>capitals</code>.'
            ],
            typeIt: 'with open("messages/msg3.txt") as file:\n    message = file.read()\ncapitals = ""\nfor letter in message:\n    if letter.isupper():\n        capitals += letter\nprint(capitals)',
            learn: '<code>.isupper()</code> checks for capital letters (and <code>.islower()</code> for small ones). Looping over a string gives you one character at a time. <code>+=</code> adds something onto the end of what a variable already holds.',
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
          tip: 'Print msg1.txt backwards with message[::-1] and look for a time.' },
        { id: 'password', label: '2. What is the password hidden in the poem?', ph: 'one word',
          check: v => v === PASSWORD.toLowerCase(),
          tip: 'Take the first letter of every line of poem.txt. Use line.strip() first because some lines start with spaces.',
          tips: { [POEM.map(l => l[0]).join('').toLowerCase()]: 'Some of those are spaces! Use line.strip()[0] to skip them.' } },
        { id: 'boat', label: 'What is the name of the getaway boat?', bonus: true, ph: 'a boat name',
          check: v => v === BOAT.toLowerCase(),
          tip: 'Keep only the characters in msg3.txt where letter.isupper() is True.' }
    ],

    bonus: [
        { title: 'The boat.', text: 'Find the getaway boat\'s name hidden in the capitals of msg3.txt. That\'s a bonus answer!' },
        { title: 'Write backwards.', text: 'Write your own backwards message to a friend.', code: 'my_message = "meet me at the climbing wall"\nprint(my_message[::-1])' },
        { title: 'Palindromes.', text: 'A palindrome reads the same both ways. Is "racecar" one? Python can check: <code>word == word[::-1]</code>', code: 'for word in ["racecar", "pier", "level", "kayak", "magpie"]:\n    print(word, word == word[::-1])' }
    ]
});
})();
