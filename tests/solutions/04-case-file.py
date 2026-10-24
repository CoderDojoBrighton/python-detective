# Teacher solution: Case 4, The Case File
# answer target: the royal pavilion
# answer lines: 57
# answer shiny: 11

# ---- run
with open("case_file.txt") as f:
    text = f.read()
print(text)

# ---- run
with open("usb/diary.txt") as f:
    diary = f.read()
print(diary)
print(diary.count("shiny"))

# ---- run
with open("usb/diary.txt") as f:
    lines = f.readlines()
print(len(lines))

# ---- run
with open("usb/diary.txt") as f:
    lines = f.readlines()
print(lines[41].strip())
