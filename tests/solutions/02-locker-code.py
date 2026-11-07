# Teacher solution: Case 2, The Locker Code
# answer combination: 4378
# answer bus: 121
# answer receipt: 495

# ---- run
print(10 + 5)
digit1 = 3600 // 900
print(digit1)

# ---- run
print(10 + 5)
digit1 = 3600 // 900
print(digit1)
digit2 = 2026 % 7
digit3 = (15 + 27) * 2 - 77
digit4 = 2 ** 3
print(digit2, digit3, digit4)

# ---- run
print(10 + 5)
digit1 = 3600 // 900
print(digit1)
digit2 = 2026 % 7
digit3 = (15 + 27) * 2 - 77
digit4 = 2 ** 3
print(digit2, digit3, digit4)
combination = str(digit1) + str(digit2) + str(digit3) + str(digit4)
print(combination)
if int(combination) > 5000:
    print("ALARM")
else:
    print("SAFE")
number = int(combination)
bus = number // 100 + number % 100
print("Bus number:", bus)

print(3 * 85 + 2 * 120)
