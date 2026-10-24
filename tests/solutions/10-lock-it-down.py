# Teacher solution: Case 10, Lock It Down
# answer password: rockpool77
# answer name: Margot Pye
# answer deckchair: Palace Pier
# answer long: 56

# ---- run
import hashlib

print(hashlib.sha256("seagull".encode()).hexdigest())

# ---- run
import hashlib

with open("nest/password.sha256") as f:
    target = f.read().strip()

with open("nest/wordlist.txt") as f:
    for word in f:
        word = word.strip()
        if hashlib.sha256(word.encode()).hexdigest() == target:
            print("Password found:", word)

# ---- run
with open("nest/vault.hex") as f:
    data = bytes.fromhex(f.read().strip())

message = ""
for b in data:
    message += chr(b ^ 42)
print(message)

# ---- run
def encrypt(text):
    out = ""
    for ch in text:
        if ch.isupper():
            out += chr((ord(ch) - 65 + 7) % 26 + 65)
        elif ch.islower():
            out += chr((ord(ch) - 97 + 7) % 26 + 97)
        else:
            out += ch
    return out

report = "The Magpie is Margot Pye. The Golden Deckchair is under the Palace Pier."
with open("report.txt", "w") as f:
    f.write(encrypt(report))
print(encrypt(report))

# Bonus
with open("nest/wordlist.txt") as f:
    words = [w.strip() for w in f]
print(len([w for w in words if len(w) > 8]))
