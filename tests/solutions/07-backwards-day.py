# Teacher solution: Case 7, Backwards Day
# answer when: midnight
# answer password: SANDCASTLE
# answer boat: KIPPER

# ---- run
with open("messages/msg1.txt") as f:
    text = f.read().strip()
print(text[::-1])

# ---- run
with open("messages/msg2.txt") as f:
    text = f.read().strip()
print(text[::2])

# ---- run
letters = []
with open("messages/poem.txt") as f:
    for line in f:
        letters.append(line.strip()[0])
print("".join(letters))

# ---- run
with open("messages/msg3.txt") as f:
    text = f.read()

secret = ""
for ch in text:
    if ch.isupper():
        secret += ch
print(secret)
