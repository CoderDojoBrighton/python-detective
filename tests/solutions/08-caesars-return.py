# Teacher solution: Case 8, Caesar's Return
# answer codeword: LIGHTHOUSE
# answer key: 17
# answer hideout: old boathouse on Madeira Drive
# answer jackdaw: JASPER

# ---- run
print(ord("A"), chr(72))

# ---- run
def shift(letter, n):
    return chr((ord(letter) - 65 + n) % 26 + 65)

print(shift("A", 3), shift("Z", 1))

# ---- run
def decode(text, n):
    out = ""
    for ch in text:
        if ch.isalpha():
            out += chr((ord(ch) - 65 - n) % 26 + 65)
        else:
            out += ch
    return out

with open("notebook/note1.txt") as f:
    lines = f.readlines()
print(decode(lines[1], 3))

with open("notebook/note2.txt") as f:
    text = f.read()

for key in range(26):
    attempt = decode(text, key)
    if "MAGPIE" in attempt:
        print(key, attempt)

# Bonus: progressive shift
with open("notebook/note3.txt") as f:
    text = f.readlines()[1]

count = 0
out = ""
for ch in text:
    if ch.isalpha():
        count += 1
        out += chr((ord(ch) - 65 - count) % 26 + 65)
    else:
        out += ch
print(out)
