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
const DENIED_LINES = LINES.filter(l => l.includes('DENIED'));
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
        'with open("case_file.txt") as file:',
        '    print(file.read())',
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

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'for line in lines[:5]:': 'A <b>loop</b> over <code>lines[:5]</code>. That\'s a <b>slice</b> of the list: just the first 5 lines (items 0, 1, 2, 3 and 4). Each time round, the current line is put in <code>line</code>.',
        'if "DENIED" in line:': 'Checks whether the text <code>"DENIED"</code> appears anywhere in this line. The indented lines below only run if it does, so every other line is skipped.',
        'refusals = {}': 'Makes an empty <b>dictionary</b> called <code>refusals</code>. Curly brackets <code>{}</code> make a dictionary. This one will keep a score for each badge, looked up by the badge number.',
        'words = line.split()': 'Chops <code>line</code> into a list of words wherever there\'s a space, and calls that list <code>words</code>.',
        'badge = words[-2].split("=")[1]': '<code>words[-2]</code> is the second-to-last word, like <code>"BADGE=B-1042"</code> (negative numbers count from the end). <code>.split("=")</code> chops it at the <code>=</code> into <code>["BADGE", "B-1042"]</code>, and <code>[1]</code> takes the second item: just the badge number.',
        'refusals[badge] = refusals.get(badge, 0) + 1': 'Adds 1 to this badge\'s score. <code>refusals.get(badge, 0)</code> looks up the score so far (or 0 if this badge hasn\'t turned up yet), <code>+ 1</code> adds one, and <code>refusals[badge] =</code> stores the new score under that badge.',
        'print(refusals)': 'Shows the whole dictionary: each badge, a colon, then how many times it was refused. It\'s not indented, so it runs once, after the loop has finished.',
        'print("Most refused:", max(refusals, key=refusals.get))': '<code>max()</code> finds the biggest. <code>key=refusals.get</code> tells it to compare the badges by their <b>scores</b>, so you get the badge with the most refusals. It\'s shown after the words "Most refused:".',
        [`if "${MAGPIE}" in line and "GRANTED" in line:`]: `Checks two things at once: is the badge <code>"${MAGPIE}"</code> in this line, <b>and</b> is the word <code>"GRANTED"</code> in it too? The indented line below only runs if both are true.`,
        'swipes_per_hour = {}': 'Makes an empty dictionary called <code>swipes_per_hour</code>. It will hold a count of swipes for each hour of the day.',
        'hour = line.split()[1][:2]': '<code>line.split()[1]</code> is the second word of the line: the time, like <code>"21:14:03"</code>. Then the slice <code>[:2]</code> takes its first two characters, which are the hour (<code>"21"</code>).',
        'swipes_per_hour[hour] = swipes_per_hour.get(hour, 0) + 1': 'Adds 1 to this hour\'s count, the same way you counted badges: get the count so far (or 0), add one, and store it back.',
        'print(max(swipes_per_hour, key=swipes_per_hour.get))': 'Shows the hour with the biggest count. <code>key=swipes_per_hour.get</code> makes <code>max()</code> compare the hours by their counts.',
        'for badge in sorted(refusals, key=refusals.get, reverse=True):': 'A <b>loop</b> over the badges, in order of score. <code>sorted()</code> puts them in order, <code>key=refusals.get</code> sorts them by their scores, and <code>reverse=True</code> puts the biggest first.',
        'print(badge, refusals[badge])': 'Shows the badge, then its score. <code>refusals[badge]</code> looks up the value stored under that badge.'
    },

    missions: [
        {
            id: 'peek', title: 'Peek at the log',
            story: 'The log is a text file with over a hundred lines. Each line is one badge swipe: the date, the time, the door, the badge number and whether the door opened. That\'s far too much to read in one go, so detectives start by peeking at the <b>first few lines</b>.<br><br>Remember <code>file.readlines()</code> from the last case? It reads a file into a <b>list</b>, one line per item. You can take part of a list with a <b>slice</b>: <code>lines[:5]</code> means "the items from the start, up to item 5". Then a <code>for</code> loop can print each one.',
            task: 'Open <code>pavilion/doors.log</code>, read its lines into a list called <code>lines</code>, and print just the first 5.',
            tools: ['open', 'slicing'],
            hints: [
                'Open the file the same way you opened the diary: <code>with open("pavilion/doors.log") as file:</code>. Then <code>lines = file.readlines()</code> goes inside it, with 4 spaces in front.',
                '<code>lines[:5]</code> is the first 5 items of the list. Loop over it with <code>for line in lines[:5]:</code> and print each <code>line</code>, with 4 spaces in front.'
            ],
            typeIt: 'with open("pavilion/doors.log") as file:\n    lines = file.readlines()\nfor line in lines[:5]:\n    print(line.strip())',
            learn: '<code>lines[:5]</code> is a <b>slice</b>: the items from the start up to (but not including) number 5. That\'s items 0, 1, 2, 3 and 4, because Python counts from 0. <code>.strip()</code> removes the invisible "new line" character at the end of each line, so you don\'t get blank lines in between.',
            done: e => printed(e, LINES[0])
        },
        {
            id: 'denied', title: 'Only the refused swipes',
            story: 'Most swipes end in <code>RESULT=GRANTED</code>: the badge worked and the door opened. Some end in <code>RESULT=DENIED</code>: the door said <b>no</b>. Those are the ones we care about.<br><br>Every time you press Run, Python starts fresh. So keep the lines above that open the log and make <code>lines</code>, and add your new code underneath.',
            task: 'Loop over every line in <code>lines</code> and print <b>only</b> the ones that contain <code>DENIED</code>.',
            tools: ['for', 'in', 'if', 'strip'],
            hints: [
                'Loop with <code>for line in lines:</code>. Inside the loop, use <code>if</code> to decide whether to print.',
                '<code>"DENIED" in line</code> is True when the word DENIED is somewhere in the line. Don\'t forget the colons at the end of the <code>for</code> and <code>if</code> lines.',
                'The <code>if</code> line needs 4 spaces in front (it\'s inside the loop). The <code>print</code> line needs 8 (it\'s inside the <code>if</code>).'
            ],
            typeIt: 'for line in lines:\n    if "DENIED" in line:\n        print(line.strip())',
            learn: 'A <code>for</code> loop with an <code>if</code> inside is a <b>filter</b>. The loop looks at every line, and the <code>if</code> only lets through the ones you care about. Detectives use this all the time!',
            // The first 5 lines are still printed above, so check every DENIED line is there rather than "only"
            done: e => uses(e, /DENIED/) && printed(e, ...DENIED_LINES)
        },
        {
            id: 'count', title: 'Count the refusals per badge',
            story: 'There are lots of DENIED lines, and counting by eye is how detectives make mistakes! We need a score for every badge. Python has the perfect tool: a <b>dictionary</b>.<br><br>A dictionary is like a list, but instead of numbered slots, each value has a <b>key</b>: a label you look it up by. Ours will use badge numbers as keys, and the number of refusals as values, like <code>{"B-0001": 2, "B-0002": 5}</code>. Curly brackets make a dictionary, so <code>refusals = {}</code> makes an empty one, ready to fill.<br><br>To get the badge out of a line, <code>line.split()</code> chops the line into a list of words at every space. Door names like East Wing have spaces too, so count from the <b>end</b>: the badge is always the second-to-last word, <code>words[-2]</code>.',
            task: 'For every DENIED line, pull out the badge number and add 1 to its score in a dictionary called <code>refusals</code>. Print the dictionary. Which badge was refused the most?',
            tools: ['split', 'dict'],
            hints: [
                '<code>words = line.split()</code> turns a line into a list of words ending <code>[..., "Wing", "BADGE=B-1042", "RESULT=DENIED"]</code>. So <code>words[-2]</code> is <code>"BADGE=B-1042"</code>.',
                '<code>"BADGE=B-1042".split("=")</code> chops at the <code>=</code> and gives <code>["BADGE", "B-1042"]</code>. Add <code>[1]</code> to take the second item, <code>"B-1042"</code>.',
                'Make <code>refusals = {}</code> before the loop, so the dictionary is only made once. Then for each badge: <code>refusals[badge] = refusals.get(badge, 0) + 1</code>. <code>refusals.get(badge, 0)</code> is the score so far (0 the first time).'
            ],
            typeIt: 'refusals = {}\nfor line in lines:\n    if "DENIED" in line:\n        words = line.split()\n        badge = words[-2].split("=")[1]\n        refusals[badge] = refusals.get(badge, 0) + 1\nprint(refusals)\nprint("Most refused:", max(refusals, key=refusals.get))',
            learn: 'A <b>dictionary</b> (<code>{}</code>) stores a value for each key. <code>refusals.get(badge, 0)</code> looks up a badge\'s score so far, or gives 0 if it isn\'t in the dictionary yet. Add 1, store it back, and that swipe is counted! Negative positions count from the end of a list: <code>[-1]</code> is the last item, <code>[-2]</code> the one before.',
            clue: 'One badge was refused far more than any other. Add it to the Evidence Board →',
            evidence: ['badge'],
            // The DENIED lines printed above already contain the badge, so look for it on a line of its own making
            done: e => uses(e, /\{\s*\}|dict\s*\(|Counter/) && e.stdout.split('\n').some(l => l.includes(MAGPIE) && !l.includes('RESULT='))
        },
        {
            id: 'door', title: 'Which door gave in?',
            story: 'After all those refusals, the suspicious badge finally got a <code>GRANTED</code>. Which door let the Magpie in?<br><br>This time a line has to pass <b>two</b> tests: it must contain the badge number, <b>and</b> it must contain the word GRANTED. Python\'s <code>and</code> joins two tests together, and the <code>if</code> only runs when both are True.',
            task: 'Loop over <code>lines</code> again and print the line where the suspicious badge was <b>GRANTED</b>.<br><br>Your earlier code still prints its lines first, so your answer will be at the bottom of the Output panel.',
            tools: ['if', 'in'],
            hints: [
                'You need two things to be true at once. Python has <code>and</code> for that. Each test needs its own <code>in line</code>.',
                '<code>if "B-...." in line and "GRANTED" in line:</code> (put in the badge you found). The <code>if</code> line needs 4 spaces in front, and the <code>print</code> line needs 8.'
            ],
            typeIt: `for line in lines:\n    if "${MAGPIE}" in line and "GRANTED" in line:\n        print(line.strip())`,
            learn: '<code>and</code> lets an <code>if</code> check two things at once: both have to be True. There\'s also <code>or</code>, which only needs one of them to be True.',
            clue: 'Now you know which door the Magpie got through. Add it to the Evidence Board →',
            evidence: ['door'],
            // None of the earlier code prints this line, and the badge has to be in the code
            done: e => uses(e, /GRANTED/, new RegExp(MAGPIE)) && printed(e, MAGPIE_IN_LINE)
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'You\'ve tracked the Magpie through the Royal Pavilion\'s own log. Inspector Ada is waiting!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['Which badge had the biggest score in your dictionary? And which door does its GRANTED line mention?'],
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
        { title: 'Rush hour.', text: 'Which hour had the most swipes of all? Count the hours with a dictionary, just like the badges. The time is the second word of each line, and its first two characters are the hour. That\'s a bonus answer!',
          code: 'swipes_per_hour = {}\nfor line in lines:\n    hour = line.split()[1][:2]\n    swipes_per_hour[hour] = swipes_per_hour.get(hour, 0) + 1\nprint(max(swipes_per_hour, key=swipes_per_hour.get))' },
        { title: 'Door popularity.', text: 'Which door is used the most? Try <code>line.split("DOOR=")[1].split(" BADGE")[0]</code> to pull out the door name. It chops the line at <code>DOOR=</code> and keeps the part after it, then chops that at <code> BADGE</code> and keeps the part before.' },
        { title: 'Sorted scores.', text: 'Print your badge scores from most refusals to fewest. Put it below your counting code, so <code>refusals</code> exists.', code: 'for badge in sorted(refusals, key=refusals.get, reverse=True):\n    print(badge, refusals[badge])' }
    ]
});
})();
