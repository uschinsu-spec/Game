# Save Migration — GAME2 Final

GAME2 dùng SaveSystem versioned/checksummed với primary + backup1 + backup2 và các domain state hiện hành. Derived combat stats không được lưu làm nguồn authority.

`core/legacy-migration-reader.js` là nơi duy nhất được phép biết các key cũ `tv-prog-v2`, `tv-prog-v3`, `game2-legacy-economy-bridge`.

Policy:
- Đọc một lần để ghi `migrationAudit`.
- Không chuyển `gear/skill/pet/research/power` counter cũ thành item, mastery, pet strength hay CP.
- Sau khi audit được persist, các key legacy được xóa.
- Nếu save hiện hành lỗi checksum, SaveSystem thử backup theo thứ tự primary → backup1 → backup2.
- Fresh save bắt đầu bằng progression tu luyện GAME2, không tạo Level/Stage/Wave/CombatEXP hoặc power score.
