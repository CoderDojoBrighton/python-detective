# Teacher solution: Case 2, The Locker Code
# answer combination: 4378
# answer bus: 121
# answer receipt: 495

# ---- run
d1 = 3600 // 900
print(d1)

# ---- run
d1 = 3600 // 900
d2 = 2026 % 7
d3 = (15 + 27) * 2 - 77
d4 = 2 ** 3
print(d2, d3, d4)

code = str(d1) + str(d2) + str(d3) + str(d4)
print(code)

if int(code) > 5000:
    print("ALARM")
else:
    print("SAFE")

number = int(code)
bus = number // 100 + number % 100
print("Bus number:", bus)

print(3 * 85 + 2 * 120)
