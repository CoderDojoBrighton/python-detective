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

    missions: [
        {
            id: 'hash', title: 'Make a fingerprint',
            story: 'A <b>hash</b> is like a fingerprint for text. The same text always gives exactly the same hash, but change one letter and the hash is totally different. And there\'s no way to turn a hash back into the text! That\'s why websites store hashes of passwords, not the passwords.',
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
            story: 'You can\'t reverse a hash... but the Magpie used a password from their own <b>wordlist</b>. Hash every word, and when one matches the hash in <code>password.sha256</code>, you\'ve found the password! This is how security experts test whether passwords are too easy to guess.',
            task: 'Hash every word in <code>nest/wordlist.txt</code> and print the one whose hash matches <code>nest/password.sha256</code>.',
            tools: ['hashlib', 'for', 'strip'],
            hints: [
                'Read the target hash with <code>.read().strip()</code> so there\'s no newline on the end.',
                'Loop over the words: <code>for word in f:</code> and <code>word = word.strip()</code> each one (newlines would change the hash!).',
                'Inside the loop: <code>if hashlib.sha256(word.encode()).hexdigest() == target:</code> then print the word.'
            ],
            try: ['import hashlib\n\nwith open("nest/password.sha256") as f:\n    target = f.read().strip()\n\nwith open("nest/wordlist.txt") as f:\n    for word in f:\n        word = word.strip()\n        if hashlib.sha256(word.encode()).hexdigest() == target:\n            print("Password found:", word)'],
            learn: 'Trying a list of likely passwords is called a <b>dictionary attack</b>. It\'s why your passwords should be long and not just a word with a number on the end! 🔑',
            clue: 'The laptop is unlocked! Add the password to the Evidence Board →',
            evidence: ['password'],
            done: e => uses(e, /sha256/, /\bfor\b/) && printed(e, PASSWORD)
        },
        {
            id: 'xor', title: 'Open the XOR vault',
            story: 'The sticky note says the vault is locked with <b>XOR</b> and the key 42. In Python, XOR is the <code>^</code> symbol. XOR has a magic trick: do it once to lock, and do it again with the same key to unlock!',
            task: 'Read <code>nest/vault.hex</code>, turn it into bytes with <code>bytes.fromhex()</code>, XOR every byte with 42, and print the secret message.',
            tools: ['xor', 'base64', 'ord/chr'],
            hints: [
                '<code>data = bytes.fromhex(text)</code>. Looping over bytes gives you numbers, not letters!',
                'For each number <code>b</code> in data, <code>b ^ 42</code> unlocks it, and <code>chr()</code> turns it into a letter.',
                'Build up a string: <code>message += chr(b ^ 42)</code>, then print the message after the loop.'
            ],
            try: ['with open("nest/vault.hex") as f:\n    data = bytes.fromhex(f.read().strip())\n\nmessage = ""\nfor b in data:\n    message += chr(b ^ 42)\nprint(message)'],
            learn: '<code>^</code> is XOR: it flips the bits of a number wherever the key has a 1. <code>(x ^ 42) ^ 42</code> gives back <code>x</code>, so the same key locks AND unlocks.',
            clue: 'The Magpie\'s real name AND the Deckchair\'s location! Add them to the Evidence Board →',
            evidence: ['name', 'deckchair'],
            done: e => uses(e, /\^/, /fromhex/) && printed(e, VAULT_MSG)
        },
        {
            id: 'encrypt', title: 'Send an encrypted report',
            story: 'Inspector Ada wants your report, but the Jackdaw might be snooping on the Bureau\'s files. Encrypt it with a Caesar shift of <b>7</b> (Ada will shift it back), and save it to a file called <code>report.txt</code>.',
            task: 'Write an <code>encrypt(text)</code> function that shifts every letter forward by 7. Use it to encrypt a short report that mentions the <b>Magpie</b>, and write the result into <code>report.txt</code>.',
            tools: ['def', 'ord/chr', 'write'],
            hints: [
                'Reuse your shift machine from Caesar\'s Return. Watch out: capitals start at <code>ord("A")</code> = 65, but lower case starts at <code>ord("a")</code> = 97!',
                'Inside your function, loop over the characters. For a capital: <code>chr((ord(ch) - 65 + 7) % 26 + 65)</code>; for lower case use 97; leave everything else alone.',
                'Then <code>with open("report.txt", "w") as f:</code> and <code>f.write(encrypt(report))</code>'
            ],
            try: ['def encrypt(text):\n    out = ""\n    for ch in text:\n        if ch.isupper():\n            out += chr((ord(ch) - 65 + 7) % 26 + 65)\n        elif ch.islower():\n            out += chr((ord(ch) - 97 + 7) % 26 + 97)\n        else:\n            out += ch\n    return out\n\nreport = "The Magpie is Margot Pye. The Golden Deckchair is under the Palace Pier."\nwith open("report.txt", "w") as f:\n    f.write(encrypt(report))\nprint(encrypt(report))'],
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
          code: 'with open("nest/wordlist.txt") as f:\n    words = [w.strip() for w in f]\nprint(len([w for w in words if len(w) > 8]))' },
        { title: 'Decrypt your own report.', text: 'Read <code>report.txt</code> back in and shift it by <code>-7</code> to check Ada can read it.' },
        { title: 'XOR your name.', text: 'XOR every letter of your name with a key, print the hex, then XOR it again to get it back. Spooky!' }
    ]
});
})();
