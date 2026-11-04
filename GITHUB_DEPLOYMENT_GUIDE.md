# HƯỚNG DẪN ĐƯA VẠN TIÊN LỤC LÊN GITHUB & CHƠI TRÊN ĐIỆN THOẠI

Toàn bộ mã nguồn, cấu hình PWA, tối ưu đường dẫn tương đối và kịch bản tự động hóa **GitHub Actions CI/CD** đã được thiết lập hoàn chỉnh.

---

## 1. CÁC TỐI ƯU ĐÃ ĐƯỢC THỰC HIỆN TRƯỚC KHI LÊN GITHUB

1. **Cấu hình đường dẫn tương đối (vite.config.ts)**:
   - Thiết lập `base: './'` giúp game chạy mượt mà trên mọi domain GitHub Pages (dạng `https://<username>.github.io/<repo-name>/`), không bao giờ bị lỗi 404 assets.
2. **Tách gói nén siêu nhỏ (Code-splitting)**:
   - Tách thư viện Phaser (`1.48 MB` được cache vĩnh viễn trên điện thoại).
   - Mã nguồn game chỉ nặng vỏn vẹn **42 KB**, tải nhanh trong tích tắc ngay cả khi dùng mạng 3G/4G.
3. **Chuẩn hóa ứng dụng di động (PWA - Progressive Web App)**:
   - Tạo `manifest.json` và bộ icon Tiên Kiếm `icon.svg`.
   - Cho phép người chơi nhấn **"Thêm vào Màn hình chính" (Add to Home Screen)** trên Safari iOS / Chrome Android để chơi toàn màn hình không có thanh URL trình duyệt.
4. **Tối ưu hiển thị cho mọi loại màn hình điện thoại**:
   - Tương thích Dynamic Viewport Height (`100dvh`), Safe-area (tai thỏ / Dynamic Island của iPhone), chống chạm đúp phóng to ngoài ý muốn (`touch-action: manipulation`).
5. **Kịch bản tự động Deploy (.github/workflows/deploy.yml)**:
   - Mỗi khi bạn `git push`, GitHub Actions sẽ tự động biên dịch và xuất bản link chơi game trực tuyến mà không cần upload file thủ công.

---

## 2. CÁC BƯỚC ĐẨY LÊN REPO GITHUB

### Bước 1: Tạo Repository mới trên GitHub
1. Truy cập [github.com/new](https://github.com/new).
2. Đặt tên Repository (ví dụ: `van-tien-luc`).
3. Chọn chế độ **Public** (để dùng tính năng GitHub Pages miễn phí).
4. **Không** tích chọn *Add a README file* (vì dự án đã có sẵn).
5. Nhấn **Create repository**.

### Bước 2: Chạy các lệnh Git tại thư mục Game
Mở Terminal (hoặc Command Prompt) tại máy của bạn và chạy lần lượt các lệnh sau:

```bash
cd F:\GOOGLE\Game

# 1. Khởi tạo Git
git init -b main

# 2. Thêm toàn bộ mã nguồn đã tối ưu
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: Vạn Tiên Lục 2.5D Đạp Thủy Trảm Yêu - Mobile PWA ready"

# 4. Liên kết với Repository GitHub của bạn (thay URL bên dưới bằng URL repo của bạn)
git remote add origin https://github.com/<tai-khoan-github-cua-ban>/van-tien-luc.git

# 5. Đẩy code lên GitHub
git push -u origin main
```

---

## 3. BẬT GITHUB PAGES (CHỈ CẦN LÀM 1 LẦN)

1. Trên giao diện Repository của bạn ở GitHub, nhấn vào tab **Settings** (Cài đặt) ở thanh trên cùng.
2. Tại menu bên trái, chọn mục **Pages**.
3. Ở phần **Build and deployment** -> mục **Source**, chọn:
   👉 **GitHub Actions**
4. Đợi khoảng 1 - 2 phút, GitHub Actions sẽ tự động chạy xong và hiển thị đường link chơi game màu xanh, dạng:
   👉 `https://<tai-khoan-cua-ban>.github.io/van-tien-luc/`

---

## 4. HƯỚNG DẪN TRẢI NGHIỆM TRÊN ĐIỆN THOẠI
- Mở đường link trên bằng Safari (iOS) hoặc Chrome (Android).
- **Trên iPhone (Safari)**: Nhấn nút Chia sẻ (biểu tượng hình vuông có mũi tên lên) -> Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
- **Trên Android (Chrome)**: Nhấn dấu 3 chấm góc phải -> Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.
- Biểu tượng **Vạn Tiên Lục** sẽ xuất hiện trên màn hình điện thoại, mở ra chơi ở chế độ Full Screen màn hình dọc siêu mượt!
