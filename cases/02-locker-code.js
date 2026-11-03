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
        '# Python is a brilliant calculator.',
        '# Put a sum inside print() and it shows you the answer.',
        '# Numbers don\'t need quotes. Press Run to try it!',
        '',
        'print(10 + 5)',
        ''
    ].join('\n'),
    files: {},

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'digit1 = 3600 // 900': 'Works out <code>3600 // 900</code> and puts the answer in a <b>variable</b> (a labelled box) called <code>digit1</code>. <code>//</code> means "divide, and keep only the whole number". We picked the name <code>digit1</code> because it holds the first digit, but the name is your choice.',
        'print(digit1)': 'Shows what\'s inside <code>digit1</code>: the first digit of the lock.',
        'digit2 = 2026 % 7': 'Divides 2026 by 7 and puts the <b>remainder</b> (what\'s left over) in a variable called <code>digit2</code>. In Python, <code>%</code> means "remainder", not percent.',
        'digit3 = (15 + 27) * 2 - 77': 'Works out the sum and puts the answer in <code>digit3</code>. Python does the part in brackets first, just like in maths class. <code>*</code> means times.',
        'digit4 = 2 ** 3': 'Works out 2 to the power of 3 (2 × 2 × 2) and puts the answer in <code>digit4</code>. <code>**</code> means "to the power of".',
        'print(digit2, digit3, digit4)': 'Shows all three digits on one line. The commas separate the things to print, and Python puts a space between each one.',
        'combination = str(digit1) + str(digit2) + str(digit3) + str(digit4)': 'Turns each digit into text with <code>str()</code>, then glues the four bits of text together, in order, with <code>+</code>. The result goes in a new variable called <code>combination</code>.',
        'print(combination)': 'Shows what\'s inside <code>combination</code>: the four digits side by side.',
        'if int(combination) > 5000:': 'Turns <code>combination</code> into a number with <code>int()</code> and asks: is it more than 5000? <code>&gt;</code> means "more than". The colon <code>:</code> at the end says "the lines that belong to this <code>if</code> come next".',
        'else:': 'Means "otherwise". If the <code>if</code> test was false (the number is 5000 or less), the indented line below runs instead.',
        'number = int(combination)': 'Turns the text in <code>combination</code> into a whole number with <code>int()</code>, and puts it in a variable called <code>number</code>, so you can do maths with it.',
        'bus = number // 100 + number % 100': 'Works out the first two digits (<code>number // 100</code>) plus the last two digits (<code>number % 100</code>), and puts the answer in a variable called <code>bus</code>.',
        'print("Bus number:", bus)': 'Shows the words <code>Bus number:</code> followed by what\'s inside <code>bus</code>. The comma puts a space between them.',
        'print(3 * 85 + 2 * 120)': 'Works out 3 donuts at 85p plus 2 teas at 120p, and shows the total. Python does the <code>*</code> (times) parts before the <code>+</code>, just like in maths.',
        'print(495 / 100)': 'Divides 495 by 100 with a single <code>/</code>, which keeps the decimal point, so you see pounds <b>and</b> pence.',
        'print(2 ** 100)': 'Works out 2 to the power of 100 (a hundred 2s multiplied together!) and shows it.'
    },

    missions: [
        {
            id: 'digit1', title: 'Python the calculator', tutorial: true,
            story: 'Python is a brilliant calculator. Put a sum inside <code>print()</code> and it shows you the answer. Numbers don\'t need quotes: <code>print(10 + 5)</code> shows <code>15</code>, but <code>print("10 + 5")</code> just shows the text 10 + 5.<br><br>Some maths signs look different on a keyboard. <code>+</code> adds, <code>-</code> takes away, <code>*</code> (a star) multiplies and <code>/</code> divides.<br><br>But <code>/</code> always gives an answer with a decimal point, like <code>4.0</code>. A lock digit can\'t be 4.0! Two slashes, <code>//</code>, divide and give you a <b>whole number</b>.',
            task: 'Work out <b>digit 1</b>: print <code>3600 // 900</code>.<br><br>The code below also saves the answer in a variable called <code>digit1</code>, so you can use it again later.',
            tools: ['maths', 'print'],
            hints: [
                'Two slashes <code>//</code> means "divide and give me a whole number".',
                'Put the sum inside print: <code>print(3600 // 900)</code>'
            ],
            try: ['digit1 = 3600 // 900\nprint(digit1)'],
            learn: '<code>//</code> divides and throws away anything after the decimal point, so <code>3600 // 900</code> is <code>4</code>, not <code>4.0</code>. You can print a sum straight away, or keep the answer in a variable to use later.',
            done: e => uses(e, /3600\s*\/\/\s*900/) && printed(e, String(D1))
        },
        {
            id: 'digits', title: 'Remainders and powers', tutorial: true,
            story: 'Two more maths tricks will crack the other riddles.<br><br><code>%</code> gives the <b>remainder</b>: what\'s left over after dividing. Share 7 sweets between 2 people and they get 3 each, with 1 left over. So <code>7 % 2</code> is <code>1</code>. (In Python, <code>%</code> has nothing to do with percentages!)<br><br><code>**</code> means "to the power of": <code>3 ** 2</code> is 3 × 3, which is 9.',
            task: 'Work out <b>digits 2, 3 and 4</b>. Save each answer in its own variable, then print them.<br><br>Good names say what\'s inside, so <code>digit2</code>, <code>digit3</code> and <code>digit4</code> are perfect. To print several things at once, put commas between them: <code>print(digit2, digit3, digit4)</code>.',
            tools: ['maths', 'variables'],
            hints: [
                'Digit 2 is <code>2026 % 7</code>.',
                'Digit 3 needs brackets: <code>(15 + 27) * 2 - 77</code>. Digit 4 is <code>2 ** 3</code>.'
            ],
            try: ['digit2 = 2026 % 7\ndigit3 = (15 + 27) * 2 - 77\ndigit4 = 2 ** 3\nprint(digit2, digit3, digit4)'],
            learn: '<code>%</code> gives the remainder and <code>**</code> does powers. Brackets work like in maths class: Python does the bit inside them first.',
            done: e => uses(e, /%/, /\*\*/) && printed(e, String(D2)) && printed(e, String(D3)) && printed(e, String(D4))
        },
        {
            id: 'combine', title: 'Build the combination',
            story: 'You have four digits, and the lock wants them side by side as one 4-digit code. But if you put numbers together with <code>+</code>, Python adds them up: <code>4 + 3</code> is <code>7</code>. That\'s no good!<br><br>Remember how <code>+</code> <b>joined</b> the scraps of the Magpie\'s note? That works for text (strings), not numbers. Python treats them as different things. <code>str()</code> turns a number into text: <code>str(4)</code> is <code>"4"</code>. Turn each digit into text, and then <code>+</code> joins them instead of adding.',
            task: 'Make a variable called <code>combination</code> that joins the four digits as text, then print it:<br><code>combination = str(digit1) + str(digit2) + str(digit3) + str(digit4)</code><br><br>Each press of Run starts fresh, so the lines that make <code>digit1</code> to <code>digit4</code> must be in your code too, above this line.',
            tools: ['int/str', 'strings'],
            hints: [
                'Got <code>22</code>? That\'s the digits <b>added up</b>. Wrap each one in <code>str()</code> so they join instead. A <b>NameError</b> means one of the digit variables isn\'t in your code, or is spelled differently.',
                '<code>combination = str(digit1) + str(digit2) + str(digit3) + str(digit4)</code> then <code>print(combination)</code>'
            ],
            try: ['combination = str(digit1) + str(digit2) + str(digit3) + str(digit4)\nprint(combination)'],
            learn: '<code>str(4)</code> turns the number 4 into the text <code>"4"</code>. Adding numbers does maths, but adding text joins it: <code>4 + 3</code> is <code>7</code>, but <code>"4" + "3"</code> is <code>"43"</code>.',
            clue: 'That\'s the combination! Add it to the Evidence Board →',
            evidence: ['combination'],
            done: e => uses(e, /str\s*\(/) && printed(e, CODE)
        },
        {
            id: 'alarm', title: 'Is it safe to open?',
            story: 'Byte spots a warning sticker: <i>"Alarm fitted. It goes off if the combination is more than 5000."</i><br><br>Programs can make decisions with <code>if</code>. An <code>if</code> line asks a yes or no question, like <code>if number > 5000:</code> ("is the number more than 5000?"). If the answer is yes, Python runs the lines underneath it. <code>else:</code> means "otherwise": its lines run when the answer is no.<br><br>Those lines underneath must be <b>indented</b>: pushed in with 4 spaces. That\'s how Python knows they belong to the <code>if</code> or the <code>else</code>.<br><br>One snag: <code>combination</code> holds <b>text</b>, and Python can\'t tell if text is more than 5000. <code>int()</code> turns text back into a number: <code>int("12")</code> is <code>12</code>.',
            task: 'Use <code>if</code> and <code>else</code> to print <code>ALARM</code> if <code>int(combination)</code> is more than 5000, or <code>SAFE</code> if it isn\'t.',
            tools: ['if', 'int/str'],
            hints: [
                'Start with <code>if int(combination) > 5000:</code> and don\'t forget the colon <code>:</code> at the end. The next line needs 4 spaces in front.',
                'Under it, <code>print("ALARM")</code>. Then <code>else:</code> with no spaces in front, and <code>print("SAFE")</code> with 4 spaces in front.'
            ],
            try: ['if int(combination) > 5000:\n    print("ALARM")\nelse:\n    print("SAFE")'],
            learn: '<code>if</code> runs its indented lines only when its test is true, and <code>else</code> runs its lines when it isn\'t. The colon and the 4 spaces matter! <code>int("4378")</code> turns text back into a number you can compare.',
            done: e => uses(e, /\bif\b[^\n]*>/, /\belse\s*:/) && printed(e, 'SAFE')
        },
        {
            id: 'bus', title: 'The bus ticket',
            story: 'Click! The locker opens. Inside is a crumpled bus ticket. The bus number has been torn off, but someone has written: <i>"My bus = the first two digits of the combination + the last two digits."</i><br><br>First, turn the combination into a number: <code>number = int(combination)</code>. Then two tricks you already know can pull it apart. <code>number // 100</code> divides by 100 and drops the remainder, which leaves the first two digits (43). <code>number % 100</code> is that remainder, which is the last two digits (78).',
            task: 'Print <code>number // 100 + number % 100</code> to find the bus number.',
            tools: ['maths', 'int/str'],
            hints: [
                'First make a number: <code>number = int(combination)</code>',
                '<code>print(number // 100 + number % 100)</code>'
            ],
            try: ['number = int(combination)\nbus = number // 100 + number % 100\nprint("Bus number:", bus)'],
            learn: '<code>// 100</code> chops off the last two digits and <code>% 100</code> keeps only the last two. That\'s a handy trick for pulling numbers apart!',
            clue: 'Now you know which bus the Magpie caught. Add it to the Evidence Board →',
            evidence: ['bus'],
            done: e => uses(e, /\/\/\s*100/, /%\s*100/) && printed(e, String(BUS))
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'Inspector Ada is waiting at the Bureau. Tell her what you found in the locker!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['What did <code>print(combination)</code> show? And what did your bus sum print?'],
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
          tip: 'number = int(combination), then print(number // 100 + number % 100).',
          tips: { '4378': 'That\'s the locker combination. The bus is the first two digits + the last two digits.' } },
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
