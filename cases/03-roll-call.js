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
        '# A list holds lots of things in [square brackets], separated by commas.',
        '',
        'suspects = ["Ada", "Ben", "Chloe"]',
        'print(suspects)',
        ''
    ].join('\n'),
    files: {},

    missions: [
        {
            id: 'lists', title: 'Count the visitors', tutorial: true,
            story: 'Mr Okoro\'s two lists are Python <b>lists</b>: lots of strings inside <code>[square brackets]</code>. First, check they\'re complete. <code>len()</code> works on lists too: it tells you how many items are inside.',
            task: 'Add the two lists to your code (click the code below), then print how many people are in <code>signed_in</code>.',
            tools: ['lists', 'len'],
            hints: [
                'Click the grey code box below to add both lists to the end of your code.',
                '<code>print(len(signed_in))</code>'
            ],
            try: [`${LISTS}\n\nprint(len(signed_in))\nprint(len(signed_out))`],
            learn: 'A <b>list</b> keeps many values in order. <code>len(signed_in)</code> counts the items, just like it counted the letters in a string.',
            done: e => uses(e, /len\s*\(\s*signed_in\s*\)/) && printed(e, String(SIGNED_IN.length))
        },
        {
            id: 'loop', title: 'Read out the register', tutorial: true,
            story: 'One list is longer than the other, so somebody didn\'t sign out! To look at every name, one at a time, use a <b>for loop</b>. It repeats the indented lines once for each item in the list.',
            task: 'Use a <code>for</code> loop to print every name in <code>signed_in</code>, one per line.',
            tools: ['for'],
            hints: [
                'The loop line ends with a colon: <code>for name in signed_in:</code>',
                'The next line needs 4 spaces in front: <code>    print(name)</code>'
            ],
            try: ['for name in signed_in:\n    print(name)'],
            learn: '<code>for name in signed_in:</code> takes each item in turn and puts it in the variable <code>name</code>, then runs the indented lines. You don\'t have to know how long the list is!',
            done: e => uses(e, /for\s+\w+\s+in\s+signed_in/) && printed(e, SIGNED_IN[0], SIGNED_IN[SIGNED_IN.length - 1])
        },
        {
            id: 'missing', title: 'Who never left?',
            story: 'Now for the real detective work. For each person who signed <b>in</b>, check whether their name is in <code>signed_out</code>. Python has a handy word for that: <code>not in</code>.',
            task: 'Loop through <code>signed_in</code> and print only the names that are <b>not in</b> <code>signed_out</code>.',
            tools: ['for', 'in', 'if'],
            hints: [
                'Inside your loop, add an <code>if</code>: <code>if name not in signed_out:</code>',
                'The print goes one level deeper, with 8 spaces in front, so it only runs when the if is true.'
            ],
            try: ['for name in signed_in:\n    if name not in signed_out:\n        print("Still inside:", name)'],
            learn: '<code>x in my_list</code> is True if x is somewhere in the list, and <code>not in</code> is the opposite. Put an <code>if</code> inside a <code>for</code> and you can filter a whole list!',
            clue: 'That name sounds a bit like "Magpie"... Add it to the Evidence Board →',
            evidence: ['name'],
            done: e => uses(e, /\bnot\s+in\b|\bin\s+signed_out/, /for\s+\w+\s+in/) && printed(e, ALIAS)
        },
        {
            id: 'badge', title: 'Lucky number seven',
            story: `Mr Okoro remembers something: "That visitor asked for a badge that was a multiple of 7. Said it was lucky!" Here are the numbers of all the badges handed out yesterday. A number is a multiple of 7 when dividing by 7 leaves <b>no remainder</b>, so <code>number % 7 == 0</code>.`,
            task: 'Add the <code>badges</code> list to your code (click it in the Objectives panel), then loop through it and print the badge number that is a multiple of 7.',
            tools: ['for', 'if', 'maths'],
            hints: [
                'Remember <code>%</code> from the locker? It gives the remainder.',
                '<code>if badge % 7 == 0:</code> Use two equals signs <code>==</code> to compare (one <code>=</code> is for making variables).'
            ],
            data: BADGE_LIST,
            try: ['for badge in badges:\n    if badge % 7 == 0:\n        print("Lucky badge:", badge)'],
            learn: '<code>==</code> checks whether two things are equal. <code>number % 7 == 0</code> is a classic trick to test whether a number divides exactly.',
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
          tip: 'Loop through signed_in, use name.startswith("J"), and add 1 to a counter each time.' }
    ],

    bonus: [
        { title: 'Count the Js.', text: 'How many visitors\' first names start with "J"? Make a <code>count</code> variable, and add 1 each time <code>name.startswith("J")</code> is True. That\'s a bonus answer!', code: 'count = 0\nfor name in signed_in:\n    if name.startswith("J"):\n        count = count + 1\nprint(count)' },
        { title: 'Alphabetical order.', text: '<code>sorted()</code> gives you a sorted copy of a list.', code: 'for name in sorted(signed_in):\n    print(name)' },
        { title: 'First and last.', text: 'Lists count from 0, so <code>signed_in[0]</code> is the first name. What does <code>signed_in[-1]</code> give you?', code: 'print(signed_in[0])\nprint(signed_in[-1])' }
    ]
});
})();
