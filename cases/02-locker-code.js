// CASE 2 (EASY): The Locker Code
// Maths (// % **), str() and int(), if/else. No files yet.
(() => {
const HOME = '/home/detective';
const D1 = Math.floor(3600 / 900);         // 4
const D2 = 2026 % 7;                       // 3
const D3 = (15 + 27) * 2 - 77;             // 7
const D4 = 2 ** 3;                         // 8
const CODE = `${D1}${D2}${D3}${D4}`;       // "4378"
const BUS = Math.floor(Number(CODE) / 100) + Number(CODE) % 100;   // 121
const RECEIPT = 3 * 85 + 2 * 120;          // 495

CASES.push({
    id: 'locker-code',
    title: 'The Locker Code',
    icon: '🔢',
    difficulty: 'easy',
    xp: 100,
    hintCost: 0,
    requires: 'first-contact',
    summary: 'At the Bandstand, Byte sniffs out a locked locker covered in the Magpie\'s maths riddles. Use Python as a calculator to crack the combination.',
    skills: ['maths', '// and %', 'str() / int()', 'if / else'],
    home: HOME,
    intro: [
        '\x1b[1mThe Bandstand, 7:42am.\x1b[0m Byte the robot dog 🐕 is barking at a rusty locker.',
        'It has a \x1b[93m4-digit combination lock\x1b[0m, and someone has scratched riddles into the door:',
        '',
        '  \x1b[96mDigit 1:\x1b[0m the seconds in an hour (3600), whole-number divided by 900',
        '  \x1b[96mDigit 2:\x1b[0m the remainder when 2026 is divided by 7',
        '  \x1b[96mDigit 3:\x1b[0m 15 plus 27, times 2, take away 77',
        '  \x1b[96mDigit 4:\x1b[0m 2 to the power of 3',
        '',
        'Signed with a feather. \x1b[96mThe Magpie\x1b[0m again!'
    ],
    starter: [
        '# The Locker Code',
        '# Python is a brilliant calculator. Try running this:',
        '',
        'print(10 + 5)',
        ''
    ].join('\n'),
    files: {},

    missions: [
        {
            id: 'digit1', title: 'Python the calculator', tutorial: true,
            story: 'Python can do sums faster than any detective. <code>+</code> adds, <code>-</code> takes away, <code>*</code> multiplies and <code>/</code> divides. But <code>/</code> gives answers like <code>4.0</code>. For a whole number, use <code>//</code>.',
            task: 'Work out <b>digit 1</b>: print <code>3600 // 900</code>.',
            tools: ['maths', 'print'],
            hints: [
                'Two slashes <code>//</code> means "divide and give me a whole number".',
                'Put the sum inside print: <code>print(3600 // 900)</code>'
            ],
            try: ['d1 = 3600 // 900\nprint(d1)'],
            learn: '<code>//</code> divides and throws away anything after the decimal point, so <code>3600 // 900</code> is <code>4</code>, not <code>4.0</code>.',
            done: e => uses(e, /3600\s*\/\/\s*900/) && printed(e, String(D1))
        },
        {
            id: 'digits', title: 'Remainders and powers', tutorial: true,
            story: 'The other riddles need two more maths tricks. <code>%</code> gives the <b>remainder</b> after dividing (<code>7 % 2</code> is <code>1</code>), and <code>**</code> means "to the power of" (<code>2 ** 3</code> is 2 × 2 × 2).',
            task: 'Work out <b>digits 2, 3 and 4</b>. Store each in a variable (<code>d2</code>, <code>d3</code>, <code>d4</code>) and print them.',
            tools: ['maths', 'variables'],
            hints: [
                'Digit 2 is <code>2026 % 7</code>.',
                'Digit 3 needs brackets: <code>(15 + 27) * 2 - 77</code>. Digit 4 is <code>2 ** 3</code>.'
            ],
            try: ['d2 = 2026 % 7\nd3 = (15 + 27) * 2 - 77\nd4 = 2 ** 3\nprint(d2, d3, d4)'],
            learn: '<code>%</code> gives the remainder and <code>**</code> does powers. Brackets work like in maths class: Python does the bit inside them first.',
            done: e => uses(e, /%/, /\*\*/) && printed(e, String(D2)) && printed(e, String(D3)) && printed(e, String(D4))
        },
        {
            id: 'combine', title: 'Build the combination',
            story: 'You have four digits, but the lock wants one 4-digit code. If you add the numbers together with <code>+</code> you\'ll get a sum (<code>4 + 3 + 7 + 8</code> is 22). That\'s no good! Turn each number into <b>text</b> with <code>str()</code>, then <code>+</code> joins them instead.',
            task: 'Make <code>code = str(d1) + str(d2) + str(d3) + str(d4)</code> and print it. (Make sure all four digit variables are in this run!)',
            tools: ['int/str', 'strings'],
            hints: [
                'If you see <b>TypeError</b>, you probably tried to join text and a number. Wrap each number in <code>str()</code>.',
                'You need all of d1, d2, d3 and d4 in your code, then <code>code = str(d1) + str(d2) + str(d3) + str(d4)</code>.'
            ],
            try: ['code = str(d1) + str(d2) + str(d3) + str(d4)\nprint(code)'],
            learn: '<code>str(4)</code> turns the number 4 into the text <code>"4"</code>. Adding numbers does maths, but adding text joins it: <code>"4" + "3"</code> is <code>"43"</code>.',
            clue: 'That\'s the combination! Add it to the Evidence Board →',
            evidence: ['combination'],
            done: e => uses(e, /str\s*\(/) && printed(e, CODE)
        },
        {
            id: 'alarm', title: 'Is it safe to open?',
            story: 'Byte spots a warning sticker: <i>"Alarm fitted. It goes off if the combination is more than 5000."</i> Python can make decisions with <code>if</code> and <code>else</code>. But to compare <code>code</code> with 5000 you need it as a <b>number</b> again, and <code>int()</code> does that.',
            task: 'Use <code>if</code> / <code>else</code> to print <code>ALARM</code> if <code>int(code)</code> is more than 5000, or <code>SAFE</code> if it isn\'t.',
            tools: ['if', 'int/str'],
            hints: [
                '<code>if int(code) > 5000:</code> needs a colon at the end, and the next line needs 4 spaces in front.',
                'Under it, <code>print("ALARM")</code>. Then <code>else:</code> and <code>print("SAFE")</code>, both indented the same way.'
            ],
            try: ['if int(code) > 5000:\n    print("ALARM")\nelse:\n    print("SAFE")'],
            learn: '<code>if</code> runs the indented lines only when its test is true, and <code>else</code> runs when it isn\'t. <code>int("4378")</code> turns text back into a number you can compare.',
            done: e => uses(e, /\bif\b[^\n]*>/, /\belse\s*:/) && printed(e, 'SAFE')
        },
        {
            id: 'bus', title: 'The bus ticket',
            story: 'Click! The locker opens. Inside is a crumpled bus ticket. The bus number has been torn off, but someone has written: <i>"My bus = the first two digits of the code + the last two digits."</i> With <code>number = int(code)</code>, <code>number // 100</code> gives the first two digits (43) and <code>number % 100</code> gives the last two (78).',
            task: 'Print <code>number // 100 + number % 100</code> to find the bus number.',
            tools: ['maths', 'int/str'],
            hints: [
                'First make a number: <code>number = int(code)</code>',
                '<code>print(number // 100 + number % 100)</code>'
            ],
            try: ['number = int(code)\nbus = number // 100 + number % 100\nprint("Bus number:", bus)'],
            learn: '<code>// 100</code> chops off the last two digits and <code>% 100</code> keeps only the last two. That\'s a handy trick for pulling numbers apart!',
            clue: 'Now you know which bus the Magpie caught. Add it to the Evidence Board →',
            evidence: ['bus'],
            done: e => uses(e, /\/\/\s*100/, /%\s*100/) && printed(e, String(BUS))
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'Inspector Ada is waiting at the Bureau. Tell her what you found in the locker!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['What did <code>print(code)</code> show? And what did your bus sum print?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'combination', label: '1. What is the locker combination?', ph: '4 digits',
          check: v => v === CODE,
          tip: 'Work out each digit with Python, then join them with str().',
          tips: { '22': 'That\'s the four digits ADDED together. Use str() to JOIN them instead!',
                  '4.0378': 'Use // instead of / for digit 1, so it\'s a whole number.' } },
        { id: 'bus', label: '2. Which bus number did the Magpie catch?', ph: 'a number',
          check: v => v === String(BUS),
          tip: 'number = int(code), then print(number // 100 + number % 100).',
          tips: { '4378': 'That\'s the locker code. The bus is the first two digits + the last two digits.' } },
        { id: 'receipt', label: 'How much did the Magpie spend at the café, in pence?', bonus: true, ph: 'a number',
          check: v => v.replace(/p$/, '') === String(RECEIPT),
          tip: 'The receipt says 3 donuts at 85p each and 2 teas at 120p each. Let Python do the sum: 3 * 85 + 2 * 120' }
    ],

    bonus: [
        { title: 'Café receipt.', text: 'There\'s a café receipt in the locker too: <b>3 donuts at 85p</b> and <b>2 teas at 120p</b>. How much did the Magpie spend, in pence? That\'s a bonus answer!', code: 'print(3 * 85 + 2 * 120)' },
        { title: 'Pounds, not pence.', text: 'Turn the total into pounds by dividing by 100. Why does this one need <code>/</code> and not <code>//</code>?', code: 'print(495 / 100)' },
        { title: 'Big numbers.', text: 'Python can handle HUGE numbers. Try <code>2 ** 100</code>.', code: 'print(2 ** 100)' }
    ]
});
})();
