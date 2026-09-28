with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\SimpleSkillFullscreenUI.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_s = "const isTargetElem = (skill.elem === activeElem) || (activeElem === 'Kiếm' && String(skill.id).startsWith('kiem_'));"
new_s = "const isTargetElem = (skill.id === 'basic_attack') || (skill.elem === activeElem) || (activeElem === 'Kiếm' && String(skill.id).startsWith('kiem_'));"

if old_s in text:
    text = text.replace(old_s, new_s, 1)
    with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\SimpleSkillFullscreenUI.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated SimpleSkillFullscreenUI.js successfully!")
else:
    print("Could not find string in SimpleSkillFullscreenUI.js")
