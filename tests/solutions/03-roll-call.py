# Teacher solution: Case 3, Roll Call
# answer name: Mags Pye
# answer badge: 112
# answer jcount: 3

# ---- run
signed_in = [
    "Finn Walsh", "Olivia Grant", "Kemi Adeyemi",
    "Jasmine Clarke", "Yasmin Ali", "Theo Baker",
    "Dev Patel", "Quinn Doyle", "Grace Lee",
    "Maya Cohen", "Hugo Fischer", "Victor Mendes",
    "Sam Kowalski", "Chloe Martin", "Zac Foster",
    "Xander Price", "Ben Hughes", "Amara Okafor",
    "Jay Sharma", "Ella Brooks", "Ruby Turner",
    "Jude Bennett", "Uma Singh", "Priya Nair",
    "Isla Murray", "Mags Pye", "Willow Hart",
    "Freya Lund", "Leo Rossi", "Noah Evans"
]
signed_out = [
    "Quinn Doyle", "Leo Rossi", "Priya Nair",
    "Theo Baker", "Yasmin Ali", "Uma Singh",
    "Finn Walsh", "Kemi Adeyemi", "Ruby Turner",
    "Zac Foster", "Victor Mendes", "Xander Price",
    "Dev Patel", "Jude Bennett", "Ben Hughes",
    "Isla Murray", "Jay Sharma", "Noah Evans",
    "Freya Lund", "Willow Hart", "Hugo Fischer",
    "Chloe Martin", "Grace Lee", "Amara Okafor",
    "Sam Kowalski", "Jasmine Clarke", "Olivia Grant",
    "Ella Brooks", "Maya Cohen"
]

print(len(signed_in))
print(len(signed_out))

# ---- run
signed_in = [
    "Finn Walsh", "Olivia Grant", "Kemi Adeyemi",
    "Jasmine Clarke", "Yasmin Ali", "Theo Baker",
    "Dev Patel", "Quinn Doyle", "Grace Lee",
    "Maya Cohen", "Hugo Fischer", "Victor Mendes",
    "Sam Kowalski", "Chloe Martin", "Zac Foster",
    "Xander Price", "Ben Hughes", "Amara Okafor",
    "Jay Sharma", "Ella Brooks", "Ruby Turner",
    "Jude Bennett", "Uma Singh", "Priya Nair",
    "Isla Murray", "Mags Pye", "Willow Hart",
    "Freya Lund", "Leo Rossi", "Noah Evans"
]
signed_out = [
    "Quinn Doyle", "Leo Rossi", "Priya Nair",
    "Theo Baker", "Yasmin Ali", "Uma Singh",
    "Finn Walsh", "Kemi Adeyemi", "Ruby Turner",
    "Zac Foster", "Victor Mendes", "Xander Price",
    "Dev Patel", "Jude Bennett", "Ben Hughes",
    "Isla Murray", "Jay Sharma", "Noah Evans",
    "Freya Lund", "Willow Hart", "Hugo Fischer",
    "Chloe Martin", "Grace Lee", "Amara Okafor",
    "Sam Kowalski", "Jasmine Clarke", "Olivia Grant",
    "Ella Brooks", "Maya Cohen"
]

for name in signed_in:
    print(name)

for name in signed_in:
    if name not in signed_out:
        print("Still inside:", name)

badges = [
    271, 215, 303, 158, 221, 349, 177, 260, 404,
    125, 333, 188, 112, 142, 416, 209, 365, 151,
    248, 382, 166, 289, 437, 193, 320
]

for badge in badges:
    if badge % 7 == 0:
        print("Lucky badge:", badge)

j_count = 0
for name in signed_in:
    if name.startswith("J"):
        j_count = j_count + 1
print(j_count)
