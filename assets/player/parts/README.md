# Player Parts

Mỗi thư mục là một slot độc lập. Mỗi file part phải đăng ký qua `PlayerPartRegistry.register({ id, slot, type, ... })`.

Slot chuẩn: `body`, `head`, `hair`, `chest`, `hands`, `legs`, `boots`, `mainhand`, `offhand`, `back`, `accessory`.

Để thêm part procedural mới, đặt code vào đúng thư mục và thêm `<script>` tương ứng trong `index.html` trước `equipment-system.js`.

Để thay GLB cứng như kiếm, khiên, cánh, phụ kiện: đăng ký `type: "glb-rigid"`, `rootUrl`, `fileName`, `mount`, `position`, `rotation`, `scale`.
