# Teacher solution: Case 7, Backwards Day
# answer when: midnight
# answer password: SANDCASTLE
# answer boat: KIPPER

# ---- run
import os
print(os.listdir("messages"))

with open("messages/msg1.txt") as file:
    message = file.read().strip()
print(message)

print(message[::-1])

# ---- run
import os
print(os.listdir("messages"))

with open("messages/msg1.txt") as file:
    message = file.read().strip()
print(message)

print(message[::-1])

with open("messages/msg2.txt") as file:
    message = file.read().strip()
print(message[::2])

# ---- run
import os
print(os.listdir("messages"))

with open("messages/msg1.txt") as file:
    message = file.read().strip()
print(message)

print(message[::-1])

with open("messages/msg2.txt") as file:
    message = file.read().strip()
print(message[::2])

first_letters = []
with open("messages/poem.txt") as file:
    for line in file:
        first_letters.append(line.strip()[0])
print("".join(first_letters))

# ---- run
import os
print(os.listdir("messages"))

with open("messages/msg1.txt") as file:
    message = file.read().strip()
print(message)

print(message[::-1])

with open("messages/msg2.txt") as file:
    message = file.read().strip()
print(message[::2])

first_letters = []
with open("messages/poem.txt") as file:
    for line in file:
        first_letters.append(line.strip()[0])
print("".join(first_letters))

with open("messages/msg3.txt") as file:
    message = file.read()
capitals = ""
for letter in message:
    if letter.isupper():
        capitals += letter
print(capitals)
