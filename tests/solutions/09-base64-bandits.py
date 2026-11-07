# Teacher solution: Case 9, Base64 Bandits
# answer day: FRIDAY
# answer door: 4815
# answer flag: FLAG{SHINY-THINGS-NEVER-STAY-HIDDEN}
# answer torch: torch

# ---- run
import os
print(os.listdir("boathouse"))

import base64
with open("boathouse/note.b64") as file:
    text = file.read()
print(base64.b64decode(text).decode())

# ---- run
import os
print(os.listdir("boathouse"))

import base64
with open("boathouse/note.b64") as file:
    text = file.read()
print(base64.b64decode(text).decode())

with open("boathouse/door.bin") as file:
    groups = file.read().split()
message = ""
for group in groups:
    message += chr(int(group, 2))
print(message)

# ---- run
import os
print(os.listdir("boathouse"))

import base64
with open("boathouse/note.b64") as file:
    text = file.read()
print(base64.b64decode(text).decode())

with open("boathouse/door.bin") as file:
    groups = file.read().split()
message = ""
for group in groups:
    message += chr(int(group, 2))
print(message)

with open("boathouse/receipt.hex") as file:
    text = file.read().strip()
print(bytes.fromhex(text).decode())

# ---- run
import os
print(os.listdir("boathouse"))

import base64
with open("boathouse/note.b64") as file:
    text = file.read()
print(base64.b64decode(text).decode())

with open("boathouse/door.bin") as file:
    groups = file.read().split()
message = ""
for group in groups:
    message += chr(int(group, 2))
print(message)

with open("boathouse/receipt.hex") as file:
    text = file.read().strip()
print(bytes.fromhex(text).decode())

with open("boathouse/onion.txt") as file:
    text = file.read().strip()
layers = 0
while not text.startswith("FLAG{"):
    text = base64.b64decode(text).decode()
    layers += 1
print(layers, "layers:", text)
