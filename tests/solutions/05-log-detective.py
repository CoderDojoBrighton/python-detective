# Teacher solution: Case 5, Log Detective
# answer badge: B-7731
# answer door: Music Room
# answer hour: 09

# ---- run
with open("case_file.txt") as f:
    print(f.read())

# ---- run
with open("pavilion/doors.log") as f:
    lines = f.readlines()

for line in lines[:5]:
    print(line.strip())

# ---- run
with open("pavilion/doors.log") as f:
    lines = f.readlines()

for line in lines:
    if "DENIED" in line:
        print(line.strip())

# ---- run
with open("pavilion/doors.log") as f:
    lines = f.readlines()

counts = {}
for line in lines:
    if "DENIED" in line:
        parts = line.split()
        badge = parts[-2].split("=")[1]
        counts[badge] = counts.get(badge, 0) + 1

print(counts)
print("Most refused:", max(counts, key=counts.get))

# ---- run
with open("pavilion/doors.log") as f:
    lines = f.readlines()

for line in lines:
    if "B-7731" in line and "GRANTED" in line:
        print(line.strip())

# ---- run
with open("pavilion/doors.log") as f:
    lines = f.readlines()

hours = {}
for line in lines:
    hour = line.split()[1][:2]
    hours[hour] = hours.get(hour, 0) + 1
print(hours)
print(max(hours, key=hours.get))
