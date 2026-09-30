with open('src/config/world/humanRealmWorld.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix Nam Lăng regions: remove 'Thánh Tông', 'Vạn Thú Thánh Tông', etc.
nam_lang_replacements = [
    ("['Mộc','Thủy'],'Thánh Tông',", "['Mộc','Thủy'],"),
    ("['Mộc','Thổ'],'Vạn Thú Thánh Tông',", "['Mộc','Thổ'],"),
    ("['Thủy','Phong'],'Thương Hải Tiên Cung',", "['Thủy','Phong'],"),
    ("['Thổ','Kim','Hỏa'],'Thiên Cương Luyện Khí Tông',", "['Thổ','Kim','Hỏa'],"),
    ("['Kiếm','Kim','Phong'],'Thiên Kiếm Thánh Tông',", "['Kiếm','Kim','Phong'],"),
    ("['Kim','Thủy','Hỏa','Thổ','Mộc'],'Thái Hư Thánh Tông',", "['Kim','Thủy','Hỏa','Thổ','Mộc'],"),
    ("['Thổ','Hỏa'],'Cổ Ma Thần Điện',", "['Thổ','Hỏa'],"),
    ("['Băng','Thủy'],'Hàn Băng Thánh Tông',", "['Băng','Thủy'],"),
    ("['Hỏa','Lôi','Vật Lý'],'Cửu U Ma Tông',", "['Hỏa','Lôi','Vật Lý'],"),
]

for old, new in nam_lang_replacements:
    code = code.replace(old, new)

with open('src/config/world/humanRealmWorld.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed Nam Lang region arrays successfully")
