// CASE 10 (HARD): Lock It Down (finale of Arc 1)
// hashlib, cracking a hash with a wordlist, XOR, and writing an encrypted file.
(() => {
const HOME = '/home/detective';
const NEST = `${HOME}/nest`;

const PASSWORD = 'rockpool77';
const PASSWORD_SHA256 = 'f96907048863b724a87bc6ae105dd5ce960c67221b94bb5c8589751485a045ef';   // sha256('rockpool77')
const BASE = [
    'seagull', 'pebble', 'deckchair', 'sandcastle', 'icecream', 'candyfloss', 'lighthouse', 'kipper',
    'starfish', 'jellyfish', 'seaweed', 'bandstand', 'carousel', 'promenade', 'pavilion', 'donut',
    'fishandchips', 'shingle', 'lifeguard', 'surfboard', 'windbreak', 'bucket', 'spade', 'crab',
    'lobster', 'oyster', 'mussel', 'anchor', 'harbour', 'sailboat', 'paddle', 'flipflop',
    'sunhat', 'sunscreen', 'parasol', 'beachball', 'arcade', 'helterskelter', 'rollercoaster', 'dodgems',
    'jackdaw', 'magpie', 'pigeon', 'starling', 'cormorant', 'puffin', 'penguin', 'albatross',
    'treasure', 'goldcoin', 'silverspoon', 'diamond', 'emerald', 'sapphire', 'necklace', 'trophy',
    'shiny', 'sparkle', 'glitter', 'twinkle', 'moonlight', 'midnight', 'sunrise', 'sunset',
    'brighton', 'hove', 'rottingdean', 'kemptown', 'lanes', 'westpier', 'palacepier', 'volks',
    'password', 'letmein', 'qwerty', 'iloveyou', 'dragon', 'monkey', 'football', 'princess',
    'secret', 'hidden', 'nest', 'feather', 'beak', 'wings', 'thief', 'loot',
    'boathouse', 'madeira', 'esplanade', 'groyne', 'tidepool', 'saltwater', 'driftwood', 'barnacle'
];
const WORDS = BASE.flatMap((w, i) => i % 2 ? [w, w + ((i * 37) % 90 + 10)] : [w]);
WORDS.splice(97, 0, PASSWORD);
const LONG_WORDS = WORDS.filter(w => w.length > 8).length;

const XOR_KEY = 42;
const VAULT_MSG = 'My real name is Margot Pye. The Golden Deckchair is hidden under the Palace Pier.';
const VAULT_HEX = [...VAULT_MSG].map(ch => (ch.charCodeAt(0) ^ XOR_KEY).toString(16).padStart(2, '0')).join('');

const shiftText = (s, n) => s.replace(/[A-Za-z]/g, ch => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + n) % 26 + 26) % 26 + base);
});

CASES.push({
    id: 'lock-it-down',
    title: 'Lock It Down',
    icon: '🔐',
    difficulty: 'hard',
    xp: 400,
    hintCost: 0.1,
    requires: 'base64-bandits',
    summary: 'The Bureau has found the Magpie\'s nest, and their laptop is locked. Crack a password hash, unlock an XOR vault and send Inspector Ada an encrypted report. The finale!',
    skills: ['hashlib', 'wordlists', 'XOR ^', 'writing files'],
    home: HOME,
    intro: [
        '\x1b[1mFriday, midnight. Byte\'s nose leads you under the \x1b[93mPalace Pier\x1b[0m\x1b[1m... 🐾\x1b[0m',
        'Behind a loose board is the \x1b[96mMagpie\'s nest\x1b[0m: piles of shiny things and a laptop.',
        'The Magpie is nowhere to be seen, and the laptop is \x1b[91mlocked\x1b[0m.',
        '',
        'This is it, Detective. Unlock the laptop, find out who the Magpie really is,',
        'and find the \x1b[93mGolden Deckchair\x1b[0m. Everything is in the \x1b[93mnest\x1b[0m folder.'
    ],
    starter: [
        '# Case 10: Lock It Down',
        '# Everything from the Magpie\'s nest is in the nest folder.',
        '',
        'import os',
        'print(os.listdir("nest"))',
        ''
    ].join('\n'),
    files: {
        [`${HOME}/case_file.txt`]: [
            '==================== CASE FILE #0052 ====================',
            ' TO:      Detective',
            ' FROM:    Inspector Ada, Brighton Byte Bureau',
            ' SUBJECT: The Magpie\'s nest  ** TOP PRIORITY **',
            '',
            ' The laptop doesn\'t store the password itself, only its',
            ' HASH (a fingerprint). You can\'t turn a hash back into',
            ' a password... but you CAN hash lots of guesses and see',
            ' which one matches!',
            '',
            '   nest/password.sha256  - the SHA-256 hash of the password',
            '   nest/wordlist.txt     - the Magpie\'s favourite words',
            '   nest/vault.hex        - an XOR-locked secret file',
            '   nest/sticky_note.txt  - found stuck to the screen',
            '',
            ' When you\'re done, send me your report ENCRYPTED.',
            ' The Jackdaw might be listening.',
            '=========================================================='
        ].join('\n'),
        [`${NEST}/password.sha256`]: PASSWORD_SHA256 + '\n',
        [`${NEST}/wordlist.txt`]: WORDS.join('\n') + '\n',
        [`${NEST}/vault.hex`]: VAULT_HEX + '\n',
        [`${NEST}/sticky_note.txt`]: [
            'Jackdaw - the vault is XOR-locked with the key 42.',
            'Each pair of hex digits is one byte. XOR each byte with 42 to unlock it.',
            'Do NOT tell anyone!!  - M'
        ].join('\n') + '\n'
    },

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'print(hashlib.sha256("seagull".encode()).hexdigest())': 'Works from the inside out. <code>"seagull".encode()</code> turns the text into bytes, <code>hashlib.sha256()</code> makes their fingerprint, and <code>.hexdigest()</code> writes it as 64 hex digits for <code>print()</code> to show.',
        'password_hash = file.read().strip()': 'Reads the hash from the file into <code>password_hash</code>. <code>.strip()</code> removes the invisible "new line" from the end, so it can match exactly.',
        'for word in file:': 'A <b>loop</b> over the open file: it goes round once for each line, putting that line in <code>word</code>. Each line of the wordlist holds one word.',
        'word = word.strip()': 'Removes the invisible "new line" from the end of <code>word</code>, and puts the tidy word back in <code>word</code>. Without this, every word would have an extra hidden character, so its hash would be wrong and it would look one letter longer!',
        'if hashlib.sha256(word.encode()).hexdigest() == password_hash:': 'Hashes this word, the same way as before, and checks whether it matches the password\'s hash. <code>==</code> asks "are these exactly the same?" (one <code>=</code> puts something in a box; two compare).',
        'vault_bytes = bytes.fromhex(file.read().strip())': 'Reads the file and strips off the "new line" at the end. Then <code>bytes.fromhex()</code> turns each pair of hex digits into one byte, and they all go into <code>vault_bytes</code>.',
        'message = ""': 'Makes an empty string called <code>message</code>. The loop will add the unlocked letters onto it, one at a time.',
        'for byte in vault_bytes:': 'A <b>loop</b> over the bytes. Each time round, <code>byte</code> holds the next one, as a number from 0 to 255.',
        'message += chr(byte ^ 42)': '<code>byte ^ 42</code> XORs the number with the key 42, which unlocks it. <code>chr()</code> turns the unlocked number into a letter, and <code>+=</code> adds it onto the end of <code>message</code>.',
        'def encrypt(text):': 'Makes your own <b>function</b> called <code>encrypt</code>. You give it some <code>text</code>, and it gives back the text with every letter shifted forward by 7.',
        'secret = ""': 'Makes an empty string called <code>secret</code>. The loop will add the encrypted characters onto it, one at a time.',
        'for character in text:': 'A <b>loop</b> over a string: it goes through <code>text</code> one character at a time (letters, spaces and full stops), putting each one in <code>character</code>.',
        'if character.isupper():': '<code>.isupper()</code> is True if <code>character</code> is a capital letter.',
        'secret += chr((ord(character) - 65 + 7) % 26 + 65)': 'Shifts the capital letter forward by 7 and adds it onto <code>secret</code>. <code>- 65</code> gives its place in the alphabet (A is 0), <code>+ 7</code> slides it along, <code>% 26</code> wraps past Z back to A, and <code>+ 65</code> with <code>chr()</code> turns it back into a capital.',
        'elif character.islower():': '<code>elif</code> means "else if". If it wasn\'t a capital, this checks whether it\'s a small letter instead.',
        'secret += chr((ord(character) - 97 + 7) % 26 + 97)': 'The same shift for a small letter. Small letters start at 97 (<code>ord("a")</code>), so it uses 97 instead of 65.',
        'secret += character': 'Not a letter? Then add the character onto <code>secret</code> unchanged, so spaces and full stops stay where they were.',
        'file.write(encrypt(report))': 'Encrypts your report with your function, then writes the secret version into <code>report.txt</code>.',
        'print(encrypt(report))': 'Shows the encrypted report too, so you can see what the Jackdaw would see if they snooped.',
        'long_words = 0': 'Makes a counter called <code>long_words</code>, starting at 0.',
        'if len(word) > 8:': 'Checks whether the word has more than 8 letters. The indented line below only runs if it does.'
    },

    missions: [
        {
            id: 'hash', title: 'Make a fingerprint',
            story: 'A <b>hash</b> is like a fingerprint for text. A hash function takes any text and mixes it up into a long jumble of hex digits. The same text always gives exactly the same hash, but change one letter and the hash is totally different. And there\'s no way to turn a hash back into the text!<br><br>That\'s why websites store the hash of your password, not the password itself. When you log in, they hash what you typed and check that the two fingerprints match.<br><br>Python\'s <code>hashlib</code> module makes hashes. We\'ll use one called <b>SHA-256</b>. Like base64, it works on bytes, so turn your text into bytes first with <code>.encode()</code>.',
            task: 'Use <code>hashlib.sha256()</code> to print the SHA-256 hash of any word you like, as hex with <code>.hexdigest()</code>.',
            tools: ['hashlib'],
            hints: [
                'Start with <code>import hashlib</code>.',
                'sha256 needs bytes, not a string, so use <code>.encode()</code>: <code>hashlib.sha256("hello".encode())</code>',
                'Add <code>.hexdigest()</code> on the end and print it.'
            ],
            try: ['import hashlib\n\nprint(hashlib.sha256("seagull".encode()).hexdigest())'],
            learn: '<code>hashlib.sha256(text.encode()).hexdigest()</code> makes a 64-character fingerprint. Try hashing "Seagull" and "seagull": completely different!',
            done: e => uses(e, /hashlib/, /sha256/, /hexdigest/)
        },
        {
            id: 'crack', title: 'Crack the password',
            story: 'You can\'t turn a hash back into a password... but you can <b>guess</b>. The Magpie used a password from their own <b>wordlist</b>. Hash every word, and when one matches the hash in <code>password.sha256</code>, you\'ve found the password! This is how security experts test whether passwords are too easy to guess.<br><br>Watch out for invisible characters. Every line in a file ends with a hidden "new line" character, and a word with a new line on the end has a completely different hash. <code>.strip()</code> removes it.',
            task: 'Hash every word in <code>nest/wordlist.txt</code> and print the one whose hash matches <code>nest/password.sha256</code>.',
            tools: ['hashlib', 'for', 'strip'],
            hints: [
                'Read the hash from the file with <code>.read().strip()</code> so there\'s no new line on the end.',
                'Loop over the words: <code>for word in file:</code> and <code>word = word.strip()</code> each one (newlines would change the hash!).',
                'Inside the loop: <code>if hashlib.sha256(word.encode()).hexdigest() == password_hash:</code> then print the word.'
            ],
            try: ['import hashlib\n\nwith open("nest/password.sha256") as file:\n    password_hash = file.read().strip()\n\nwith open("nest/wordlist.txt") as file:\n    for word in file:\n        word = word.strip()\n        if hashlib.sha256(word.encode()).hexdigest() == password_hash:\n            print("Password found:", word)'],
            learn: 'Trying a list of likely passwords is called a <b>dictionary attack</b>. It\'s why your passwords should be long and not just a word with a number on the end! 🔑',
            clue: 'The laptop is unlocked! Add the password to the Evidence Board →',
            evidence: ['password'],
            done: e => uses(e, /sha256/, /\bfor\b/) && printed(e, PASSWORD)
        },
        {
            id: 'xor', title: 'Open the XOR vault',
            story: 'The sticky note says the vault is locked with <b>XOR</b> and the key 42. Here\'s how XOR works. Every number is really binary underneath. XOR lines up the binary digits of a number and the key, and wherever the key has a 1, it <b>flips</b> the digit: 0 becomes 1, and 1 becomes 0.<br><br>In Python, XOR is the <code>^</code> symbol. <code>65 ^ 42</code> is 107. Here\'s the magic trick: flip the same digits again and you\'re back where you started, so <code>107 ^ 42</code> is 65. The same key locks <b>and</b> unlocks!<br><br>The vault is written in hex. <code>bytes.fromhex()</code> turns it into bytes, and looping over bytes gives you one <b>number</b> at a time.',
            task: 'Read <code>nest/vault.hex</code>, turn it into bytes with <code>bytes.fromhex()</code>, XOR every byte with 42, and print the secret message.',
            tools: ['xor', 'base64', 'ord/chr'],
            hints: [
                '<code>vault_bytes = bytes.fromhex(text)</code>. Looping over bytes gives you numbers, not letters!',
                'For each number <code>byte</code> in <code>vault_bytes</code>, <code>byte ^ 42</code> unlocks it, and <code>chr()</code> turns it into a letter.',
                'Build up a string: <code>message += chr(byte ^ 42)</code>, then print the message after the loop.'
            ],
            try: ['with open("nest/vault.hex") as file:\n    vault_bytes = bytes.fromhex(file.read().strip())\n\nmessage = ""\nfor byte in vault_bytes:\n    message += chr(byte ^ 42)\nprint(message)'],
            learn: '<code>^</code> is XOR: it flips the binary digits (bits) of a number wherever the key has a 1. <code>(x ^ 42) ^ 42</code> gives back <code>x</code>, so the same key locks AND unlocks.',
            clue: 'The Magpie\'s real name AND the Deckchair\'s location! Add them to the Evidence Board →',
            evidence: ['name', 'deckchair'],
            done: e => uses(e, /\^/, /fromhex/) && printed(e, VAULT_MSG)
        },
        {
            id: 'encrypt', title: 'Send an encrypted report',
            story: 'Inspector Ada wants your report, but the Jackdaw might be snooping on the Bureau\'s files. Encrypt it with a Caesar shift of <b>7</b> (Ada will shift it back), and save it to a file called <code>report.txt</code>.<br><br>Your report has small letters too, and they have different numbers: <code>ord("A")</code> is 65, but <code>ord("a")</code> is 97. So capitals use 65 in the shift maths, and small letters use 97.<br><br>So far you\'ve only <b>read</b> files. To <b>write</b> one, open it with <code>"w"</code>: <code>open("report.txt", "w")</code>. Then <code>file.write()</code> puts text into it. Careful: <code>"w"</code> replaces anything already in the file.',
            task: 'Write an <code>encrypt(text)</code> function that shifts every letter forward by 7. Use it to encrypt a short report that mentions the <b>Magpie</b>, and write the result into <code>report.txt</code>.',
            tools: ['def', 'ord/chr', 'write'],
            hints: [
                'Reuse your shift machine from Caesar\'s Return. <code>.isupper()</code> is True for a capital letter, and <code>.islower()</code> is True for a small one.',
                'Inside your function, loop over the characters. For a capital: <code>chr((ord(character) - 65 + 7) % 26 + 65)</code>. For a small letter, use 97 instead of 65. Leave everything else alone.',
                'Then <code>with open("report.txt", "w") as file:</code> and <code>file.write(encrypt(report))</code>'
            ],
            try: ['def encrypt(text):\n    secret = ""\n    for character in text:\n        if character.isupper():\n            secret += chr((ord(character) - 65 + 7) % 26 + 65)\n        elif character.islower():\n            secret += chr((ord(character) - 97 + 7) % 26 + 97)\n        else:\n            secret += character\n    return secret\n\nreport = "The Magpie is Margot Pye. The Golden Deckchair is under the Palace Pier."\nwith open("report.txt", "w") as file:\n    file.write(encrypt(report))\nprint(encrypt(report))'],
            learn: 'Opening a file with <code>"w"</code> lets you <b>write</b> to it. You\'ve gone from reading evidence to making your own secret files!',
            done: e => wrote(e, 'report.txt') && !e.text.toLowerCase().includes('magpie') &&
                       shiftText(e.text, -7).toLowerCase().includes('magpie')
        },
        {
            id: 'report', title: 'Close the case', final: true,
            story: 'The Golden Deckchair is going home to Brighton Pier, and Margot Pye, the Magpie, has been caught red-handed (well, red-beaked) 🐦. The whole Bureau is cheering! But as Ada packs up the nest, she finds a printout of a web page with a strange message: <i>"The Magpie was just the beginning. Find us on the web..."</i> 🌐 Your next adventure will take you onto the internet...',
            task: 'Record any evidence you\'re still missing to close the case of the Magpie for good!',
            hints: ['The password came from the wordlist. The name and the location are both in the unlocked vault.'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'password', label: '1. What is the Magpie\'s laptop password?', ph: 'a word from the wordlist',
          check: v => v === PASSWORD,
          tip: 'Hash every word in wordlist.txt with sha256 and compare it with password.sha256. Don\'t forget .strip()!' },
        { id: 'name', label: '2. What is the Magpie\'s real name?', ph: 'first and last name',
          check: v => v.includes('margot'),
          tip: 'Unlock vault.hex: bytes.fromhex(), then XOR every byte with 42.',
          tips: { 'mags pye': 'That\'s the fake name from the museum! The vault has the real one.' } },
        { id: 'deckchair', label: '3. Where is the Golden Deckchair hidden?', ph: 'a place in Brighton',
          check: v => v.includes('palace pier'),
          tip: 'Read the whole unlocked vault message.' },
        { id: 'long', label: 'How many words in the wordlist are longer than 8 letters?', bonus: true, ph: 'a number',
          check: v => v === String(LONG_WORDS),
          tip: 'Loop over the stripped words and count the ones where len(word) > 8.' }
    ],

    bonus: [
        { title: 'Long words.', text: 'Long passwords are harder to crack. How many words in the wordlist are longer than 8 letters? That\'s a bonus answer!',
          code: 'long_words = 0\nwith open("nest/wordlist.txt") as file:\n    for word in file:\n        word = word.strip()\n        if len(word) > 8:\n            long_words += 1\nprint(long_words)' },
        { title: 'Decrypt your own report.', text: 'Read <code>report.txt</code> back in and shift it by <code>-7</code> to check Ada can read it.' },
        { title: 'XOR your name.', text: 'XOR every letter of your name with a key, print the hex, then XOR it again to get it back. Spooky!' }
    ]
});
})();
