# Teacher solution: Case 4, The Case File
# answer target: the royal pavilion
# answer lines: 57
# answer shiny: 11

# ---- run
with open("case_file.txt") as file:
    text = file.read()
print(text)

# ---- run
with open("case_file.txt") as file:
    text = file.read()
print(text)
with open("usb/diary.txt") as file:
    diary = file.read()
print(diary)

# ---- run
with open("case_file.txt") as file:
    text = file.read()
print(text)
with open("usb/diary.txt") as file:
    diary = file.read()
print(diary)
with open("usb/diary.txt") as file:
    lines = file.readlines()
print(len(lines))

# ---- run
with open("case_file.txt") as file:
    text = file.read()
print(text)
with open("usb/diary.txt") as file:
    diary = file.read()
print(diary)
with open("usb/diary.txt") as file:
    lines = file.readlines()
print(len(lines))
print(lines[41].strip())

print(diary.count("shiny"))
