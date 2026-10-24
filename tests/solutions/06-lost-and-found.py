# Teacher solution: Case 6, Lost and Found
# answer place: West Pier
# answer photos: 30
# answer biggest: map_of_brighton.pdf

# ---- run
import os
print(os.listdir())

# ---- run
import os
print(os.listdir("/evidence/laptop"))

# ---- run
import os
for folder, subfolders, files in os.walk("/evidence/laptop"):
    if "plans.txt" in files:
        path = os.path.join(folder, "plans.txt")
        print(path)
        with open(path) as f:
            print(f.read())

# ---- run
import os
count = 0
for folder, subfolders, files in os.walk("/evidence/laptop"):
    for name in files:
        if name.endswith(".jpg"):
            count = count + 1
print(count)

# ---- run
import os
biggest = ""
biggest_size = 0
for folder, subfolders, files in os.walk("/evidence/laptop"):
    for name in files:
        size = os.path.getsize(os.path.join(folder, name))
        if size > biggest_size:
            biggest, biggest_size = name, size
print(biggest, biggest_size)
