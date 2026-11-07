// CASE 3 (EASY): Roll Call
// Lists, len(), for loops, in / not in, if with %. No files yet.
(() => {
const HOME = '/home/detective';
const ALIAS = 'Mags Pye';
const NAMES = [
    'Amara Okafor', 'Ben Hughes', 'Chloe Martin', 'Dev Patel', 'Ella Brooks', 'Finn Walsh',
    'Grace Lee', 'Hugo Fischer', 'Isla Murray', 'Jay Sharma', 'Jasmine Clarke', 'Kemi Adeyemi',
    'Leo Rossi', 'Maya Cohen', 'Noah Evans', 'Olivia Grant', 'Priya Nair', 'Quinn Doyle',
    'Ruby Turner', 'Sam Kowalski', 'Theo Baker', 'Uma Singh', 'Victor Mendes', 'Willow Hart',
    'Xander Price', 'Yasmin Ali', 'Zac Foster', 'Jude Bennett', 'Freya Lund', ALIAS
];
const BADGES = [
    271, 215, 303, 158, 221, 349, 177, 260, 404, 125, 333, 188, 112,
    142, 416, 209, 365, 151, 248, 382, 166, 289, 437, 193, 320
];
const BADGE = BADGES.find(n => n % 7 === 0);   // the only multiple of 7: 112

// Small seeded shuffle, so the lists are jumbled but the same for everyone
function shuffled(list, seed) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        const j = seed % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
const SIGNED_IN = shuffled(NAMES, 121);
const SIGNED_OUT = shuffled(NAMES.filter(n => n !== ALIAS), 4378);
const J_COUNT = NAMES.filter(n => n.startsWith('J')).length;

// Write a Python list over several lines so it fits the editor
const pyList = (name, items, per) => {
    const rows = [];
    for (let i = 0; i < items.length; i += per) rows.push('    ' + items.slice(i, i + per).map(x => JSON.stringify(x)).join(', '));
    return `${name} = [\n${rows.join(',\n')}\n]`;
};
const LISTS = [pyList('signed_in', SIGNED_IN, 3), pyList('signed_out', SIGNED_OUT, 3)].join('\n');
const BADGE_LIST = pyList('badges', BADGES, 9);

CASES.push({
    id: 'roll-call',
    title: 'Roll Call',
    icon: '📋',
    difficulty: 'easy',
    xp: 120,
    hintCost: 0,
    requires: 'locker-code',
    summary: 'Bus 121 stops outside Brighton Museum. Someone signed in yesterday but never signed out. Use lists and loops to find out who\'s still hiding inside.',
    skills: ['lists', 'len()', 'for loops', 'in / not in'],
    home: HOME,
    intro: [
        '\x1b[1mBrighton Museum, 9:05am.\x1b[0m Bus 121 stops right outside.',
        'The guard, Mr Okoro, hands you two lists from yesterday:',
        '  \x1b[96msigned_in\x1b[0m  everyone who came in',
        '  \x1b[96msigned_out\x1b[0m everyone who left',
        '',
        '"Thirty visitors, Detective. Checking by hand would take me all day!"'
    ],
    starter: [
        '# Roll Call',
        '# A list is one variable that holds lots of things, in order.',
        '# Put the things inside [square brackets], with commas in between.',
        '# Press Run to see this list of suspects.',
        '',
        'suspects = ["Ada", "Ben", "Chloe"]',
        'print(suspects)',
        ''
    ].join('\n'),
    files: {},

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'print(len(signed_in))': 'Counts the names in the <code>signed_in</code> list with <code>len()</code>, and shows the number.',
        'print(len(signed_out))': 'Does the same for <code>signed_out</code>, so you can compare the two numbers.',
        'print("Still inside:", name)': 'Shows the words <code>Still inside:</code> followed by the name. The comma puts a space between them.',
        'if badge % 7 == 0:': 'Divides the badge number by 7 and checks whether the remainder is 0. <code>==</code> (two equals signs) asks "are these the same?". The indented line below only runs if the answer is yes.',
        'print("Lucky badge:", badge)': 'Shows the words <code>Lucky badge:</code> followed by the badge number.',
        'j_count = 0': 'Makes a variable called <code>j_count</code> to count the J names, starting at 0. We picked a name that says what it counts, but any name would work.',
        'if name.startswith("J"):': 'Checks whether the name starts with a capital <code>J</code>. <code>.startswith()</code> gives True or False, and the indented line below only runs if it\'s True.',
        'print(j_count)': 'Shows the final count. It isn\'t indented, so it runs just once, after the loop has finished.',
        'print(signed_in[-1])': 'Shows the last name in <code>signed_in</code>. Negative numbers count backwards from the end, so <code>-1</code> is the last one.'
    },

    missions: [
        {
            id: 'lists', title: 'Count the visitors',
            story: 'Mr Okoro\'s registers have 30 names each. You <i>could</i> make 30 variables, <code>visitor1</code>, <code>visitor2</code> and so on, but that\'s a lot of typing! A <b>list</b> is one variable that holds lots of things, in order. You write it with <code>[square brackets]</code> and put commas between the items: <code>suspects = ["Ada", "Ben", "Chloe"]</code>.<br><br>We\'ve added Mr Okoro\'s lists to the bottom of your code. They\'re called <code>signed_in</code> and <code>signed_out</code>, so their names say what they hold.<br><br>First, check how many names each one has. You used <code>len()</code> to count the letters in the Magpie\'s note. On a list, it counts the items.',
            task: 'Type the two lines below at the bottom of your code, then press <kbd>▶ Run</kbd>. They print how many people are in each list.',
            tools: ['lists', 'len'],
            hints: [
                'Each line has two sets of brackets: one for <code>len()</code>, and one for <code>print()</code> around it.',
                'Make sure each line ends with <code>))</code>: one bracket closes <code>len(</code>, the other closes <code>print(</code>.'
            ],
            data: LISTS,
            typeIt: 'print(len(signed_in))\nprint(len(signed_out))',
            learn: 'A <b>list</b> keeps many values in order, inside <code>[square brackets]</code>. <code>len(signed_in)</code> counts the items, just like it counted the letters in a string.',
            done: e => uses(e, /len\s*\(\s*signed_in\s*\)/) && printed(e, String(SIGNED_IN.length))
        },
        {
            id: 'loop', title: 'Read out the register',
            story: 'The lists are different lengths, so somebody didn\'t sign out! To check the names, you need to look at them one at a time. A <b>for loop</b> does that for you. It takes the first item in the list and runs some lines of code, then takes the next item and runs them again, all the way to the end.<br><br><code>for name in signed_in:</code> means "for each name in signed_in, do this". Each time round, Python puts the current item in a variable called <code>name</code>. You choose that name: <code>visitor</code> or <code>person</code> would work just as well.<br><br>The lines to repeat go underneath, <b>indented</b> with 4 spaces, just like the lines under an <code>if</code>. Don\'t forget the colon at the end of the <code>for</code> line.',
            task: 'Type the two lines below at the bottom of your code, then press <kbd>▶ Run</kbd>. The loop prints every name in <code>signed_in</code>, one per line.<br><br>Keep the lists above! Python needs them to know what <code>signed_in</code> is.',
            tools: ['for'],
            hints: [
                'The loop line ends with a colon: <code>for name in signed_in:</code>',
                'The next line needs 4 spaces in front: <code>    print(name)</code>. That puts it inside the loop.'
            ],
            typeIt: 'for name in signed_in:\n    print(name)',
            learn: '<code>for name in signed_in:</code> takes each item in turn, puts it in the variable <code>name</code>, then runs the indented lines. You don\'t even need to know how long the list is!',
            done: e => uses(e, /for\s+\w+\s+in\s+signed_in/) && printed(e, SIGNED_IN[0], SIGNED_IN[SIGNED_IN.length - 1])
        },
        {
            id: 'missing', title: 'Who never left?',
            story: 'Now for the real detective work. For each person who signed <b>in</b>, check whether their name is missing from <code>signed_out</code>.<br><br><code>in</code> asks "is this somewhere in the list?", and <code>not in</code> asks "is this missing from the list?". Put <code>not in</code> in an <code>if</code>, put the <code>if</code> inside your loop, and Python checks every name for you.',
            task: 'Type the three lines below at the bottom of your code, then press <kbd>▶ Run</kbd>. This loop goes through <code>signed_in</code> again, but only prints the names that are <b>not in</b> <code>signed_out</code>.<br><br>Watch the spaces: none in front of <code>for</code>, 4 in front of <code>if</code>, and 8 in front of <code>print</code>.',
            tools: ['for', 'in', 'if'],
            hints: [
                'The <code>if</code> line goes inside the loop, so it has 4 spaces in front. It ends with a colon too.',
                'The print goes one step further in, with 8 spaces in front. That puts it inside the <code>if</code>, so it only runs when the name is missing.'
            ],
            typeIt: 'for name in signed_in:\n    if name not in signed_out:\n        print("Still inside:", name)',
            learn: '<code>"Ben" in signed_out</code> is True if "Ben" is somewhere in the list, and <code>not in</code> is the opposite. Put an <code>if</code> inside a <code>for</code> and you can filter a whole list!',
            clue: 'That name sounds a bit like "Magpie"... Add it to the Evidence Board →',
            evidence: ['name'],
            done: e => uses(e, /\bnot\s+in\b|\bin\s+signed_out/, /for\s+\w+\s+in/) && printed(e, ALIAS)
        },
        {
            id: 'badge', title: 'Lucky number seven',
            story: `Mr Okoro remembers something: "That visitor asked for a badge that was a multiple of 7. Said it was lucky!" We\'ve added a list called <code>badges</code> to the bottom of your code. It has every badge number handed out yesterday.<br><br>A number is a multiple of 7 when it divides by 7 with <b>nothing left over</b>. Remember <code>%</code> from the locker? It gives the remainder. So for a multiple of 7, <code>badge % 7</code> is 0.<br><br>To check whether two things are equal, Python uses <b>two</b> equals signs: <code>==</code>. A single <code>=</code> already has a job: putting things in variables. So <code>if badge % 7 == 0:</code> asks "is the remainder 0?".`,
            task: 'Type the three lines below at the bottom of your code, then press <kbd>▶ Run</kbd>. They loop through <code>badges</code> and print the badge number that is a multiple of 7.<br><br>It\'s the same shape as your last loop: 4 spaces in front of <code>if</code>, and 8 in front of <code>print</code>.',
            tools: ['for', 'if', 'maths'],
            hints: [
                'The loop line is <code>for badge in badges:</code>. Each time round, <code>badge</code> holds one number.',
                'The <code>if</code> line has <b>two</b> equals signs: <code>==</code> compares, one <code>=</code> makes a variable. Don\'t forget the colons at the end of the <code>for</code> and <code>if</code> lines.'
            ],
            data: BADGE_LIST,
            typeIt: 'for badge in badges:\n    if badge % 7 == 0:\n        print("Lucky badge:", badge)',
            learn: '<code>==</code> checks whether two things are equal, and <code>=</code> puts a value in a variable. <code>badge % 7 == 0</code> is a classic trick to test whether a number divides exactly.',
            clue: 'Found the Magpie\'s badge! Add it to the Evidence Board →',
            evidence: ['badge'],
            done: e => uses(e, /%\s*7/, /==/) && printed(e, String(BADGE))
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'Mags Pye never left the museum... or did she sneak out another way? Report to Inspector Ada.',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['Which name was in signed_in but not in signed_out? Which badge divided exactly by 7?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'name', label: '1. Who signed in but never signed out?', ph: 'first and last name',
          check: v => v.replace(/\s+/g, ' ') === ALIAS.toLowerCase(),
          tip: 'Loop through signed_in and print the names that are not in signed_out.' },
        { id: 'badge', label: '2. What was their badge number?', ph: 'a number',
          check: v => v === String(BADGE),
          tip: 'Loop through badges and print the one where badge % 7 == 0.' },
        { id: 'jcount', label: 'How many visitors have a first name starting with "J"?', bonus: true, ph: 'a number',
          check: v => v === String(J_COUNT),
          tip: 'Make j_count = 0, loop through signed_in, and add 1 to j_count each time name.startswith("J") is True.' }
    ],

    bonus: [
        { title: 'Count the Js.', text: 'How many visitors\' first names start with "J"? Make a variable called <code>j_count</code> that starts at 0, then add 1 to it each time <code>name.startswith("J")</code> is True. That\'s a bonus answer!', code: 'j_count = 0\nfor name in signed_in:\n    if name.startswith("J"):\n        j_count = j_count + 1\nprint(j_count)' },
        { title: 'Alphabetical order.', text: '<code>sorted()</code> gives you a sorted copy of a list.', code: 'for name in sorted(signed_in):\n    print(name)' },
        { title: 'First and last.', text: 'Lists count from 0, so <code>signed_in[0]</code> is the first name. What does <code>signed_in[-1]</code> give you?', code: 'print(signed_in[0])\nprint(signed_in[-1])' }
    ]
});
})();
