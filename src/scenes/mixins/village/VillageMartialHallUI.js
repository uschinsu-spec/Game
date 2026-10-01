export function openVillageMartialHallModal(scene) {
  return scene?.openNpcDialogModal?.('vo_quan') ?? null;
}
