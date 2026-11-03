// CASE 6 (MEDIUM): Lost and Found
// os.listdir(), os.walk() / glob, os.path.join() and endswith() to search a deep folder tree.
(() => {
const HOME = '/home/detective';
const LAPTOP = '/evidence/laptop';
const PLANS_PATH = `${LAPTOP}/.cache/browser/temp/old/plans.txt`;
const pad = n => String(n).padStart(2, '0');

const files = {
    [`${HOME}/case_file.txt`]: [
        '==================== CASE FILE #0048 ====================',
        ' TO:      Detective',
        ' FROM:    Inspector Ada, Brighton Byte Bureau',
        ' SUBJECT: The Magpie\'s laptop',
        '',
        ' Great news! Police found the Magpie\'s laptop in a',
        ' café near the Pavilion. They copied everything on it',
        ' into /evidence/laptop before the battery died.',
        '',
        ' Bad news: there are folders inside folders inside',
        ' folders. Byte got lost in there for an hour. 🐕',
        '',
        ' We think the Magpie has written down their NEXT PLAN',
        ' in a file called plans.txt. Find it and read it.',
        '',
        ' While you\'re in there, count the .jpg photos. The lab',
        ' needs to know how many to check.',
        '',
        ' - Ada',
        '=========================================================='
    ].join('\n'),

    [`${LAPTOP}/Documents/shopping_list.txt`]: 'bird seed\nsilver polish\nbin bags (big)\nchips\nmore silver polish',
    [`${LAPTOP}/Documents/jpg_notes.txt`]: 'Remember to rename all the photos so they end in .jpg',
    [`${LAPTOP}/Documents/recipes/scones.txt`]: 'Scones: flour, butter, milk, sugar. Bake 12 minutes.',
    [`${LAPTOP}/Documents/recipes/flapjack.txt`]: 'Flapjack: oats, butter, golden syrup. Golden like a deckchair...',
    [`${LAPTOP}/Documents/letters/letter_to_gran.txt`]: 'Dear Gran,\nBrighton is lovely. I have been collecting shiny things again.\nLove, M',
    [`${LAPTOP}/Documents/notes/todo.txt`]: '- feed the jackdaw\n- polish the trophy\n- delete plans (forgot!!)',
    [`${LAPTOP}/Documents/notes/plans_old.txt`]: 'OLD PLAN: meet at the Bandstand.\n*** CANCELLED *** too many detectives about.',
    [`${LAPTOP}/Music/seagull_sounds.mp3`]: 'SQUAWK '.repeat(40),
    [`${LAPTOP}/Music/playlists/heist_tunes.txt`]: 'Sneaky Theme\nTiptoe Song\nThe Getaway (Extended Mix)',
    [`${LAPTOP}/Downloads/map_of_brighton.pdf`]: 'MAP OF BRIGHTON: pier, beach, pavilion, lanes, station, bandstand, museum. '.repeat(45),
    [`${LAPTOP}/Downloads/bus_timetable_121.txt`]: 'Bus 121: every 20 minutes, 06:00 to 23:40',
    [`${LAPTOP}/Downloads/deckchair.jpg`]: '(photo: a golden deckchair, very shiny)',
    [`${LAPTOP}/Downloads/pier_photo.jpg`]: '(photo: Brighton Pier at sunset)',
    [`${LAPTOP}/Desktop/wallpaper.jpg`]: '(photo: a magpie wearing sunglasses)',
    [`${LAPTOP}/Desktop/shortcut_to_games.lnk`]: 'shortcut',
    [`${LAPTOP}/Desktop/todo.txt`]: 'nothing to see here',
    [`${LAPTOP}/.cache/browser/history.txt`]: 'how to polish gold\nwest pier opening times\nhow to train a jackdaw',
    [`${LAPTOP}/.cache/browser/temp/old/plans_backup.txt.bak`]: 'empty',
    [PLANS_PATH]: [
        'MY NEXT PLAN (top secret, do not lose this!!)',
        '',
        'Meet the Jackdaw at the West Pier.',
        'Bring the shiny things. The Jackdaw has a boat.',
        'From now on our messages will be written backwards',
        'so nosy detectives can\'t read them. Ha!',
        '',
        '- The Magpie'
    ].join('\n')
};

// Lots of photos, spread around the laptop
for (let i = 1; i <= 12; i++) files[`${LAPTOP}/Pictures/holiday/2025/beach_${pad(i)}.jpg`] = `(photo: beach day ${i})`;
for (let i = 1; i <= 9; i++) files[`${LAPTOP}/Pictures/birds/magpies/shiny_${pad(i)}.jpg`] = `(photo: a magpie with something shiny, number ${i})`;
for (let i = 1; i <= 5; i++) files[`${LAPTOP}/Pictures/screenshots/screen_${pad(i)}.png`] = `(screenshot ${i})`;
for (let i = 1; i <= 6; i++) files[`${LAPTOP}/.cache/thumbnails/thumb_${pad(i)}.jpg`] = `(tiny photo ${i})`;

const JPG_COUNT = Object.keys(files).filter(p => p.endsWith('.jpg')).length;
const PNG_COUNT = Object.keys(files).filter(p => p.endsWith('.png')).length;
const sizes = Object.entries(files).filter(([p]) => p.startsWith(LAPTOP)).map(([p, t]) => [p, t.length]).sort((a, b) => b[1] - a[1]);
const BIGGEST = sizes[0][0].split('/').pop();

CASES.push({
    id: 'lost-and-found',
    title: 'Lost and Found',
    icon: '🗄️',
    difficulty: 'medium',
    xp: 220,
    hintCost: 0.05,
    requires: 'log-detective',
    summary: 'The police have copied the Magpie\'s laptop. Explore folders inside folders inside folders to find the secret plan, and count the photos.',
    skills: ['os.listdir()', 'os.walk()', 'os.path.join()', 'endswith()'],
    home: HOME,
    intro: [
        '\x1b[1mThe Magpie left their laptop in a café!\x1b[0m',
        'Everything on it has been copied into \x1b[96m/evidence/laptop\x1b[0m.',
        'It\'s a maze of folders. Python can explore them all for you.'
    ],
    starter: [
        '# Case 6: Lost and Found',
        'import os',
        '',
        'with open("case_file.txt") as file:',
        '    print(file.read())',
        ''
    ].join('\n'),
    files,
    dirs: [`${LAPTOP}/Videos`, `${LAPTOP}/Pictures/empty_album`],

    // "What does each line do?" for lines the general explanations don't cover well
    explain: {
        'print(os.listdir("/evidence/laptop"))': 'Gets a list of everything inside the folder <code>"/evidence/laptop"</code> (files and folders) and shows it.',
        'for folder, subfolders, files in os.walk("/evidence/laptop"):': 'A <b>loop</b> that visits <code>/evidence/laptop</code> and every folder inside it, however deep. Each time round, <code>folder</code> is the path of the folder it\'s visiting, <code>subfolders</code> is a list of the folders inside it, and <code>files</code> is a list of the file names in it.',
        'if "plans.txt" in files:': 'Checks whether <code>"plans.txt"</code> is one of the file names in this folder. The indented lines below only run in the folder where it is.',
        'print(os.path.join(folder, "plans.txt"))': 'Glues the folder\'s path and <code>"plans.txt"</code> together, with a <code>/</code> in between, to make the file\'s full path. Then shows it.',
        'with open(os.path.join(folder, "plans.txt")) as file:': 'Builds the full path to <code>plans.txt</code> with <code>os.path.join()</code>, then opens that file and calls it <code>file</code> in the indented line below.',
        'print(file.read())': 'Reads everything in the file as one string, and shows it.',
        'photo_count = 0': 'Makes a <b>counter</b> called <code>photo_count</code> and starts it at 0. It will go up by 1 for every photo found.',
        'if name.endswith(".jpg"):': 'Checks whether the file name <b>ends with</b> <code>".jpg"</code>. A name like <code>jpg_notes.txt</code> has "jpg" in it but doesn\'t end with it, so it gets skipped.',
        'print(photo_count)': 'Shows the final count. It\'s not indented, so it runs once, after the loops have visited every folder.',
        'biggest_file = ""': 'Makes a variable to remember the name of the biggest file found so far. It starts as empty text, <code>""</code>, because we haven\'t looked at any files yet.',
        'biggest_size = 0': 'Makes a variable to remember the size of the biggest file found so far. It starts at 0, so any real file will be bigger.',
        'size = os.path.getsize(os.path.join(folder, name))': 'Builds the full path to this file, then <code>os.path.getsize()</code> measures how big the file is in <b>bytes</b> (about one byte for each letter of text).',
        'if size > biggest_size:': 'Checks whether this file is bigger than the biggest one so far. The indented lines below only run if it is.',
        'biggest_file = name': 'Remembers this file\'s name as the new biggest.',
        'biggest_size = size': 'Remembers its size too, so the next files can be compared with it.',
        'print(biggest_file, biggest_size)': 'After the loops have finished, shows the name of the biggest file and its size in bytes.',
        'print(glob.glob("/evidence/laptop/**/*.jpg", recursive=True))': 'Finds every file that matches the pattern and shows them as a list. <code>**</code> means "any folders, however deep", <code>*.jpg</code> means "any name ending in .jpg", and <code>recursive=True</code> switches the <code>**</code> part on.'
    },

    missions: [
        {
            id: 'here', title: 'What\'s in your folder?', tutorial: true,
            story: 'Before you can open a file, you need to know it\'s there, and what it\'s called! Python has a <b>module</b> for this called <code>os</code>. A module is a toolkit of extra commands. You load it with <code>import os</code> at the top of your code, and then you can use its commands, which all start with <code>os.</code><br><br><code>os.listdir()</code> (short for "list directory", and directory is another word for folder) gives you a <b>list</b> of everything in a folder. It\'s like opening the folder on your computer.',
            task: 'Make sure <code>import os</code> is at the top of your code, then print <code>os.listdir()</code> to see what\'s in your own folder.',
            tools: ['os'],
            hints: [
                'Put <code>import os</code> at the top of your code.',
                '<code>print(os.listdir())</code> with nothing in the brackets means "this folder".'
            ],
            try: ['import os\nprint(os.listdir())'],
            learn: '<code>os.listdir()</code> gives you a list of everything in a folder: files and other folders. Empty brackets mean "the folder I\'m in now".',
            done: e => listed(e, HOME)
        },
        {
            id: 'laptop', title: 'Look inside the laptop',
            story: 'The case file says the copy of the laptop is in <code>/evidence/laptop</code>. That\'s a <b>path</b>: directions to a folder, with a <code>/</code> between each folder name. A path that starts with <code>/</code> starts at the very top of the computer, so it works from anywhere.',
            task: 'Print what\'s inside <code>/evidence/laptop</code>.',
            tools: ['os'],
            hints: [
                'Put the folder\'s path inside the brackets, as a string (in quotes).',
                '<code>print(os.listdir("/evidence/laptop"))</code>. Notice the folder called <code>.cache</code>? Names starting with a dot are normally hidden!'
            ],
            try: ['print(os.listdir("/evidence/laptop"))'],
            learn: 'Give <code>os.listdir()</code> a path to look somewhere else. Folders whose names start with <code>.</code> are "hidden" ones: computers often hide them from you, but Python still sees them.',
            done: e => listed(e, LAPTOP)
        },
        {
            id: 'walk', title: 'Search every folder',
            story: 'The laptop has folders inside folders inside folders. You could <code>listdir</code> each one by hand, but that would take ages. <code>os.walk()</code> does it for you. It visits the folder you give it, then every folder inside that, then every folder inside <b>those</b>, all the way down.<br><br>You use it in a <code>for</code> loop that goes round once per folder. Each time round it hands you <b>three</b> things, so the loop has three variable names:<br><code>for folder, subfolders, files in os.walk("/evidence/laptop"):</code><br><code>folder</code> is the path of the folder it\'s visiting, <code>subfolders</code> is a list of the folders inside it, and <code>files</code> is a list of its file names. You choose those names. These ones say what each one holds.',
            task: 'Use <code>os.walk()</code> (or <code>glob</code>) to find the file called <code>plans.txt</code> and print its full path.',
            tools: ['os.walk', 'if'],
            hints: [
                'Start with <code>for folder, subfolders, files in os.walk("/evidence/laptop"):</code>. That loop runs once for every folder on the laptop.',
                'Inside that loop, check <code>if "plans.txt" in files:</code>',
                'A file name on its own doesn\'t say where the file is. <code>os.path.join(folder, "plans.txt")</code> glues the folder and the file name together with a <code>/</code> to make the full path.'
            ],
            try: ['for folder, subfolders, files in os.walk("/evidence/laptop"):\n    if "plans.txt" in files:\n        print(os.path.join(folder, "plans.txt"))'],
            learn: '<code>os.walk()</code> visits a folder and <b>every</b> folder inside it. Each time round the loop you get the folder\'s path, its subfolders and its files. <code>os.path.join()</code> glues folder and file names into one full path, putting the <code>/</code> in the right places.',
            done: e => uses(e, /os\.walk|glob/) && printed(e, 'plans.txt')
        },
        {
            id: 'read', title: 'Read the plan',
            story: 'Found it, hidden deep inside the browser\'s cache: a folder of leftover web bits that nobody ever looks in. Sneaky! Watch out, though. There\'s also an old plan lying around, <code>plans_old.txt</code>, and that one was cancelled.',
            task: 'Open the <code>plans.txt</code> you found (use its full path) and print what it says.',
            tools: ['open'],
            hints: [
                'Copy the full path you printed and put it in <code>open("...")</code>, then <code>print(file.read())</code>.',
                'Or, inside your <code>os.walk</code> loop, open <code>os.path.join(folder, "plans.txt")</code> straight away.'
            ],
            try: ['for folder, subfolders, files in os.walk("/evidence/laptop"):\n    if "plans.txt" in files:\n        with open(os.path.join(folder, "plans.txt")) as file:\n            print(file.read())'],
            learn: 'Once you know a file\'s full path, <code>open()</code> can read it from anywhere.',
            clue: 'The plan says where the Magpie is meeting their accomplice. Add it to the Evidence Board →',
            evidence: ['place'],
            done: e => opened(e, PLANS_PATH)
        },
        {
            id: 'photos', title: 'Count the photos',
            story: 'The lab wants to check every photo for clues. Photo file names end in <code>.jpg</code>. But careful: screenshots end in <code>.png</code>, and one sneaky note just has "jpg" somewhere in its name.<br><br>So <code>"jpg" in name</code> isn\'t a good enough test. Strings have a better one: <code>name.endswith(".jpg")</code> is True only when the name <b>ends</b> with <code>.jpg</code>.<br><br>To count them, use a <b>counter</b>: a variable that starts at 0 and goes up by 1 each time you find a photo.',
            task: 'Count every file on the laptop whose name <b>ends with</b> <code>.jpg</code> and print the total.',
            tools: ['os.walk', 'startswith'],
            hints: [
                'Make your counter before the loop: <code>photo_count = 0</code>',
                'Each folder has a list of <code>files</code>, so you need a loop inside your loop: <code>for name in files:</code>. Then <code>if name.endswith(".jpg"):</code> add 1 to <code>photo_count</code>.',
                'Print <code>photo_count</code> <b>after</b> the loops have finished, so put it right at the left edge, not indented.'
            ],
            try: ['photo_count = 0\nfor folder, subfolders, files in os.walk("/evidence/laptop"):\n    for name in files:\n        if name.endswith(".jpg"):\n            photo_count = photo_count + 1\nprint(photo_count)'],
            learn: '<code>.endswith(".jpg")</code> checks the end of a string (and <code>.startswith()</code> checks the start). A counter like <code>photo_count = photo_count + 1</code> inside a loop adds up how many things matched.',
            clue: 'Add the number of photos to the Evidence Board →',
            evidence: ['photos'],
            done: e => uses(e, /\.jpg/) && printed(e, String(JPG_COUNT))
        },
        {
            id: 'report', title: 'File your report', final: true,
            story: 'You\'ve searched the whole laptop. Inspector Ada wants your findings!',
            task: 'Record any evidence you\'re still missing to close the case.',
            hints: ['Where does plans.txt (not plans_old.txt!) say the meeting is? And what number did your .jpg counter print?'],
            done: () => false
        }
    ],

    evidence: [
        { id: 'place', label: '1. Where is the Magpie meeting the Jackdaw?', ph: 'a place in Brighton',
          check: v => v.includes('west pier'),
          tip: 'Find plans.txt with os.walk and read it. Not the old cancelled one!',
          tips: { bandstand: 'That\'s from plans_old.txt, and it was CANCELLED. Find plans.txt.', 'the bandstand': 'That\'s from plans_old.txt, and it was CANCELLED. Find plans.txt.' } },
        { id: 'photos', label: '2. How many .jpg photos are on the laptop?', ph: 'a number',
          check: v => v === String(JPG_COUNT),
          tip: 'Use os.walk to visit every folder (even hidden ones) and count names that end with ".jpg".',
          tips: { [String(JPG_COUNT + 1)]: 'One too many! Did you count jpg_notes.txt? Use .endswith(".jpg"), not "jpg" in name.',
                  [String(JPG_COUNT + PNG_COUNT)]: 'That includes the .png screenshots. Only count .jpg files.' } },
        { id: 'biggest', label: 'What is the name of the biggest file on the laptop?', bonus: true, ph: 'a file name',
          check: v => v.endsWith(BIGGEST.toLowerCase()),
          tip: 'os.path.getsize(path) tells you how many bytes a file is. Keep track of the biggest one you\'ve seen.' }
    ],

    bonus: [
        { title: 'Biggest file.', text: 'Which file on the laptop is the biggest? <code>os.path.getsize(path)</code> gives a file\'s size in bytes. Remember the biggest one you\'ve seen so far, and swap it whenever you find a bigger one. That\'s a bonus answer!',
          code: 'biggest_file = ""\nbiggest_size = 0\nfor folder, subfolders, files in os.walk("/evidence/laptop"):\n    for name in files:\n        size = os.path.getsize(os.path.join(folder, name))\n        if size > biggest_size:\n            biggest_file = name\n            biggest_size = size\nprint(biggest_file, biggest_size)' },
        { title: 'Glob it.', text: 'The <code>glob</code> module finds files whose names match a pattern. <code>*</code> means "any name" and <code>**</code> means "any folders, however deep".', code: 'import glob\nprint(glob.glob("/evidence/laptop/**/*.jpg", recursive=True))' },
        { title: 'Draw the tree.', text: 'Print every folder, indented by how deep it is. <code>folder.count("/")</code> tells you how deep you are, and <code>"  " * depth</code> makes that many spaces.' }
    ]
});
})();
