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

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'print(ord("A"), chr(72))': 'Shows two things with a space between them. <code>ord("A")</code> turns the letter A into its number, and <code>chr(72)</code> turns the number 72 back into a letter. Which letter is it?',
        'def shift_letter(letter, shift):': 'Makes your own <b>function</b> called <code>shift_letter</code>. When you use it, you give it two things: a <code>letter</code>, and a <code>shift</code> (how many places to slide it). All three names are your choice.',
        'return chr((ord(letter) - 65 + shift) % 26 + 65)': 'The shift maths, worked out from the inside out. <code>ord(letter) - 65</code> gives the letter\'s place in the alphabet (A is 0), <code>+ shift</code> slides it along, and <code>% 26</code> wraps anything past Z back round to A. Then <code>+ 65</code> and <code>chr()</code> turn it back into a letter, and <code>return</code> sends that letter back as the function\'s answer.',
        'print(shift_letter("A", 3), shift_letter("Z", 1))': '<b>Uses</b> your function twice: once to shift A by 3, and once to shift Z by 1. Then it shows both answers. You should see <code>D A</code>.',
        'def decode(text, shift):': 'Makes your own <b>function</b> called <code>decode</code>. You give it some <code>text</code> and a <code>shift</code>, and it gives back the text with every letter shifted back. The indented lines below are its recipe.',
        'decoded = ""': 'Makes an empty string called <code>decoded</code>. <code>""</code> is text with nothing in it. The loop will add the decoded characters onto it, one at a time.',
        'for character in text:': 'A <b>loop</b> over a string: it goes through <code>text</code> one character at a time (letters, spaces and full stops), putting each one in <code>character</code>.',
        'if character.isalpha():': '<code>.isalpha()</code> is True if <code>character</code> is a letter, and False for spaces, numbers and punctuation. Only letters get shifted.',
        'decoded += chr((ord(character) - 65 - shift) % 26 + 65)': 'Shifts the letter <b>back</b> by <code>shift</code> places and adds it onto the end of <code>decoded</code>. It\'s the same maths as your shift machine, but with <code>- shift</code> instead of <code>+ shift</code>.',
        'decoded += character': 'Not a letter? Then add the character onto <code>decoded</code> unchanged, so spaces and full stops stay where they were.',
        'print(decode(text, 3))': 'Uses your <code>decode</code> function on the text with a shift of 3, and shows the answer.',
        'for key in range(26):': 'A <b>loop</b> that goes round 26 times. <code>range(26)</code> gives the numbers 0 to 25, and each time round the next number is put in <code>key</code>.',
        'attempt = decode(text, key)': 'Decodes the page with this key, and stores the result in <code>attempt</code>. Most keys give nonsense: only one gives real words.',
        'if "MAGPIE" in attempt:': 'Checks whether the word <code>"MAGPIE"</code> appears anywhere inside <code>attempt</code>. If it does, this is probably the right key!',
        'text = file.readlines()[1]': '<code>file.readlines()</code> makes a list of the file\'s lines, and <code>[1]</code> picks the <b>second</b> one (Python counts from 0). That\'s the scrambled message: the first line is just the Jackdaw\'s instructions.',
        'shift = 0': 'Makes a variable called <code>shift</code> that starts at 0. It will go up by 1 for every letter.'
    },

    missions: [
        {
            id: 'ordchr', title: 'Letters are secretly numbers',
            story: 'Inspector Ada thinks the notebook uses a <b>Caesar cipher</b>: every letter has been slid a few places along the alphabet, so A becomes D, B becomes E, and so on. To slide letters along, we need to do maths with them. But how do you add 3 to a letter?<br><br>Here\'s the secret: computers store every letter as a <b>number</b>. Capital A is 65, B is 66, C is 67, all the way to Z, which is 90. <code>ord()</code> turns a letter into its number, and <code>chr()</code> turns a number back into a letter. (Think "chr" for "character".) That\'s the trick behind every cipher!',
            task: 'Print the number for <code>"A"</code> using <code>ord()</code>, and print the letter for the number <code>72</code> using <code>chr()</code>.',
            tools: ['ord/chr'],
            hints: [
                '<code>ord("A")</code> gives a number. <code>chr(72)</code> gives a letter.',
                'Put them both inside <code>print()</code>: <code>print(ord("A"), chr(72))</code>'
            ],
            try: ['print(ord("A"), chr(72))'],
            learn: '<code>ord("A")</code> is <code>65</code>, <code>ord("B")</code> is <code>66</code>, all the way to <code>ord("Z")</code>, which is <code>90</code>. <code>chr()</code> does the opposite: <code>chr(65)</code> is <code>"A"</code>. Small letters have their own numbers: <code>ord("a")</code> is <code>97</code>.',
            done: e => uses(e, /ord\s*\(/, /chr\s*\(/)
        },
        {
            id: 'machine', title: 'Build a shift machine',
            story: 'Let\'s build a machine that slides one letter along the alphabet. Here are its four steps, shifting <code>"Y"</code> by 3:<br><br>1. <code>ord(letter) - 65</code> gives the letter\'s place in the alphabet, counting from 0. A is 0, B is 1... Y is 24.<br>2. Add the shift: 24 + 3 = 27.<br>3. <code>% 26</code> wraps round. <code>%</code> gives the <b>remainder</b> after dividing, so 27 % 26 is 1. Without it, we\'d fall off the end of the alphabet after Z!<br>4. Add 65 back on and use <code>chr()</code>: place 1 turns into <code>"B"</code>.<br><br>We\'ll wrap these steps up in a <b>function</b>. A function is a mini program with a name. You write it once with <code>def</code>, then use it whenever you like, just like <code>print()</code>. The values you hand it go in the brackets, and <code>return</code> sends its answer back.',
            task: 'Write a function with <code>def</code> that shifts a capital letter along the alphabet. It needs <code>ord</code>, <code>chr</code> and <code>% 26</code>. Test it: shifting <code>"A"</code> by 3 should give <code>"D"</code>, and <code>"Z"</code> by 1 should give <code>"A"</code>.',
            tools: ['def', 'ord/chr', 'maths'],
            hints: [
                'Start with <code>def shift_letter(letter, shift):</code> and indent the line inside by 4 spaces. <code>letter</code> and <code>shift</code> are names you pick for the two values the function is given.',
                'The place from 0 to 25 is <code>ord(letter) - 65</code>. Add <code>shift</code>, then <code>% 26</code> wraps 26 back round to 0.',
                'Add 65 back on, then use <code>chr()</code>: <code>return chr((ord(letter) - 65 + shift) % 26 + 65)</code>'
            ],
            try: ['def shift_letter(letter, shift):\n    return chr((ord(letter) - 65 + shift) % 26 + 65)\n\nprint(shift_letter("A", 3), shift_letter("Z", 1))'],
            learn: '<code>def</code> makes a <b>function</b>: a named recipe you can use again and again. <code>return</code> sends its answer back. <code>% 26</code> gives the <b>remainder</b> after dividing by 26, so 26 becomes 0 and 27 becomes 1. That wraps Z back round to A. A shift of <code>-3</code> undoes a shift of <code>3</code>.',
            done: e => uses(e, /def\s+\w+\s*\(/, /ord\s*\(/, /chr\s*\(/, /%\s*26/)
        },
        {
            id: 'note1', title: 'Decode page one',
            story: 'Time to read page one! It starts with <code>key: 3</code>, so the Jackdaw shifted every letter <b>forward</b> by 3. To read it, shift every letter <b>back</b> by 3. Spaces and full stops weren\'t shifted, so leave those alone.<br><br>The plan: go through the text one character at a time with a <code>for</code> loop. If the character is a letter, shift it back. If not, keep it as it is. Either way, add it onto the end of a new string called <code>decoded</code>, which starts out empty.<br><br>We\'ll put all this in a function called <code>decode()</code>, so you can use it again on page two.',
            task: 'Read <code>notebook/note1.txt</code>, shift every letter back by 3, and print the secret message. (The <code>key: 3</code> line at the top will come out as nonsense. Ignore it: the message is underneath.)',
            tools: ['open', 'for', 'def'],
            hints: [
                'Loop over every character: <code>for character in text:</code>. Only shift it if <code>character.isalpha()</code> is True (it\'s a letter). Otherwise keep it as it is.',
                'Build the answer up in a string: start with <code>decoded = ""</code> and add one character at a time with <code>decoded += ...</code>',
                'Shifting back means taking away: <code>chr((ord(character) - 65 - shift) % 26 + 65)</code>. Then print <code>decode(text, 3)</code>.'
            ],
            try: ['with open("notebook/note1.txt") as file:\n    text = file.read()\n\ndef decode(text, shift):\n    decoded = ""\n    for character in text:\n        if character.isalpha():\n            decoded += chr((ord(character) - 65 - shift) % 26 + 65)\n        else:\n            decoded += character\n    return decoded\n\nprint(decode(text, 3))'],
            learn: 'Decoding is just shifting the other way, so the maths uses <code>- shift</code> instead of <code>+ shift</code>. A <code>for</code> loop over a string gives you one character at a time, and <code>.isalpha()</code> is True only for letters. <code>decoded += x</code> is short for <code>decoded = decoded + x</code>: it sticks <code>x</code> on the end.',
            clue: 'Page one has a code word. Add it to the Evidence Board →',
            evidence: ['codeword'],
            done: e => printed(e, NOTE1_PLAIN)
        },
        {
            id: 'note2', title: 'Brute force page two',
            story: 'Page two has <b>no key</b>! But a Caesar shift can only be 0 to 25 places (a shift of 26 takes every letter all the way round, back to where it started). So there are only 26 possible keys, and Python can try them all in a blink. Trying every possible key is called a <b>brute force</b> attack.<br><br><code>range(26)</code> gives the numbers 0, 1, 2 ... 25. It stops <b>before</b> 26. So <code>for key in range(26):</code> goes round the loop 26 times, with a different <code>key</code> each time.<br><br>Byte reckons the Jackdaw always mentions the <b>MAGPIE</b>... 🐕',
            task: 'Keep your <code>decode()</code> function from page one: the code below uses it. Try every shift from 0 to 25 on <code>notebook/note2.txt</code>, find the one that makes sense, and print that message with its key.',
            tools: ['for', 'in', 'f-strings'],
            hints: [
                '<code>for key in range(26):</code> repeats with key = 0, 1, 2 ... 25.',
                'Inside the loop, print the key AND the decoded text so you can spot the right one: <code>print(key, decode(text, key))</code>',
                'Even better, let Python spot it: <code>if "MAGPIE" in attempt:</code> only lets through the attempt with MAGPIE in it.'
            ],
            try: ['with open("notebook/note2.txt") as file:\n    text = file.read()\n\nfor key in range(26):\n    attempt = decode(text, key)\n    if "MAGPIE" in attempt:\n        print(key, attempt)'],
            learn: '<code>range(26)</code> counts from 0 up to 25. With only 26 possible keys, a Caesar cipher is easy to <b>brute force</b>: a loop tries them all. Real encryption has so many keys that even supercomputers can\'t try them all!',
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
          tip: 'Page three: the 1st letter is shifted by 1, the 2nd by 2, and so on. Only letters count. Keep a shift that goes up by 1 for every letter!' }
    ],

    bonus: [
        { title: 'Page three.', text: 'The Jackdaw got clever: the 1st letter is shifted by 1, the 2nd letter by 2, the 3rd by 3... (spaces and punctuation don\'t count). So keep a <code>shift</code> that goes up by 1 for every letter, and shift each letter back by it. The answer is a bonus!',
          code: 'with open("notebook/note3.txt") as file:\n    text = file.readlines()[1]\n\nshift = 0\ndecoded = ""\nfor character in text:\n    if character.isalpha():\n        shift += 1\n        decoded += chr((ord(character) - 65 - shift) % 26 + 65)\n    else:\n        decoded += character\nprint(decoded)' },
        { title: 'Encode your own.', text: 'Use your <code>shift_letter</code> function to encode your first name in CAPITALS with a shift of 13. That\'s called <b>ROT13</b>. What happens if you encode it twice?' }
    ]
});
})();
