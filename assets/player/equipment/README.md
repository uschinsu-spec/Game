# Player Equipment

Dùng thư mục này cho metadata hoặc asset trang bị ngoài.

Runtime API hiện có:
- `PlayerRuntime.equip(slot, id)`
- `PlayerRuntime.unequip(slot)`
- `PlayerRuntime.applyLoadout({...})`
- `PlayerRuntime.reset()`
- `PlayerRuntime.getEquipment()`
- `PlayerRuntime.list(slot)`

Loadout được lưu localStorage với key `babylon-mmorpg-player-loadout-v3`.
