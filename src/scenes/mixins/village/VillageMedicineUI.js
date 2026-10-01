export function openVillageMedicineModal(scene) {
  return scene?.openNpcDialogModal?.('duoc_diem') ?? null;
}
