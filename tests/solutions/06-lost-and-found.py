# Teacher solution: Case 6, Lost and Found
# answer place: West Pier
# answer photos: 30
# answer biggest: map_of_brighton.pdf

# ---- run
import os

with open("case_file.txt") as file:
    print(file.read())

print(os.listdir())

# ---- run
import os

with open("case_file.txt") as file:
    print(file.read())

print(os.listdir())

print(os.listdir("/evidence/laptop"))

# ---- run
import os

with open("case_file.txt") as file:
    print(file.read())

print(os.listdir())

print(os.listdir("/evidence/laptop"))

for folder, subfolders, files in os.walk("/evidence/laptop"):
    if "plans.txt" in files:
        plans_path = os.path.join(folder, "plans.txt")
        print(plans_path)

# ---- run
import os

with open("case_file.txt") as file:
    print(file.read())

print(os.listdir())

print(os.listdir("/evidence/laptop"))

for folder, subfolders, files in os.walk("/evidence/laptop"):
    if "plans.txt" in files:
        plans_path = os.path.join(folder, "plans.txt")
        print(plans_path)

with open(plans_path) as file:
    print(file.read())

# ---- run
import os

with open("case_file.txt") as file:
    print(file.read())

print(os.listdir())

print(os.listdir("/evidence/laptop"))

for folder, subfolders, files in os.walk("/evidence/laptop"):
    if "plans.txt" in files:
        plans_path = os.path.join(folder, "plans.txt")
        print(plans_path)

with open(plans_path) as file:
    print(file.read())

photo_count = 0
for folder, subfolders, files in os.walk("/evidence/laptop"):
    for name in files:
        if name.endswith(".jpg"):
            photo_count = photo_count + 1
print(photo_count)

# ---- run
import os

with open("case_file.txt") as file:
    print(file.read())

print(os.listdir())

print(os.listdir("/evidence/laptop"))

for folder, subfolders, files in os.walk("/evidence/laptop"):
    if "plans.txt" in files:
        plans_path = os.path.join(folder, "plans.txt")
        print(plans_path)

with open(plans_path) as file:
    print(file.read())

photo_count = 0
for folder, subfolders, files in os.walk("/evidence/laptop"):
    for name in files:
        if name.endswith(".jpg"):
            photo_count = photo_count + 1
print(photo_count)

biggest_file = ""
biggest_size = 0
for folder, subfolders, files in os.walk("/evidence/laptop"):
    for name in files:
        size = os.path.getsize(os.path.join(folder, name))
        if size > biggest_size:
            biggest_file = name
            biggest_size = size
print(biggest_file, biggest_size)
