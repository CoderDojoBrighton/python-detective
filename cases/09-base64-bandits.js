// CASE 9 (HARD): Base64 Bandits
// base64, binary with int(x, 2), hex with bytes.fromhex, and a while loop to peel layers.
(() => {
const HOME = '/home/detective';
const BH = `${HOME}/boathouse`;

// Plain ASCII text to base64 / binary / hex, the same way Python does it
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function toBase64(s) {
    let out = '';
    for (let i = 0; i < s.length; i += 3) {
        const [a, b, c] = [0, 1, 2].map(k => s.charCodeAt(i + k));
        const n = (a << 16) | ((b || 0) << 8) | (c || 0);
        out += B64[n >> 18 & 63] + B64[n >> 12 & 63] +
               (i + 1 < s.length ? B64[n >> 6 & 63] : '=') + (i + 2 < s.length ? B64[n & 63] : '=');
    }
    return out;
}
const toBinary = s => [...s].map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
const toHex = s => [...s].map(ch => ch.charCodeAt(0).toString(16).padStart(2, '0')).join('');

const NOTE_PLAIN = 'Jackdaw: we move the shiny things on FRIDAY at midnight. The Magpie will meet you at the nest.';
const DOOR_PLAIN = 'DOOR CODE 4815';
const FLAG = 'FLAG{SHINY-THINGS-NEVER-STAY-HIDDEN}';
const LAYERS = 5;
let onion = FLAG;
for (let i = 0; i < LAYERS; i++) onion = toBase64(onion);
const RECEIPT_PLAIN = 'KEMP TOWN HARDWARE - 1x spade, 2x torch, 1x rope, 1x padlock. Paid cash. Thank you!';

CASES.push({
    id: 'base64-bandits',
    title: 'Base64 Bandits',
    icon: '🧬',
    difficulty: 'hard',
    xp: 350,
    hintCost: 0.1,
    requires: 'caesars-return',
    summary: 'The boathouse on Madeira Drive is empty, but the bandits left files written in base64, binary and hex. Decode every layer to find out what they\'re planning.',
    skills: ['base64', 'int(x, 2)', 'bytes.fromhex()', 'while'],
    home: HOME,
    intro: [
        '\x1b[1mYou burst into the \x1b[93mold boathouse\x1b[0m\x1b[1m at dawn... it\'s empty! 🚤\x1b[0m',
        'The Magpie and the Jackdaw got away, but they left some files behind.',
        '',
        'They look like gobbledygook: letters, ones and zeros, and numbers.',
        'Inspector Ada says they\'re not secret ciphers, just \x1b[92mencodings\x1b[0m: other ways',
        'to write text. Python can decode them all. Look in the \x1b[93mboathouse\x1b[0m folder.'
    ],
    starter: [
        '# Case 9: Base64 Bandits',
        '# The files from the boathouse are in the boathouse folder.',
        '',
        'import os',
        'print(os.listdir("boathouse"))',
        ''
    ].join('\n'),
    files: {
        [`${HOME}/case_file.txt`]: [
            '==================== CASE FILE #0051 ====================',
            ' TO:      Detective',
            ' FROM:    Inspector Ada, Brighton Byte Bureau',
            ' SUBJECT: The boathouse files',
            '',
            ' We found four files in the boathouse:',
            '',
            '   boathouse/note.b64     - lots of letters, ends with =',
            '                            (that smells like BASE64)',
            '   boathouse/door.bin     - just 0s and 1s: BINARY',
            '   boathouse/receipt.hex  - 0-9 and a-f only: HEX',
            '   boathouse/onion.txt    - base64... but decoding it once',
            '                            gives MORE base64. Layers!',
            '',
            ' Decode them all. Byte is sniffing for clues meanwhile.',
            '=========================================================='
        ].join('\n'),
        [`${BH}/note.b64`]: toBase64(NOTE_PLAIN) + '\n',
        [`${BH}/door.bin`]: toBinary(DOOR_PLAIN) + '\n',
        [`${BH}/onion.txt`]: onion + '\n',
        [`${BH}/receipt.hex`]: toHex(RECEIPT_PLAIN) + '\n'
    },

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'print(base64.b64decode(text).decode())': 'Works from the inside out. <code>base64.b64decode(text)</code> turns the base64 back into bytes, <code>.decode()</code> turns those bytes into normal text, and <code>print()</code> shows it.',
        'groups = file.read().split()': 'Reads the whole file, then <code>.split()</code> chops it up wherever there\'s a space. So <code>groups</code> is a list of 8-digit binary groups, one for each letter.',
        'message = ""': 'Makes an empty string called <code>message</code>. The loop will add the letters onto it, one at a time.',
        'message += chr(int(group, 2))': '<code>int(group, 2)</code> turns 8 binary digits into a number (the <code>2</code> means "this is binary"). <code>chr()</code> turns that number into a letter, and <code>+=</code> adds it onto the end of <code>message</code>.',
        'text = file.read().strip()': 'Reads the whole file into <code>text</code>. <code>.strip()</code> removes the invisible "new line" character from the end, which isn\'t part of the message and would get in the way when decoding.',
        'print(bytes.fromhex(text).decode())': 'Works from the inside out. <code>bytes.fromhex(text)</code> turns each pair of hex digits into one byte, <code>.decode()</code> turns the bytes into normal text, and <code>print()</code> shows it.',
        'layers = 0': 'Makes a counter called <code>layers</code>, starting at 0. It goes up by 1 every time a layer is peeled.',
        'while not text.startswith("FLAG{"):': 'A <b>while loop</b>. <code>text.startswith("FLAG{")</code> is True when the text begins with <code>FLAG{</code>, and <code>not</code> flips True and False round. So the indented lines keep repeating <b>until</b> the flag appears.',
        'text = base64.b64decode(text).decode()': 'Peels one layer: decodes the base64 and turns the bytes back into text. The answer goes back into <code>text</code>, so next time round the loop decodes the new, shorter text.',
        'print(base64.b64encode("Agent Sparrow".encode()).decode())': 'Works from the inside out. <code>.encode()</code> turns the text into bytes, <code>base64.b64encode()</code> turns the bytes into base64, and <code>.decode()</code> turns that into a normal string for <code>print()</code> to show.',
        'for letter in "Byte":': 'A <b>loop</b> over the text <code>"Byte"</code>: it goes round once for each letter, putting it in <code>letter</code>. Swap in your own name!',
        'print(letter, format(ord(letter), "08b"))': 'Shows the letter, then its number written in binary. <code>ord(letter)</code> gives the number, and <code>format(..., "08b")</code> writes it in binary (<code>b</code>) with 8 digits, adding 0s at the front if needed (<code>08</code>).'
    },

    missions: [
        {
            id: 'b64', title: 'Decode the base64 note',
            story: 'Inspector Ada says these files aren\'t secret ciphers. They\'re <b>encodings</b>: different ways of writing the same thing, like writing "7" or "seven". Anyone who knows the encoding can read it.<br><br><b>Base64</b> writes any data using only 64 safe characters: A to Z, a to z, 0 to 9, + and /. Emails use it to send photos as plain text. The <code>=</code> signs at the end are padding, to make the length come out right.<br><br>Python\'s <code>base64</code> module (a toolkit you load with <code>import</code>) can turn it back. One twist: it gives you <b>bytes</b>, not text. Bytes are the raw numbers a computer stores, and they print like <code>b\'Hello\'</code>. <code>.decode()</code> turns bytes into a normal string.',
            task: 'Read <code>boathouse/note.b64</code>, decode it with <code>base64.b64decode()</code>, and print the message as text.',
            tools: ['base64', 'open'],
            hints: [
                'Start with <code>import base64</code> at the top.',
                '<code>base64.b64decode(text)</code> gives you <b>bytes</b> (they print like <code>b\'...\'</code>).',
                'Turn the bytes into a normal string with <code>.decode()</code>: <code>print(base64.b64decode(text).decode())</code>'
            ],
            try: ['import base64\n\nwith open("boathouse/note.b64") as file:\n    text = file.read()\n\nprint(base64.b64decode(text).decode())'],
            learn: '<code>base64.b64decode()</code> turns base64 into <b>bytes</b>, and <code>.decode()</code> turns bytes into a string. Base64 isn\'t secret: anyone can decode it!',
            clue: 'The note says WHEN they\'re moving the loot. Add the day to the Evidence Board →',
            evidence: ['day'],
            done: e => uses(e, /b64decode/) && printed(e, NOTE_PLAIN)
        },
        {
            id: 'binary', title: 'Crack the binary door code',
            story: 'Deep down, computers only store <b>0s and 1s</b>. That\'s called <b>binary</b>. We count with ten digits (0 to 9), but binary counts with just two. So each place is worth double the one to its right: 128, 64, 32, 16, 8, 4, 2, 1.<br><br>A group of 8 binary digits is one <b>byte</b>, and here each byte is one letter\'s number. <code>01000001</code> has a 1 in the 64 place and a 1 in the 1 place: 64 + 1 = 65, which is <code>"A"</code>.<br><br><code>int("01000001", 2)</code> does that sum for you. The <code>2</code> tells <code>int()</code> that the text is in base 2 (binary). Then <code>chr()</code>, from the last case, turns the number into a letter.',
            task: 'Read <code>boathouse/door.bin</code>, turn each group of 8 binary digits into a letter, and print the message.',
            tools: ['split', 'ord/chr', 'base64'],
            hints: [
                '<code>file.read().split()</code> chops the file into a list of 8-digit groups, wherever there\'s a space.',
                '<code>int("01000001", 2)</code> reads a string as a base-2 (binary) number, giving 65.',
                'Loop over the groups and add <code>chr(int(group, 2))</code> to a string each time.'
            ],
            try: ['with open("boathouse/door.bin") as file:\n    groups = file.read().split()\n\nmessage = ""\nfor group in groups:\n    message += chr(int(group, 2))\nprint(message)'],
            learn: '<code>int(text, 2)</code> reads binary. Binary is counting with only two digits: 1, 10, 11, 100... Each place is worth double the one before: 128, 64, 32, 16, 8, 4, 2, 1.',
            clue: 'That\'s the door code! Add it to the Evidence Board →',
            evidence: ['door'],
            done: e => uses(e, /int\s*\([^)]*,\s*2\s*\)/, /chr\s*\(/) && printed(e, DOOR_PLAIN)
        },
        {
            id: 'hex', title: 'Read the hex receipt',
            story: '<b>Hex</b> (short for hexadecimal) counts in 16s. That needs 16 different digits, so after 0 to 9 it uses the letters a to f: a is 10, b is 11, all the way to f, which is 15.<br><br>Two hex digits make one byte. <code>41</code> means four 16s and one 1: 64 + 1 = 65, which is <code>"A"</code> again! Programmers love hex because it\'s much shorter than binary.<br><br><code>bytes.fromhex()</code> turns hex into bytes, and you already know how to turn bytes into text: <code>.decode()</code>.',
            task: 'Read <code>boathouse/receipt.hex</code>, decode it with <code>bytes.fromhex()</code>, and print what it says.',
            tools: ['base64'],
            hints: [
                '<code>bytes.fromhex(text)</code> turns hex into bytes. It\'s built in, so it doesn\'t need an import!',
                'Bytes need <code>.decode()</code> to become a string. There\'s an invisible "new line" at the end of the file, so <code>.strip()</code> it off first.'
            ],
            try: ['with open("boathouse/receipt.hex") as file:\n    text = file.read().strip()\n\nprint(bytes.fromhex(text).decode())'],
            learn: '<code>bytes.fromhex()</code> decodes hex. Hex <code>ff</code> is 255, the biggest number one byte can hold.',
            clue: 'A shopping receipt! There\'s a bonus question about it in the 🏆 Bonus tab →',
            evidence: ['torch'],
            done: e => uses(e, /fromhex/) && printed(e, RECEIPT_PLAIN)
        },
        {
            id: 'onion', title: 'Peel the onion',
            story: 'Decoding <code>onion.txt</code> once just gives you... more base64! The Magpie wrapped the secret up in layer after layer, like an onion 🧅. You don\'t know how many layers there are, so a <code>for</code> loop won\'t do: it needs something to count through.<br><br>A <b>while loop</b> is different. It keeps repeating <b>as long as</b> its test is True, and stops as soon as the test is False. So <code>while not text.startswith("FLAG{"):</code> means "keep going while the text does <b>not</b> start with <code>FLAG{</code>". Each time round, peel off one layer.',
            task: 'Keep base64-decoding <code>boathouse/onion.txt</code> until you reach text that starts with <code>FLAG{</code>, then print it. Can you also count the layers?',
            tools: ['base64', 'startswith'],
            hints: [
                'A <code>while</code> loop repeats as long as its test is True: <code>while not text.startswith("FLAG{"):</code>',
                'Inside the loop, replace text with its decoded version: <code>text = base64.b64decode(text).decode()</code>',
                'Make sure you <code>.strip()</code> the newline off the file first, and print <code>text</code> AFTER the loop finishes.'
            ],
            try: ['import base64\n\nwith open("boathouse/onion.txt") as file:\n    text = file.read().strip()\n\nlayers = 0\nwhile not text.startswith("FLAG{"):\n    text = base64.b64decode(text).decode()\n    layers += 1\n\nprint(layers, "layers:", text)'],
            learn: 'A <code>while</code> loop is perfect when you don\'t know how many times to repeat. Just make sure something inside it changes, or it will loop forever!',
            clue: 'You\'ve found the flag! Add it to the Evidence Board →',
            evidence: ['flag'],
            done: e => uses(e, /\bwhile\b/, /b64decode/) && printed(e, FLAG)
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'Every file is decoded. Byte wags his tail: he\'s found muddy footprints heading for the Palace Pier... 🐾',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['The day is in the base64 note. The code is in the binary file. The flag is in the middle of the onion.'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'day', label: '1. Which day are the bandits moving the loot?', ph: 'a day of the week',
          check: v => v === 'friday',
          tip: 'Base64-decode boathouse/note.b64 and read it.' },
        { id: 'door', label: '2. What is the door code?', ph: 'four digits',
          check: v => v.replace(/\D/g, '') === '4815',
          tip: 'Turn each 8-digit group in door.bin into a letter with chr(int(group, 2)).' },
        { id: 'flag', label: '3. What is the flag hidden in the onion?', ph: 'FLAG{...}',
          check: v => v.replace(/\s/g, '') === FLAG.toLowerCase(),
          tip: 'Keep decoding onion.txt in a while loop until it starts with FLAG{. Copy the whole thing, curly brackets too.' },
        { id: 'torch', label: 'What did the bandits buy TWO of?', bonus: true, ph: 'one word',
          check: v => v.startsWith('torch'),
          tip: 'Decode receipt.hex with bytes.fromhex(...).decode() and look for "2x".' }
    ],

    bonus: [
        { title: 'Encode it back.', text: 'Can you base64-<b>encode</b> your codename? <code>b64encode()</code> only takes bytes, so use <code>.encode()</code> first. It\'s the opposite of <code>.decode()</code>: it turns text into bytes.', code: 'import base64\nprint(base64.b64encode("Agent Sparrow".encode()).decode())' },
        { title: 'Your name in binary.', text: 'Print every letter of your name as 8 binary digits. <code>format(65, "08b")</code> gives <code>"01000001"</code>.', code: 'for letter in "Byte":\n    print(letter, format(ord(letter), "08b"))' },
        { title: 'Hex detective.', text: 'What is <code>int("ff", 16)</code>? And <code>hex(255)</code>?' }
    ]
});
})();
