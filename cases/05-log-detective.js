// CASE 5 (MEDIUM): Log Detective
// Reading a log file line by line, split(), negative indexes and counting with a dict.
(() => {
const HOME = '/home/detective';
const LOG = `${HOME}/pavilion/doors.log`;
const MAGPIE = 'B-7731';
const STAFF = ['B-1042', 'B-2210', 'B-3318', 'B-4456', 'B-5127', 'B-6093'];
const STAFF_DENIED = [1, 2, 3, 2, 1, 3];          // how many times each staff badge gets refused
const DOORS = ['East Wing', 'West Wing', 'Banqueting Room', 'Great Kitchen', 'Music Room', 'Saloon', 'Gift Shop'];
const BUSY_HOUR = 9;                              // the morning shift all arrives at once

// Small seeded random number generator, so the log is the same every time
let seed = 2026;
const rand = () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const pick = a => a[Math.floor(rand() * a.length)];
const pad = n => String(n).padStart(2, '0');

const swipes = [];
for (let h = 8; h <= 21; h++) {
    const n = h === BUSY_HOUR ? 16 : 5 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
        swipes.push({ t: h * 3600 + Math.floor(rand() * 3600), door: pick(DOORS), badge: pick(STAFF), result: 'GRANTED' });
    }
}
swipes.sort((a, b) => a.t - b.t);
// Every staff member fumbles their badge a few times
STAFF.forEach((b, i) => {
    swipes.filter(s => s.badge === b).filter((s, j) => j % 3 === 2).slice(0, STAFF_DENIED[i]).forEach(s => { s.result = 'DENIED'; });
});
// The Magpie tries door after door late at night...
const MAGPIE_TRIES = [
    ['22:41:07', 'Banqueting Room'], ['22:43:52', 'Great Kitchen'], ['22:47:15', 'East Wing'],
    ['22:52:30', 'Saloon'], ['22:58:44', 'Banqueting Room'], ['23:04:09', 'West Wing'],
    ['23:09:58', 'Great Kitchen'], ['23:15:21', 'Saloon'], ['23:20:36', 'East Wing']
];
const toSecs = s => s.split(':').reduce((a, x) => a * 60 + Number(x), 0);
MAGPIE_TRIES.forEach(([time, door]) => swipes.push({ t: toSecs(time), door, badge: MAGPIE, result: 'DENIED' }));
swipes.push({ t: toSecs('23:27:41'), door: 'Music Room', badge: MAGPIE, result: 'GRANTED' });   // ...and gets in

const fmt = t => `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`;
const LINES = swipes.map(s => `2026-10-20 ${fmt(s.t)} DOOR=${s.door} BADGE=${s.badge} RESULT=${s.result}`);
const MAGPIE_DENIED_LINE = LINES.find(l => l.includes(MAGPIE) && l.includes('DENIED'));
const MAGPIE_IN_LINE = LINES.find(l => l.includes(MAGPIE) && l.includes('GRANTED'));
const STAFF_TOP = STAFF[STAFF_DENIED.indexOf(Math.max(...STAFF_DENIED))];

CASES.push({
    id: 'log-detective',
    title: 'Log Detective',
    icon: '📜',
    difficulty: 'medium',
    xp: 200,
    hintCost: 0.05,
    requires: 'case-file',
    summary: 'Someone sneaked into the Royal Pavilion last night. Dig through the door-entry log, count the refused badge swipes and find the door the Magpie got through.',
    skills: ['for line in file', 'split()', 'dict', 'counting'],
    home: HOME,
    intro: [
        '\x1b[1mThe diary was right.\x1b[0m Last night someone tried to break into the \x1b[93mRoyal Pavilion\x1b[0m.',
        'Every door there has a badge reader, and every swipe is written into a log file.',
        'It\'s over a hundred lines long. Time to make Python do the reading!'
    ],
    starter: [
        '# Case 5: Log Detective',
        '# Start by reading your case file.',
        '',
        'with open("case_file.txt") as f:',
        '    print(f.read())',
        ''
    ].join('\n'),
    files: {
        [`${HOME}/case_file.txt`]: [
            '==================== CASE FILE #0047 ====================',
            ' TO:      Detective',
            ' FROM:    Inspector Ada, Brighton Byte Bureau',
            ' SUBJECT: The Royal Pavilion break-in',
            '',
            ' Last night someone got inside the Royal Pavilion.',
            ' Nothing is missing... yet. But the Magpie was here.',
            '',
            ' The door-entry log is in pavilion/doors.log',
            ' Every line is one badge swipe, like this:',
            '',
            '   2026-10-20 21:14:03 DOOR=East Wing BADGE=B-1042 RESULT=DENIED',
            '',
            ' Staff fumble their badges now and then, so a few',
            ' DENIED swipes are normal. Lots of them are NOT.',
            '',
            ' Find out:',
            '   1. Which badge was refused the most times',
            '   2. Which door that badge finally got through',
            '',
            ' - Ada',
            '=========================================================='
        ].join('\n'),
        [LOG]: LINES.join('\n') + '\n'
    },

    missions: [
        {
            id: 'peek', title: 'Peek at the log', tutorial: true,
            story: 'The log is far too long to print all at once and read. Detectives start by peeking at the <b>first few lines</b> to see what they look like.',
            task: 'Open <code>pavilion/doors.log</code>, read its lines into a list and print just the first 5.',
            tools: ['open', 'slicing'],
            hints: [
                '<code>f.readlines()</code> gives you a list of lines.',
                'A slice like <code>lines[:5]</code> takes the first 5 items of a list. Loop over that and print each one.'
            ],
            try: ['with open("pavilion/doors.log") as f:\n    lines = f.readlines()\n\nfor line in lines[:5]:\n    print(line.strip())'],
            learn: '<code>lines[:5]</code> is a <b>slice</b>: the items from the start up to (but not including) number 5. <code>.strip()</code> removes the invisible newline at the end of each line.',
            done: e => printed(e, LINES[0])
        },
        {
            id: 'denied', title: 'Only the refused swipes',
            story: 'Most swipes say <code>RESULT=GRANTED</code>: the door opened. We only care about the ones where the door said <b>no</b>.',
            task: 'Loop over every line and print <b>only</b> the lines that contain <code>DENIED</code>.',
            tools: ['for', 'in', 'if', 'strip'],
            hints: [
                'Loop with <code>for line in lines:</code> and use <code>if</code> to decide whether to print.',
                '<code>"DENIED" in line</code> is True when the line contains the word DENIED.'
            ],
            try: ['for line in lines:\n    if "DENIED" in line:\n        print(line.strip())'],
            learn: 'A <code>for</code> loop with an <code>if</code> inside is a <b>filter</b>: it keeps only the lines you care about. Detectives use this all the time!',
            done: e => uses(e, /DENIED/) && printed(e, MAGPIE_DENIED_LINE) && !e.stdout.includes('RESULT=GRANTED')
        },
        {
            id: 'count', title: 'Count the refusals per badge',
            story: 'There are quite a few DENIED lines. Counting by eye is how detectives make mistakes! Let a <b>dictionary</b> keep score for each badge.',
            task: 'For every DENIED line, pull out the badge number and count it in a dictionary. Print the dictionary. Which badge was refused the most?',
            tools: ['split', 'dict'],
            hints: [
                '<code>line.split()</code> chops a line into a list of words. Door names have spaces in them, so count from the <b>end</b>: <code>parts[-2]</code> is the second-to-last word, <code>"BADGE=B-1042"</code>.',
                '<code>"BADGE=B-1042".split("=")[1]</code> gives <code>"B-1042"</code>.',
                'Start with <code>counts = {}</code>, then for each badge: <code>counts[badge] = counts.get(badge, 0) + 1</code>'
            ],
            try: ['counts = {}\nfor line in lines:\n    if "DENIED" in line:\n        parts = line.split()\n        badge = parts[-2].split("=")[1]\n        counts[badge] = counts.get(badge, 0) + 1\n\nprint(counts)\nprint("Most refused:", max(counts, key=counts.get))'],
            learn: 'A <b>dictionary</b> (<code>{}</code>) stores a value for each key. <code>counts.get(badge, 0) + 1</code> means "what we had before (or 0), plus one". And <code>parts[-2]</code> counts from the end of a list.',
            clue: 'One badge was refused far more than any other. Add it to the Evidence Board →',
            evidence: ['badge'],
            done: e => uses(e, /\{\s*\}|dict\s*\(|Counter/) && printed(e, MAGPIE)
        },
        {
            id: 'door', title: 'Which door gave in?',
            story: 'After all those refusals, the suspicious badge finally got a <code>GRANTED</code>. Which door let the Magpie in?',
            task: 'Print the line (or lines) where the suspicious badge was <b>GRANTED</b>, and nothing else.',
            tools: ['if', 'in'],
            hints: [
                'You need two things to be true at once. Python has <code>and</code> for that.',
                '<code>if "B-...." in line and "GRANTED" in line:</code> (put in the badge you found).'
            ],
            try: [`for line in lines:\n    if "${MAGPIE}" in line and "GRANTED" in line:\n        print(line.strip())`],
            learn: '<code>and</code> lets an <code>if</code> check two things at once: both have to be True.',
            clue: 'Now you know which door the Magpie got through. Add it to the Evidence Board →',
            evidence: ['door'],
            done: e => uses(e, /GRANTED/) && printed(e, MAGPIE_IN_LINE) && e.stdout.split('\n').filter(l => l.trim()).length <= 3
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'You\'ve tracked the Magpie through the Royal Pavilion\'s own log. Inspector Ada is waiting!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['Which badge had the biggest count in your dictionary? And which door does its GRANTED line mention?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'badge', label: '1. Which badge was refused the most times?', ph: 'e.g. B-1234',
          check: v => v.replace(/\s/g, '') === MAGPIE.toLowerCase() || v === MAGPIE.slice(2),
          tip: 'Count the DENIED lines for each badge with a dictionary, then look for the biggest number.',
          tips: { [STAFF_TOP.toLowerCase()]: 'That badge was refused a few times, but another one was refused MUCH more. Check your counts again!' } },
        { id: 'door', label: '2. Which door did that badge finally get through?', ph: 'a door name',
          check: v => v.includes('music'),
          tip: 'Print the lines that contain the badge AND the word GRANTED.' },
        { id: 'hour', label: 'Which hour of the day had the most swipes? (e.g. 14 for 2pm)', bonus: true, ph: 'e.g. 14',
          check: v => Number(v.split(':')[0]) === BUSY_HOUR,
          tip: 'The hour is the first two digits of the time: line.split()[1][:2]. Count each hour with a dictionary.' }
    ],

    bonus: [
        { title: 'Rush hour.', text: 'Which hour had the most swipes of all? Count the hours with a dictionary. That\'s a bonus answer!',
          code: 'hours = {}\nfor line in lines:\n    hour = line.split()[1][:2]\n    hours[hour] = hours.get(hour, 0) + 1\nprint(max(hours, key=hours.get))' },
        { title: 'Door popularity.', text: 'Which door is used the most? Try <code>line.split("DOOR=")[1].split(" BADGE")[0]</code> to pull out the door name.' },
        { title: 'Sorted scores.', text: 'Print your badge counts from most to fewest refusals.', code: 'for badge in sorted(counts, key=counts.get, reverse=True):\n    print(badge, counts[badge])' }
    ]
});
})();
