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

with open("nest/password.sha256") as file:
    password_hash = file.read().strip()

with open("nest/wordlist.txt") as file:
    for word in file:
        word = word.strip()
        if hashlib.sha256(word.encode()).hexdigest() == password_hash:
            print("Password found:", word)

# ---- run
with open("nest/vault.hex") as file:
    vault_bytes = bytes.fromhex(file.read().strip())

message = ""
for byte in vault_bytes:
    message += chr(byte ^ 42)
print(message)

# ---- run
def encrypt(text):
    secret = ""
    for character in text:
        if character.isupper():
            secret += chr((ord(character) - 65 + 7) % 26 + 65)
        elif character.islower():
            secret += chr((ord(character) - 97 + 7) % 26 + 97)
        else:
            secret += character
    return secret

report = "The Magpie is Margot Pye. The Golden Deckchair is under the Palace Pier."
with open("report.txt", "w") as file:
    file.write(encrypt(report))
print(encrypt(report))

# Bonus
long_words = 0
with open("nest/wordlist.txt") as file:
    for word in file:
        word = word.strip()
        if len(word) > 8:
            long_words += 1
print(long_words)
