import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

src_file = r"h:\GOOGLE DRIVER\GAME\src\scenes\mixins\ModalMixin.js"
modals_dir = r"h:\GOOGLE DRIVER\GAME\src\scenes\modals"
os.makedirs(modals_dir, exist_ok=True)

with open(src_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

def get_slice(start, end):
    # 1-indexed to 0-indexed
    return "".join(lines[start-1:end])

# 1. ModalCore.js
core_code = f"""/**
 * ModalCore.js
 * Chứa các hàm nền tảng: isModalOpen, createModalCloseBtn, closeModal
 */
import {{ W, H }} from '../constants.js';

export const ModalCore = {{
{get_slice(22, 29).rstrip()}

{get_slice(31, 68).rstrip()}

{get_slice(3031, 3053).rstrip()}
}};
"""

with open(os.path.join(modals_dir, "ModalCore.js"), "w", encoding="utf-8") as f:
    f.write(core_code)
print("Wrote ModalCore.js")

# 2. CharacterSectModal.js
char_sect_code = f"""/**
 * CharacterSectModal.js
 * Quản lý: openSectPanel, openCharacterPanel, openCurrencyExchangeModal
 */
import {{ REALMS }} from '../../config/realmsData.js';
import {{ SECTS, SECT_RANKS }} from '../../config/sectsData.js';
import {{ gameState }} from '../../state/gameState.js';
import {{ CONG_PHAP_LIST, CONG_PHAP_GRADES }} from '../../config/congPhapData.js';
import {{ CURRENCY_TIERS, CURRENCY_MAP, CURRENCY_RATIO, ensureCurrencies, addCurrency, deductCurrency, hasCurrency, exchangeUp, exchangeDown, formatCurrencySummary }} from '../../config/currencyData.js';
import {{ W, H }} from '../constants.js';

export const CharacterSectModal = {{
{get_slice(255, 332).rstrip()}

{get_slice(334, 491).rstrip()}

{get_slice(493, 628).rstrip()}
}};
"""

with open(os.path.join(modals_dir, "CharacterSectModal.js"), "w", encoding="utf-8") as f:
    f.write(char_sect_code)
print("Wrote CharacterSectModal.js")

# 3. SkillCongPhapModal.js
skill_cp_code = f"""/**
 * SkillCongPhapModal.js
 * Quản lý: getLearnedSkills, openQuickSkillSelectModal, openCongPhapPanel, openSkillPanel
 */
import {{ ELEMENTAL_SKILLS, SKILL_MASTERY_TIERS }} from '../../config/skillsData.js';
import {{ gameState }} from '../../state/gameState.js';
import {{ CONG_PHAP_LIST, CONG_PHAP_GRADES, getCongPhapById }} from '../../config/congPhapData.js';
import {{ ensureCurrencies, addCurrency, deductCurrency, hasCurrency }} from '../../config/currencyData.js';
import {{ W, H }} from '../constants.js';

export const SkillCongPhapModal = {{
{get_slice(70, 125).rstrip()}

{get_slice(127, 253).rstrip()}

{get_slice(630, 974).rstrip()}

{get_slice(1029, 1193).rstrip()}
}};
"""

with open(os.path.join(modals_dir, "SkillCongPhapModal.js"), "w", encoding="utf-8") as f:
    f.write(skill_cp_code)
print("Wrote SkillCongPhapModal.js")

# 4. WorldMapModal.js
map_code = f"""/**
 * WorldMapModal.js
 * Quản lý: openMapPanel (Bản đồ thế giới)
 */
import {{ WORLD_REGIONS, ALL_MAPS }} from '../../config/regionsData.js';
import {{ REALMS }} from '../../config/realmsData.js';
import {{ gameState }} from '../../state/gameState.js';
import {{ W, H }} from '../constants.js';

export const WorldMapModal = {{
{get_slice(976, 1027).rstrip()}
}};
"""

with open(os.path.join(modals_dir, "WorldMapModal.js"), "w", encoding="utf-8") as f:
    f.write(map_code)
print("Wrote WorldMapModal.js")

# 5. GearCraftingModal.js
gear_code = f"""/**
 * GearCraftingModal.js
 * Quản lý: openCraftingPanel, equipGearItem, unequipGear, openGearPanel, _showItemPopup
 */
import {{ CRAFTING_SYSTEM, calculatePillEfficiency, getPlayerPillRank, canCraftRecipe, deductCraftMaterials }} from '../../config/craftingData.js';
import {{ ALL_HERBS, getHerbByName }} from '../../config/herbsData.js';
import {{ INITIAL_ITEMS }} from '../../config/itemsData.js';
import {{ gameState }} from '../../state/gameState.js';
import {{ ensureCurrencies, addCurrency, deductCurrency, hasCurrency }} from '../../config/currencyData.js';
import {{ W, H }} from '../constants.js';

export const GearCraftingModal = {{
{get_slice(1195, 1390).rstrip()}

{get_slice(1392, 1408).rstrip()}

{get_slice(1410, 1421).rstrip()}

{get_slice(1423, 1801).rstrip()}

{get_slice(1803, 1950).rstrip()}
}};
"""

with open(os.path.join(modals_dir, "GearCraftingModal.js"), "w", encoding="utf-8") as f:
    f.write(gear_code)
print("Wrote GearCraftingModal.js")

# 6. SaveLoadWelcomeModal.js
save_code = f"""/**
 * SaveLoadWelcomeModal.js
 * Quản lý: openWelcomeScreenModal, openSaveGameModal, openLoadSaveModal, promptManualLoad
 */
import {{ REALMS }} from '../../config/realmsData.js';
import {{ gameState }} from '../../state/gameState.js';
import {{ exportSaveCode, importSaveCode, resetToNewGame, hasLocalSave, loadFromLocalStorage }} from '../../state/saveSystem.js';
import {{ ensureCurrencies }} from '../../config/currencyData.js';
import {{ W, H }} from '../constants.js';

export const SaveLoadWelcomeModal = {{
{get_slice(1952, 2063).rstrip()}

{get_slice(2065, 2197).rstrip()}

{get_slice(2199, 2302).rstrip()}

{get_slice(2304, 2324).rstrip()}
}};
"""

with open(os.path.join(modals_dir, "SaveLoadWelcomeModal.js"), "w", encoding="utf-8") as f:
    f.write(save_code)
print("Wrote SaveLoadWelcomeModal.js")

# 7. AdminTestModal.js
admin_code = f"""/**
 * AdminTestModal.js
 * Quản lý: openAdminTestModal (Menu GM / Test Game)
 */
import {{ REALMS }} from '../../config/realmsData.js';
import {{ ELEMENTAL_SKILLS, SKILL_MASTERY_TIERS }} from '../../config/skillsData.js';
import {{ ALL_HERBS }} from '../../config/herbsData.js';
import {{ gameState }} from '../../state/gameState.js';
import {{ CONG_PHAP_LIST, CONG_PHAP_GRADES }} from '../../config/congPhapData.js';
import {{ ensureCurrencies, addCurrency }} from '../../config/currencyData.js';
import {{ W, H }} from '../constants.js';

export const AdminTestModal = {{
{get_slice(2326, 3029).rstrip()}
}};
"""

with open(os.path.join(modals_dir, "AdminTestModal.js"), "w", encoding="utf-8") as f:
    f.write(admin_code)
print("Wrote AdminTestModal.js")

# 8. Rebuild ModalMixin.js as an aggregate
mixin_code = f"""/**
 * ModalMixin.js
 * Modular Modal Aggregator for Xianxia Game Scene
 * 
 * Tách thành các module chức năng độc lập:
 *  - ModalCore: isModalOpen, createModalCloseBtn, closeModal
 *  - CharacterSectModal: Nhân vật, Tông môn, Đổi linh thạch
 *  - SkillCongPhapModal: Kỹ năng, Công pháp 8 hệ
 *  - GearCraftingModal: Trang bị, Túi đồ, Luyện đan & Chế tạo
 *  - WorldMapModal: Bản đồ thế giới
 *  - SaveLoadWelcomeModal: Lưu game, Nạp save, Màn hình chào
 *  - AdminTestModal: Menu Test Game / GM Admin
 */
import {{ ModalCore }} from '../modals/ModalCore.js';
import {{ CharacterSectModal }} from '../modals/CharacterSectModal.js';
import {{ SkillCongPhapModal }} from '../modals/SkillCongPhapModal.js';
import {{ GearCraftingModal }} from '../modals/GearCraftingModal.js';
import {{ WorldMapModal }} from '../modals/WorldMapModal.js';
import {{ SaveLoadWelcomeModal }} from '../modals/SaveLoadWelcomeModal.js';
import {{ AdminTestModal }} from '../modals/AdminTestModal.js';

export const ModalMixin = {{
  ...ModalCore,
  ...CharacterSectModal,
  ...SkillCongPhapModal,
  ...GearCraftingModal,
  ...WorldMapModal,
  ...SaveLoadWelcomeModal,
  ...AdminTestModal
}};
"""

with open(src_file, "w", encoding="utf-8") as f:
    f.write(mixin_code)
print("Rebuilt ModalMixin.js cleanly!")
