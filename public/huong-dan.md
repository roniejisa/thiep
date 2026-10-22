# Cập nhật đăng nhập và Supabase

Trang chính yêu cầu tài khoản quản trị. Khách mở liên kết `/?invite=...` để xem thiệp trực tiếp. Dự án Supabase đã được gắn sẵn; không cần nhập URL/key trong giao diện. Chạy `supabase-setup.sql` trong SQL Editor, tạo user trong Authentication rồi cấp quyền qua `supabase/grant-admin.sql` trước khi sử dụng. Hướng dẫn đầy đủ nằm trong `VERCEL.md` của bộ mã nguồn.

Khi chọn nhạc, file được tải ngay lên `wedding-audio` trong Supabase Storage. Sau thông báo thành công, nhấn **Lưu thiệp** để cập nhật cho khách. Nhạc tối đa 20 MB; ảnh tối đa 8 MB. Vào **Tài khoản** để mở thiệp đã lưu hoặc đăng xuất.

---

# Lời Hẹn — Hướng dẫn các tính năng mới

Mở **Nhạc & Hiệu ứng** ngay trên thanh công cụ bên trái để tải nhạc và chọn chuyển động. Các tính năng khác nằm trong **Quản trị** ở đầu trình tạo thiệp. Chọn **Xem thử toàn bộ thiệp** để cuộn xuống/cuộn lên trên thiệp thật; đổi thiết lập xong cần lưu trước khi gửi khách. Khách xem thiệp theo chiều dọc trên điện thoại; không cần mở bìa hoặc lật trang. Chữ mặc định lướt nhẹ khi vào màn hình và chạy lại khi cuộn ngược. Hiệu ứng nền được bật riêng theo lựa chọn của bạn.

## Kết nối dữ liệu lần đầu hoặc cập nhật phiên bản cũ

1. Chạy toàn bộ `public/supabase-setup.sql` từ bộ mã nguồn trong SQL Editor của dự án Supabase. Có thể chạy lại; không xóa các thiệp đang có.
2. Tạo tài khoản email/mật khẩu trong Supabase Authentication, rồi chạy `supabase/grant-admin.sql` với đúng email để cấp quyền quản trị.
3. Mở trang chính, đăng nhập tài khoản quản trị. Project URL/key đã gắn sẵn. Vào **Tài khoản** để xem các thiệp đã lưu hoặc đăng xuất.
4. Lưu thiệp trước khi thêm khách. Bật các phần muốn hiển thị rồi **Lưu thiết lập**. Tạo liên kết gửi khách sẽ xuất bản bản thiết kế hiện tại.

Phải đăng nhập quản trị mới vào được trình thiết kế. Khách mời, lời chúc và thống kê dùng dữ liệu thật; bản xem thử không sinh phản hồi hoặc số liệu mẫu.

## 19 tính năng nằm ở đâu?

| Tính năng | Cách sử dụng |
|---|---|
| Đếm lượt truy cập | Bật ở Nội dung; xem tổng lượt mở và thiết bị ở Thống kê. Bản xem thử không tính. |
| Photobook online | Nội dung → thêm tối đa 40 ảnh; khách chạm mở ảnh lớn, vuốt hoặc bấm để đổi ảnh. |
| Lời chúc và phản hồi | Bật hộp lời chúc ở Nội dung; duyệt, ẩn, trả lời hoặc xóa trong Lời chúc. Lời chúc mới chờ duyệt. |
| QR mừng cưới hai bên | Nội dung → điền ngân hàng, STK, chủ tài khoản và tải đúng ảnh QR từ ngân hàng cho cô dâu/chú rể. Khách mở ảnh lớn hoặc sao chép STK. |
| Thông tin song thân | Nội dung → tên bố mẹ hai bên. |
| Nhạc nền cá nhân | Nhạc & Hiệu ứng → tải MP3/M4A/AAC/WAV/OGG/WebM tối đa 20 MB hoặc nhập URL HTTPS. Chỉnh âm lượng, bật/tắt lặp và nghe thử ngay trong bảng. Khách chạm Phát nhạc ở góc dưới thiệp. |
| Đổi mẫu | Chọn mẫu trong bộ sưu tập; giữ tên, ảnh và thiết lập đã nhập. Dùng Hoàn tác nếu muốn quay lại. Mẫu Save the Date có bố cục thông báo một trang. |
| Ẩn tên nền tảng | Tùy chỉnh → Ẩn tên nền tảng trong thiệp. Chỉ áp dụng cho trang thiệp khách xem. |
| Custom Code | Tùy chỉnh → HTML/CSS/JavaScript trong iframe riêng, chiều cao 100–2.000 px. Không truy cập dữ liệu trình quản trị. |
| Quản lý khách mời | Khách mời → thêm/sửa/xóa; nhóm, điện thoại, email, giới hạn người đi cùng; nhập/xuất CSV. |
| QR riêng | Tùy chỉnh → màu mã, màu nền, dòng chữ; tải QR PNG từ cửa sổ chia sẻ hoặc bảng xem thử trên máy tính. Hai màu phải có độ tương phản tốt. |
| Thông báo người xem | Tùy chỉnh → bật thông báo dạng thanh hoặc hộp đóng được. |
| Save the Date | Bộ sưu tập → 2 mẫu Save the Date. |
| Thiệp theo tên và gửi | Chia sẻ thiệp → nhập tên để tạo khách và liên kết riêng. Hoặc Khách mời → Tạo / gửi thiệp để dùng lại liên kết của khách đã có. Sao chép, mở công cụ chia sẻ của thiết bị hoặc soạn email. Bạn tự chọn người nhận và gửi. |
| Tải lời chúc | Lời chúc → Tải lời chúc CSV, gồm lời chúc, phản hồi và trạng thái duyệt. |
| Mẫu VIP | Bộ sưu tập → 4 mẫu VIP, bên cạnh 8 mẫu cơ bản. |
| Hiệu ứng | Nhạc & Hiệu ứng → chữ hiện dần/lướt nhẹ/phóng nhẹ; bật Chạy lại mỗi khi chữ vào màn hình để cuộn cả hai chiều. Chọn chim bay, bóng bay, tim rơi, tim bay, pháo giấy, tuyết rơi, hoa rơi, lấp lánh hoặc ký hiệu riêng, chỉnh mật độ và xem trực tiếp. Chim và bóng tự giảm số lượng để thiệp thoáng hơn trên điện thoại. Thiết bị yêu cầu giảm chuyển động ưu tiên nội dung tĩnh. |
| Tùy chọn logo | Tùy chỉnh → logo mặc định, chữ riêng, ảnh riêng hoặc ẩn. |
| Tên miền riêng | Tên miền → lưu hostname mong muốn rồi gửi hostname trong cuộc trò chuyện để gắn vào hosting và nhận bản ghi DNS/xác minh chính xác. Lưu trường này chưa kết nối DNS. |

## Gửi thiệp và nhận xác nhận tham dự

- Bật **Xác nhận tham dự** ở Nội dung và lưu.
- Tạo khách trong Khách mời, đặt số người tối đa (1–20) rồi chọn **Tạo / gửi thiệp**. Liên kết có mã riêng cho khách. Khách không cần tài khoản Supabase.
- Nút Chia sẻ thiệp ở đầu trang cũng tạo khách mới với giới hạn mặc định 1 người. Vào Quản trị để sửa số người hoặc dùng lại liên kết khách đã có; tên trùng có thể là hai lời mời khác nhau.
- Khách chọn tham dự/không tham dự và gửi phản hồi. Trình quản trị hiển thị trạng thái; cập nhật ở Thống kê để xem tổng số người.
- Ô **Đã gửi** do bạn đánh dấu sau khi gửi, không phải báo cáo phát email hoặc tin nhắn.
- **Đã mở** được ghi nhận khi bật đếm lượt truy cập và khách mở đúng liên kết cá nhân.

## Dữ liệu và quyền truy cập

Danh sách khách và liên hệ chỉ chủ thiệp có quyền quản trị đọc/sửa được qua RLS. Khách chỉ tra cứu và phản hồi lời mời có mã của mình; lời chúc chỉ công khai sau khi duyệt. Lời chúc giới hạn 3 lần/10 phút cho mỗi mã thiết bị trên từng thiệp.

Thiệp đã xuất bản và ảnh/nhạc trong Storage công khai được dùng cho người nhận thiệp. Không đưa mật khẩu, khóa bí mật hoặc thông tin riêng vào nội dung thiệp hay mã tùy chỉnh. Thiết bị được đếm bằng mã ngẫu nhiên trong trình duyệt, không phải định danh cá nhân chính xác.

Bản xem trước được lưu tại môi trường tạo Site vẫn giữ quyền riêng tư của chủ sở hữu. Khi đưa source lên Vercel, dùng tên miền production cho phép khách truy cập để chia sẻ thiệp; phần chỉnh sửa vẫn cần đăng nhập quản trị. Gắn tên miền không tự cấu hình DNS. Tên miền cần bạn sở hữu/quản lý và cấu hình DNS theo bản ghi hosting trả về.

Dự án Supabase đã kết nối được nhưng chưa có bảng dữ liệu tại thời điểm kiểm tra. Cần chạy SQL và cấp tài khoản quản trị trước khi đăng nhập/lưu/upload thật. Kiểm tra trực tiếp trên iPhone/Android chưa hoàn tất do preview không khả dụng.
