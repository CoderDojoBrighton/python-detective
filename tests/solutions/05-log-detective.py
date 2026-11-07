# Teacher solution: Case 5, Log Detective
# answer badge: B-7731
# answer door: Music Room
# answer hour: 09

# ---- run
with open("case_file.txt") as file:
    print(file.read())

# ---- run
with open("case_file.txt") as file:
    print(file.read())

with open("pavilion/doors.log") as file:
    lines = file.readlines()
for line in lines[:5]:
    print(line.strip())

# ---- run
with open("case_file.txt") as file:
    print(file.read())

with open("pavilion/doors.log") as file:
    lines = file.readlines()
for line in lines[:5]:
    print(line.strip())

for line in lines:
    if "DENIED" in line:
        print(line.strip())

# ---- run
with open("case_file.txt") as file:
    print(file.read())

with open("pavilion/doors.log") as file:
    lines = file.readlines()
for line in lines[:5]:
    print(line.strip())

for line in lines:
    if "DENIED" in line:
        print(line.strip())

refusals = {}
for line in lines:
    if "DENIED" in line:
        words = line.split()
        badge = words[-2].split("=")[1]
        refusals[badge] = refusals.get(badge, 0) + 1
print(refusals)
print("Most refused:", max(refusals, key=refusals.get))

# ---- run
with open("case_file.txt") as file:
    print(file.read())

with open("pavilion/doors.log") as file:
    lines = file.readlines()
for line in lines[:5]:
    print(line.strip())

for line in lines:
    if "DENIED" in line:
        print(line.strip())

refusals = {}
for line in lines:
    if "DENIED" in line:
        words = line.split()
        badge = words[-2].split("=")[1]
        refusals[badge] = refusals.get(badge, 0) + 1
print(refusals)
print("Most refused:", max(refusals, key=refusals.get))

for line in lines:
    if "B-7731" in line and "GRANTED" in line:
        print(line.strip())

# ---- run
with open("case_file.txt") as file:
    print(file.read())

with open("pavilion/doors.log") as file:
    lines = file.readlines()
for line in lines[:5]:
    print(line.strip())

for line in lines:
    if "DENIED" in line:
        print(line.strip())

refusals = {}
for line in lines:
    if "DENIED" in line:
        words = line.split()
        badge = words[-2].split("=")[1]
        refusals[badge] = refusals.get(badge, 0) + 1
print(refusals)
print("Most refused:", max(refusals, key=refusals.get))

for line in lines:
    if "B-7731" in line and "GRANTED" in line:
        print(line.strip())

swipes_per_hour = {}
for line in lines:
    hour = line.split()[1][:2]
    swipes_per_hour[hour] = swipes_per_hour.get(hour, 0) + 1
print(swipes_per_hour)
print(max(swipes_per_hour, key=swipes_per_hour.get))
