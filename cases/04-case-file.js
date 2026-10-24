// CASE 4 (EASY): The Case File
// The first real files: open(), read(), with, readlines(), counting lines, picking out one line.
(() => {
const HOME = '/home/detective';
const TARGET_LINE = 'day 21: next target: the royal pavilion. the music room is full of shiny things.';

const BEFORE = [
    'the secret diary of the magpie',
    'keep out! (that means you, detective)',
    '',
    'day 1: moved into my new nest. it is not shiny enough yet.',
    'day 1: found a bottle top on the beach. shiny! keeping it.',
    'day 2: the seagulls stole my chips again. i will have my revenge.',
    'day 2: practised my best evil laugh. caw caw caw.',
    'day 3: bought a new black coat with a white stripe. very stylish.',
    'day 3: the jackdaw says hello. he is my best (and only) friend.',
    'day 4: went to the pier. so many lights. so many shiny things.',
    'day 4: spotted the golden deckchair trophy in its glass case.',
    'day 5: made a plan. a very clever plan. the best plan.',
    'day 5: the plan needs a torch, a rope and a bag of birdseed.',
    'day 6: rained all day. read a book about famous jewel thieves.',
    'day 7: took the golden deckchair! it is the shiniest thing i own.',
    'day 7: left a note for those silly detectives. they will never catch me.',
    'day 8: hid a riddle at the bandstand. let them do some maths!',
    'day 8: a robot dog was sniffing around the bandstand. most odd.',
    'day 9: caught bus 121. the driver did not even notice my feathers.',
    'day 9: the museum has a lovely collection of shiny old coins.',
    'day 10: signed in at the museum as mags pye. ha! nobody guessed.',
    'day 10: asked for badge 112. seven is my lucky number.',
    'day 11: hid in the egyptian room until closing time.',
    'day 11: forgot my handbag in the cloakroom. oh well.',
    'day 12: escaped through the gift shop. bought a pencil.',
    'day 12: the pencil is not shiny. disappointing.',
    'day 13: counted my treasure. 47 bottle tops, 12 spoons, 1 deckchair.',
    'day 13: the jackdaw wants half. he can have the bottle tops.',
    'day 14: wrote a poem about how clever i am. it is very long.',
    'day 14: the poem rhymes "magpie" with "shiny pie". genius.',
    'day 15: tried to learn python. it is harder than stealing.',
    'day 15: gave up on python. went back to stealing.',
    'day 16: polished the golden deckchair. so shiny it hurts my eyes.',
    'day 17: the jackdaw sent a message backwards. he thinks he is so clever.',
    'day 17: told the jackdaw that i will tell him the next target soon.',
    'day 18: very quiet day. ate some seeds.',
    'day 19: nobody ever reads all the way down here. good.',
    'day 19: so i will hide my big secret on line 42. always line 42.',
    'day 20: checked twice. it is definitely line 42.'
];
const AFTER = [
    'day 22: bought a new torch with extra shiny bits.',
    'day 22: practised tiptoeing. i am excellent at tiptoeing.',
    'day 23: the jackdaw will meet me afterwards at the usual place.',
    'day 23: must remember to delete this diary. (i will not remember.)',
    'day 24: made a list of other shiny things in brighton.',
    'day 24: the i360 is very tall but sadly not very shiny.',
    'day 25: the palace pier has the best hiding places.',
    'day 25: nobody looks under a pier. nobody.',
    'day 26: wrote this diary entry about writing a diary entry.',
    'day 27: dreamed about a mountain of spoons.',
    'day 27: woke up next to a mountain of spoons. mysterious.',
    'day 28: the jackdaw says detectives can read files with python now.',
    'day 28: surely not. that sounds like hard work.',
    'day 29: going quiet for a while. see you never, detective!',
    'the end. caw caw!'
];
const DIARY_LINES = [...BEFORE, ...Array(41 - BEFORE.length).fill('').map((_, i) => `day 20: (doodle of a feather #${i + 1})`), TARGET_LINE, ...AFTER];
const DIARY = DIARY_LINES.join('\n');
const LINE_COUNT = DIARY_LINES.length;
const SHINY_COUNT = DIARY.split('shiny').length - 1;

CASES.push({
    id: 'case-file',
    title: 'The Case File',
    icon: '📂',
    difficulty: 'easy',
    xp: 150,
    hintCost: 0,
    requires: 'roll-call',
    summary: 'Mags Pye left a handbag in the museum cloakroom, with a USB stick inside. Open real files with Python and read the Magpie\'s secret diary.',
    skills: ['open()', 'read()', 'readlines()', 'with'],
    home: HOME,
    intro: [
        '\x1b[1mBrighton Byte Bureau, 11:30am.\x1b[0m',
        'Mr Okoro found a handbag in the museum cloakroom. Inside: a comb, three spoons',
        'and a \x1b[93mUSB stick\x1b[0m. Inspector Ada has copied its files onto your computer.',
        '',
        'Until now, all your data was typed into your code. Real detectives read \x1b[92mfiles\x1b[0m!',
        'Start with your case file: \x1b[96mcase_file.txt\x1b[0m'
    ],
    starter: [
        '# The Case File',
        '# open() opens a file. "with" closes it again when you are done.',
        '',
        ''
    ].join('\n'),
    files: {
        [`${HOME}/case_file.txt`]: [
            '==================== CASE FILE #0004 ====================',
            ' TO:      Detective (that\'s you!)',
            ' FROM:    Inspector Ada, Brighton Byte Bureau',
            ' SUBJECT: The handbag from the museum',
            '',
            ' We copied everything on the USB stick into a folder',
            ' called usb, next to this file.',
            '',
            ' The most interesting file is usb/diary.txt. It\'s LONG,',
            ' so let Python do the hard work.',
            '',
            ' Find out where the Magpie will strike next.',
            ' Byte says woof. (He means good luck.)',
            '=========================================================='
        ].join('\n'),
        [`${HOME}/usb/diary.txt`]: DIARY,
        [`${HOME}/usb/shopping.txt`]: [
            'shopping list',
            '- birdseed (the posh kind)',
            '- black coat polish',
            '- torch',
            '- more spoons'
        ].join('\n'),
        [`${HOME}/usb/readme.txt`]: 'if found, please return to mags pye.\nno reward. caw!'
    },

    missions: [
        {
            id: 'casefile', title: 'Open the case file', tutorial: true,
            story: 'Files live in folders on the computer. Python opens a file with <code>open("name")</code>. Using <code>with</code> means Python closes the file for you when you\'re finished, which is good detective manners.',
            task: 'Open <code>case_file.txt</code>, read it with <code>.read()</code> and print what it says.',
            tools: ['open'],
            hints: [
                'The file name goes in quotes inside <code>open()</code>.',
                'Lines inside the <code>with</code> need 4 spaces in front.'
            ],
            try: ['with open("case_file.txt") as f:\n    text = f.read()\nprint(text)'],
            learn: '<code>with open("case_file.txt") as f:</code> opens the file and calls it <code>f</code>. <code>f.read()</code> gives you everything inside as one big string.',
            done: e => opened(e, '/case_file.txt')
        },
        {
            id: 'diary', title: 'Read the diary', tutorial: true,
            story: 'The case file says the diary is in a folder called <code>usb</code>. To open a file inside a folder, put the folder name first, then a slash: <code>"usb/diary.txt"</code>.',
            task: 'Open <code>usb/diary.txt</code> and print the whole thing.',
            tools: ['open'],
            hints: [
                'It\'s the same as before, but with a different file name.',
                '<code>with open("usb/diary.txt") as f:</code>'
            ],
            try: ['with open("usb/diary.txt") as f:\n    diary = f.read()\nprint(diary)'],
            learn: 'A path like <code>usb/diary.txt</code> means "the file diary.txt inside the folder usb". The slash <code>/</code> separates folders from files.',
            done: e => printed(e, DIARY_LINES[0], DIARY_LINES[DIARY_LINES.length - 1]) && uses(e, /open\s*\(/)
        },
        {
            id: 'count', title: 'How long is it?',
            story: 'That diary goes on and on! <code>f.readlines()</code> reads a file as a <b>list of lines</b> instead of one big string. And you already know how to count the items in a list.',
            task: 'Read the diary with <code>readlines()</code> and print how many lines it has.',
            tools: ['open', 'len', 'lists'],
            hints: [
                '<code>lines = f.readlines()</code> gives you a list.',
                'Then <code>print(len(lines))</code>'
            ],
            try: ['with open("usb/diary.txt") as f:\n    lines = f.readlines()\nprint(len(lines))'],
            learn: '<code>readlines()</code> turns a file into a list, one item per line. Then <code>len()</code> tells you how many lines there are.',
            clue: 'Add the number of lines to the Evidence Board →',
            evidence: ['lines'],
            done: e => uses(e, /len\s*\(/, /readlines|for\s+\w+\s+in/) && printed(e, String(LINE_COUNT))
        },
        {
            id: 'line42', title: 'The secret on line 42',
            story: 'Did you spot it? The Magpie hides the big secret on <b>line 42</b>. Counting 42 lines by hand is no job for a detective. But careful: lists start counting at <b>0</b>, so line 1 is <code>lines[0]</code>...',
            task: 'Print <b>just</b> line 42 of the diary, and nothing else.',
            tools: ['lists', 'enumerate', 'strip'],
            hints: [
                'If line 1 is <code>lines[0]</code>, then line 42 is <code>lines[41]</code>.',
                'Don\'t print the whole diary in the same run. Only line 42! Add <code>.strip()</code> to remove the newline at the end.'
            ],
            try: ['with open("usb/diary.txt") as f:\n    lines = f.readlines()\nprint(lines[41].strip())'],
            learn: 'Lists count from 0, so the 42nd line is <code>lines[41]</code>. Another way is <code>for number, line in enumerate(lines, 1):</code>, which counts from 1 for you.',
            clue: 'That\'s the Magpie\'s next target! Add it to the Evidence Board →',
            evidence: ['target'],
            done: e => printed(e, TARGET_LINE) && !e.stdout.includes(DIARY_LINES[40]) && !e.stdout.includes(DIARY_LINES[42])
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'Inspector Ada needs to know where the Magpie is going next, and fast!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['What does line 42 say? And how many lines did <code>len(lines)</code> print?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'target', label: '1. Where is the Magpie\'s next target?', ph: 'a building in Brighton',
          check: v => v.includes('pavilion'),
          tip: 'The secret is on line 42 of usb/diary.txt. Remember: lines[41]!',
          tips: { 'palace pier': 'The pier is a hiding place, not the next target. Look at line 42 exactly.' } },
        { id: 'lines', label: '2. How many lines are in the diary?', ph: 'a number',
          check: v => v === String(LINE_COUNT),
          tip: 'lines = f.readlines(), then print(len(lines)).' },
        { id: 'shiny', label: 'How many times does the word "shiny" appear in the diary?', bonus: true, ph: 'a number',
          check: v => v === String(SHINY_COUNT),
          tip: 'Read the diary as one big string with f.read(), then use .count("shiny").' }
    ],

    bonus: [
        { title: 'Shiny count.', text: 'How many times does the Magpie write "shiny"? Read the whole diary with <code>f.read()</code>, then use <code>.count()</code>. That\'s a bonus answer!', code: 'with open("usb/diary.txt") as f:\n    diary = f.read()\nprint(diary.count("shiny"))' },
        { title: 'Number every line.', text: '<code>enumerate()</code> counts for you while you loop.', code: 'with open("usb/diary.txt") as f:\n    for number, line in enumerate(f, 1):\n        print(number, line.strip())' },
        { title: 'The other files.', text: 'There are other files in the <code>usb</code> folder too. Can you open <code>usb/shopping.txt</code> and <code>usb/readme.txt</code>?' }
    ]
});
})();
