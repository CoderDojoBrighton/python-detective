// CASE 8 (HARD): Caesar's Return
// ord(), chr(), %, def, and brute-forcing a Caesar cipher.
(() => {
const HOME = '/home/detective';
const NB = `${HOME}/notebook`;

// Shift every letter n places along the alphabet, wrapping Z round to A
const shiftText = (s, n) => s.replace(/[A-Za-z]/g, ch => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + n) % 26 + 26) % 26 + base);
});
// Letter number i (counting letters only, from 1) is shifted i places
const progressive = (s, dir) => { let i = 0; return s.replace(/[A-Za-z]/g, ch => shiftText(ch, dir * ++i)); };

const NOTE1_KEY = 3;
const NOTE1_PLAIN = 'MEET AT THE WEST PIER AT HIGH TIDE. THE CODE WORD IS LIGHTHOUSE.';
const NOTE2_KEY = 17;
const NOTE2_PLAIN = 'THE MAGPIE SAYS: HIDE THE LOOT IN THE OLD BOATHOUSE ON MADEIRA DRIVE. COME AT DAWN.';
const NOTE3_PLAIN = 'MY REAL NAME IS JASPER. DO NOT TELL THE MAGPIE!';

CASES.push({
    id: 'caesars-return',
    title: 'Caesar\'s Return',
    icon: '🏛️',
    difficulty: 'hard',
    xp: 300,
    hintCost: 0.1,
    requires: 'backwards-day',
    summary: 'The Jackdaw dropped a notebook full of scrambled letters at the West Pier. Build your own Caesar cipher machine and brute-force your way to the Magpie\'s hideout.',
    skills: ['ord()', 'chr()', '%', 'def', 'brute force'],
    home: HOME,
    intro: [
        '\x1b[1mByte came back from the \x1b[93mWest Pier\x1b[0m\x1b[1m with something in his mouth...\x1b[0m',
        'It\'s the \x1b[96mJackdaw\'s\x1b[0m notebook! But every page is full of nonsense letters.',
        '',
        'Inspector Ada thinks it\'s a \x1b[92mCaesar cipher\x1b[0m: every letter slid along the alphabet.',
        'The pages are in the \x1b[93mnotebook\x1b[0m folder. Time to crack some codes!'
    ],
    starter: [
        '# Case 8: Caesar\'s Return',
        '# The Jackdaw\'s notebook pages are in the notebook folder.',
        '',
        'import os',
        'print(os.listdir("notebook"))',
        ''
    ].join('\n'),
    files: {
        [`${HOME}/case_file.txt`]: [
            '==================== CASE FILE #0050 ====================',
            ' TO:      Detective',
            ' FROM:    Inspector Ada, Brighton Byte Bureau',
            ' SUBJECT: The Jackdaw\'s notebook',
            '',
            ' The Jackdaw dropped this notebook running away from',
            ' the West Pier. The pages look like gibberish, but I',
            ' think each letter has been shifted along the alphabet',
            ' (A->D, B->E, C->F ...). Julius Caesar used this trick',
            ' 2000 years ago!',
            '',
            '   notebook/note1.txt  - the Jackdaw wrote the key on it',
            '   notebook/note2.txt  - no key... you\'ll have to try them all',
            '   notebook/note3.txt  - something stranger',
            '',
            ' Crack them and find the Magpie\'s hideout.',
            '=========================================================='
        ].join('\n'),
        [`${NB}/note1.txt`]: `key: ${NOTE1_KEY}\n${shiftText(NOTE1_PLAIN, NOTE1_KEY)}\n`,
        [`${NB}/note2.txt`]: `${shiftText(NOTE2_PLAIN, NOTE2_KEY)}\n`,
        [`${NB}/note3.txt`]: `first letter +1, second letter +2, third letter +3 ...\n${progressive(NOTE3_PLAIN, 1)}\n`
    },

    missions: [
        {
            id: 'ordchr', title: 'Letters are secretly numbers',
            story: 'Computers store every letter as a number. In Python, <code>ord()</code> turns a letter into its number and <code>chr()</code> turns a number back into a letter. That\'s the secret behind every cipher!',
            task: 'Print the number for <code>"A"</code> using <code>ord()</code>, and print the letter for number <code>72</code> using <code>chr()</code>.',
            tools: ['ord/chr'],
            hints: [
                '<code>ord("A")</code> gives a number. <code>chr(72)</code> gives a letter.',
                'Put them both inside <code>print()</code>: <code>print(ord("A"), chr(72))</code>'
            ],
            try: ['print(ord("A"), chr(72))'],
            learn: '<code>ord("A")</code> is <code>65</code>, <code>ord("B")</code> is <code>66</code> ... <code>ord("Z")</code> is <code>90</code>. <code>chr()</code> does the opposite.',
            done: e => uses(e, /ord\s*\(/, /chr\s*\(/)
        },
        {
            id: 'machine', title: 'Build a shift machine',
            story: 'To shift a letter by 3: turn it into a number from 0 to 25 (<code>ord(letter) - 65</code>), add 3, wrap round past Z with <code>% 26</code>, then turn it back into a letter. Let\'s put that in a <b>function</b> so you can use it again and again.',
            task: 'Write a function with <code>def</code> that shifts a capital letter along the alphabet. It needs <code>ord</code>, <code>chr</code> and <code>% 26</code>. Test it: shifting <code>"A"</code> by 3 should give <code>"D"</code>, and <code>"Z"</code> by 1 should give <code>"A"</code>.',
            tools: ['def', 'ord/chr', 'maths'],
            hints: [
                'Start with <code>def shift(letter, n):</code> and indent the lines inside by 4 spaces.',
                'The number from 0 to 25 is <code>ord(letter) - 65</code>. Add <code>n</code>, then <code>% 26</code> wraps 26 back round to 0.',
                'Add 65 back on, then use <code>chr()</code>: <code>return chr((ord(letter) - 65 + n) % 26 + 65)</code>'
            ],
            try: ['def shift(letter, n):\n    return chr((ord(letter) - 65 + n) % 26 + 65)\n\nprint(shift("A", 3), shift("Z", 1))'],
            learn: '<code>% 26</code> gives the <b>remainder</b> after dividing by 26, so 26 becomes 0, 27 becomes 1... That wraps Z back round to A. A shift of <code>-3</code> undoes a shift of <code>+3</code>.',
            done: e => uses(e, /def\s+\w+\s*\(/, /ord\s*\(/, /chr\s*\(/, /%\s*26/)
        },
        {
            id: 'note1', title: 'Decode page one',
            story: 'Page one says <code>key: 3</code> at the top. So the Jackdaw shifted every letter <b>forward</b> by 3. To read it, shift every letter <b>back</b> by 3. Spaces and full stops weren\'t shifted, so leave them alone.',
            task: 'Read <code>notebook/note1.txt</code>, shift every letter back by 3, and print the secret message.',
            tools: ['open', 'for', 'def'],
            hints: [
                'Loop over every character: <code>for ch in text:</code>. Only shift it if <code>ch.isalpha()</code> is True, otherwise keep it as it is.',
                'Build the answer up in a string: start with <code>decoded = ""</code> and add one character at a time with <code>decoded += ...</code>',
                'Use your shift function with <code>-3</code>: <code>decoded += shift(ch, -3)</code>'
            ],
            try: ['with open("notebook/note1.txt") as f:\n    text = f.read()\n\ndef decode(text, n):\n    out = ""\n    for ch in text:\n        if ch.isalpha():\n            out += chr((ord(ch) - 65 - n) % 26 + 65)\n        else:\n            out += ch\n    return out\n\nprint(decode(text, 3))'],
            learn: 'Decoding is just shifting the other way. Looping over a string gives you one character at a time, and <code>.isalpha()</code> tells you whether it\'s a letter.',
            clue: 'Page one has a code word. Add it to the Evidence Board →',
            evidence: ['codeword'],
            done: e => printed(e, NOTE1_PLAIN)
        },
        {
            id: 'note2', title: 'Brute force page two',
            story: 'Page two has <b>no key</b>! But there are only 26 possible shifts, and Python can try them all in a blink. That\'s called a <b>brute force</b> attack. Byte reckons the Jackdaw always mentions the <b>MAGPIE</b>... 🐕',
            task: 'Try every shift from 0 to 25 on <code>notebook/note2.txt</code>. Print the shift number next to each attempt, find the one that makes sense, and print that message.',
            tools: ['for', 'in', 'f-strings'],
            hints: [
                '<code>for key in range(26):</code> repeats with key = 0, 1, 2 ... 25.',
                'Inside the loop, print the key AND the decoded text so you can spot the right one: <code>print(key, decode(text, key))</code>',
                'Even better, let Python spot it: <code>if "MAGPIE" in attempt:</code>'
            ],
            try: ['with open("notebook/note2.txt") as f:\n    text = f.read()\n\nfor key in range(26):\n    attempt = decode(text, key)\n    if "MAGPIE" in attempt:\n        print(key, attempt)'],
            learn: 'With only 26 possible keys, a Caesar cipher is easy to <b>brute force</b>: a loop tries them all. Real encryption has so many keys that even supercomputers can\'t try them all!',
            clue: 'You found the key AND the hideout. Add them both to the Evidence Board →',
            evidence: ['key', 'hideout'],
            done: e => uses(e, /range\s*\(/) && printed(e, NOTE2_PLAIN)
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'You\'ve cracked the Jackdaw\'s notebook! Inspector Ada is grabbing her coat. 🧥',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['The code word is at the end of page one. The key is the shift that made page two readable.'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'codeword', label: '1. What is the code word on page one?', ph: 'one word',
          check: v => v === 'lighthouse',
          tip: 'Shift every letter of note1.txt BACK by 3 and read the last sentence.' },
        { id: 'key', label: '2. What key (shift) did the Jackdaw use for page two?', ph: 'a number from 1 to 25',
          check: v => v === String(NOTE2_KEY) || v === String(26 - NOTE2_KEY),
          tip: 'Loop over range(26) and print each key with its attempt. Which one makes real words?' },
        { id: 'hideout', label: '3. Where is the Magpie\'s hideout?', ph: 'a place in Brighton',
          check: v => v.includes('boathouse'),
          tip: 'Decode page two with the right key and read where the loot is hidden.' },
        { id: 'jackdaw', label: 'What is the Jackdaw\'s real first name? (page three)', bonus: true, ph: 'a name',
          check: v => v === 'jasper',
          tip: 'Page three: the 1st letter is shifted by 1, the 2nd by 2, and so on. Only letters count. Keep a counter!' }
    ],

    bonus: [
        { title: 'Page three.', text: 'The Jackdaw got clever: the 1st letter is shifted by 1, the 2nd letter by 2, the 3rd by 3... (spaces and punctuation don\'t count). Keep a counter that goes up for every letter and shift back by it. The answer is a bonus!',
          code: 'with open("notebook/note3.txt") as f:\n    text = f.readlines()[1]\n\ncount = 0\nout = ""\nfor ch in text:\n    if ch.isalpha():\n        count += 1\n        out += chr((ord(ch) - 65 - count) % 26 + 65)\n    else:\n        out += ch\nprint(out)' },
        { title: 'Encode your own.', text: 'Use your shift function to encode your name with key 13. That\'s called <b>ROT13</b>. What happens if you encode it twice?' }
    ]
});
})();
