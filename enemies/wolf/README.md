# Quái vật Sói Hoang Dã (Wolf)

Module kẻ địch Sói Hoang Dã (`wolf`) theo kiến trúc Enemy System độc lập:

- `config.js`: Định nghĩa các chỉ số HP, tốc độ chạy, tầm đánh cận chiến (`attackRange: 2.8`), sát thương, animation timing và bảng màu sắc nét.
- `visual.js`: Tạo dựng mô hình sói 3D chi tiết với đầy đủ bộ phận giải phẫu động:
  - **Thân & Bờm ngực:** Lồng ngực dã thú nở nang, bờm lông xù, sống lưng giáp phiến gai nhọn và phù ấn săn mồi.
  - **Đầu & Mõm sói:** Hộp sọ góc cạnh, mõm nhọn, hàm dưới há mở khi cắn/gầm (`wolf_jaw`), nanh nhọn hoắt, đôi tai nhọn thẳng đứng và mắt sói ánh vàng hổ phách phát quang.
  - **4 Chân săn mồi:** Cặp chân trước linh hoạt, cặp chân sau với khớp gối ngược đặc trưng của loài thú săn mồi kết hợp bàn chân móng vuốt sắc bén.
  - **Đuôi sói linh hoạt:** Đuôi 3 đốt đung đưa mượt mà theo nhịp thở khi Idle và bay lướt khi Run/Attack.
  - **Hệ thống hoạt ảnh tự nhiên:** Vòng lặp phi nước kiệu (gallop), nhịp thở, vồ cắn (lunge bite), giật lùi (hit) và gục ngã (death).
- `textures/`: Bộ texture PBR/Standard siêu nhẹ tối ưu di động:
  - `wolf_fur.png`: Bộ lông sói săn mồi.
  - `wolf_underbelly.png`: Lông bụng & bờm ngực.
  - `wolf_armor.png`: Gai sống lưng.
  - `wolf_bone.png`: Răng nanh & vuốt.
  - `wolf_claw.png`: Móng vuốt & mũi.
  - `wolf_eye.png`: Mắt sói hổ phách phát sáng.
  - `wolf_accent.png`: Phù ấn dã thú.
