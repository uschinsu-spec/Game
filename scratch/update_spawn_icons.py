import os

def update_spawns():
    # 1. Update HerbsMixin.js
    herbs_mixin_file = r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\HerbsMixin.js'
    with open(herbs_mixin_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace herbTex definition
    old_herb_tex = "    const herbTex = `herb_${(idx % 7) + 1}`;"
    new_herb_tex = "    const herbTex = (herbDef?.icon && this.textures.exists(herbDef.icon))\n      ? herbDef.icon\n      : (this.textures.exists(`herb_${(idx % 7) + 1}`) ? `herb_${(idx % 7) + 1}` : 'mat_herb');"

    content = content.replace(old_herb_tex, new_herb_tex)

    with open(herbs_mixin_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated HerbsMixin.js with custom herb icons on map!")

    # 2. Update EnemyMixin.js
    enemy_mixin_file = r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\EnemyMixin.js'
    with open(enemy_mixin_file, 'r', encoding='utf-8') as f:
        e_content = f.read()

    old_bag_icon = """    // 2. Icon túi chiến lợi phẩm / Da thú / Nội Đan nảy lên mặt đất
    const bagIcon = core
      ? this.add.text(0, -10, '🔮', { fontSize: '20px' }).setOrigin(0.5)
      : (this.textures.exists('mat_beast_pelt')
        ? this.add.image(0, -10, 'mat_beast_pelt').setDisplaySize(28, 28)
        : this.add.text(0, -10, '🎒', { fontSize: '18px' }).setOrigin(0.5));"""

    new_bag_icon = """    // 2. Icon túi chiến lợi phẩm / Da thú / Nội Đan nảy lên mặt đất
    const coreIconKey = core ? `core_${core.key}` : null;
    const bagIcon = (core && coreIconKey && this.textures.exists(coreIconKey))
      ? this.add.image(0, -10, coreIconKey).setDisplaySize(28, 28)
      : (core
        ? this.add.text(0, -10, '🔮', { fontSize: '20px' }).setOrigin(0.5)
        : (this.textures.exists('mat_beast_pelt')
          ? this.add.image(0, -10, 'mat_beast_pelt').setDisplaySize(28, 28)
          : this.add.text(0, -10, '🎒', { fontSize: '18px' }).setOrigin(0.5)));"""

    e_content_norm = e_content.replace('\r\n', '\n')
    old_bag_norm = old_bag_icon.replace('\r\n', '\n')
    new_bag_norm = new_bag_icon.replace('\r\n', '\n')

    if old_bag_norm in e_content_norm:
        e_content_norm = e_content_norm.replace(old_bag_norm, new_bag_norm, 1)
        with open(enemy_mixin_file, 'w', encoding='utf-8') as f:
            f.write(e_content_norm)
        print("Updated EnemyMixin.js ground loot icon rendering!")
    else:
        print("Warning: old_bag_icon not found in EnemyMixin.js")

if __name__ == '__main__':
    update_spawns()
