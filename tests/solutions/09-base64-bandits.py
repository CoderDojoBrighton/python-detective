# Teacher solution: Case 9, Base64 Bandits
# answer day: FRIDAY
# answer door: 4815
# answer flag: FLAG{SHINY-THINGS-NEVER-STAY-HIDDEN}
# answer torch: torch

# ---- run
import base64

with open("boathouse/note.b64") as f:
    text = f.read()
print(base64.b64decode(text).decode())

# ---- run
with open("boathouse/door.bin") as f:
    groups = f.read().split()

message = ""
for g in groups:
    message += chr(int(g, 2))
print(message)

# ---- run
with open("boathouse/receipt.hex") as f:
    text = f.read().strip()
print(bytes.fromhex(text).decode())

# ---- run
import base64

with open("boathouse/onion.txt") as f:
    text = f.read().strip()

layers = 0
while not text.startswith("FLAG{"):
    text = base64.b64decode(text).decode()
    layers += 1

print(layers, "layers:", text)
