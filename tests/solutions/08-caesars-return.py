# Teacher solution: Case 8, Caesar's Return
# answer codeword: LIGHTHOUSE
# answer key: 17
# answer hideout: old boathouse on Madeira Drive
# answer jackdaw: JASPER

# ---- run
print(ord("A"), chr(72))

# ---- run
def shift_letter(letter, shift):
    return chr((ord(letter) - 65 + shift) % 26 + 65)

print(shift_letter("A", 3), shift_letter("Z", 1))

# ---- run
def decode(text, shift):
    decoded = ""
    for character in text:
        if character.isalpha():
            decoded += chr((ord(character) - 65 - shift) % 26 + 65)
        else:
            decoded += character
    return decoded

with open("notebook/note1.txt") as file:
    lines = file.readlines()
print(decode(lines[1], 3))

with open("notebook/note2.txt") as file:
    text = file.read()

for key in range(26):
    attempt = decode(text, key)
    if "MAGPIE" in attempt:
        print(key, attempt)

# Bonus: progressive shift
with open("notebook/note3.txt") as file:
    text = file.readlines()[1]

shift = 0
decoded = ""
for character in text:
    if character.isalpha():
        shift += 1
        decoded += chr((ord(character) - 65 - shift) % 26 + 65)
    else:
        decoded += character
print(decoded)
