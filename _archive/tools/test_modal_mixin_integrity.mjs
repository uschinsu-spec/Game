import { ModalMixin } from '../src/scenes/mixins/ModalMixin.js';

const expectedMethods = [
  'isModalOpen',
  'createModalCloseBtn',
  'closeModal',
  'openSectPanel',
  'openCharacterPanel',
  'openCurrencyExchangeModal',
  'getLearnedSkills',
  'openQuickSkillSelectModal',
  'openSkillPanel',
  'openCongPhapPanel',
  'openMapPanel',
  'equipGearItem',
  'unequipGear',
  'openGearPanel',
  '_showItemPopup',
  'openCraftingPanel',
  'openWelcomeScreenModal',
  'openSaveGameModal',
  'openLoadSaveModal',
  'promptManualLoad',
  'openAdminTestModal'
];

let allPassed = true;
console.log('=== KIỂM TRA TẤT CẢ 21 METHODS CỦA MODAL MIXIN ===');

for (const m of expectedMethods) {
  if (typeof ModalMixin[m] === 'function') {
    console.log(`✅ Method [${m}] tồn tại chính xác`);
  } else {
    console.error(`❌ THIẾU METHOD [${m}]!`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n🌟 100% TẤT CẢ METHODS CỦA MODAL MIXIN ĐÃ ĐƯỢC TÍCH HỢP HOÀN TOÀN TƯƠNG THÍCH!');
} else {
  process.exit(1);
}
