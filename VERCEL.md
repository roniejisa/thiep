# Triển khai Lời Hẹn lên Vercel

Bản Next.js này đã gắn dự án `kpalhrcylytzrwxubnjf.supabase.co` và publishable key được cung cấp. Không cần nhập lại trong giao diện. Có thể thay dự án bằng hai biến `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` khi build.

## 1. Thiết lập Supabase (cần làm một lần)

1. Mở dự án trong Supabase Dashboard → SQL Editor. Chạy **toàn bộ** `public/supabase-setup.sql`. Tệp này tạo bảng thiệp, khách mời, lượt xem, lời chúc, bảng quản trị; bucket `wedding-assets` (ảnh 8 MB), `wedding-audio` (nhạc 20 MB) và các policy RLS. Có thể chạy lại; không xóa dữ liệu thiệp.
2. Vào Authentication → Users → Add user, tạo tài khoản email/mật khẩu của bạn. Nếu cần, xác nhận email tài khoản tại Dashboard. Không dùng tài khoản đăng nhập Dashboard thay cho tài khoản Authentication của ứng dụng.
3. Mở `supabase/grant-admin.sql`, thay `YOUR_ADMIN_EMAIL@example.com` bằng email vừa tạo, chạy trong SQL Editor. **Tài khoản đăng nhập thông thường không tự có quyền quản trị.**
4. Trong Authentication, tắt đăng ký tài khoản công khai nếu chỉ bạn quản trị. Ứng dụng không có trang đăng ký.
5. Nếu dự án có giới hạn upload toàn cục, bảo đảm giới hạn đó ít nhất 20 MB để tải nhạc.

Publishable key chỉ cấp quyền kết nối công khai, không có quyền chạy SQL, tạo bucket hay cấp admin. Vì vậy các bước Dashboard trên không thể thực hiện bằng key này. Không đưa secret key, service role key, mật khẩu database hoặc mật khẩu tài khoản vào frontend/Git.

## 2. Chạy trên máy tính

Cài Node.js 22.13 trở lên và pnpm theo phiên bản `packageManager` trong `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Lệnh `pnpm dev` trong bộ ZIP chạy Next.js tại `http://localhost:3000`. Tùy chọn: sao chép `.env.example` thành `.env.local` để thay cấu hình public. Các giá trị dự án mặc định đã có trong `lib/config.ts`.

```bash
pnpm build
```

Đầu ra static ở `out/`. Không dùng `next start` cho dự án `output: 'export'`. Có thể dùng `pnpm preview` để xem bản build bằng HTTP server Python nếu đã cài Python 3.

## 3. Deploy lên Vercel

1. Giải nén `loi-hen-vercel-source.zip`, đưa **nội dung thư mục `loi-hen`** lên một Git repository của bạn (thư mục có `package.json`). Không đưa file ZIP lên như mã nguồn.
2. Vào Vercel → Add New Project → Import repository đó. Chọn Framework Preset **Next.js**, Root Directory là thư mục chứa `package.json`.
3. Cấu hình đã có ở `vercel.json`: install `npx --yes pnpm@11.25.0 install --frozen-lockfile`, build `pnpm build`, đầu ra `out`. Bộ ZIP dùng các lệnh Next.js chuẩn, không cần công cụ của môi trường tạo Site.
4. Mặc định đã dùng Supabase được cung cấp. Nếu thay dự án, thêm hai biến public trong `.env.example` vào Vercel trước khi Deploy; thay biến sau đó cần Redeploy.
5. Sau Deploy, vào tên miền Vercel để đăng nhập tài khoản admin đã cấp ở bước 1. Đặt tên miền production làm Site URL trong Supabase Authentication nếu sau này dùng email khôi phục mật khẩu hoặc liên kết Auth. Luồng đăng nhập email/mật khẩu hiện tại không cần callback URL.

Tên miền xem thiệp phải cho phép khách truy cập công khai; không bật Vercel Deployment Protection yêu cầu khách đăng nhập ở môi trường production. Quyền chỉnh sửa vẫn do Supabase Auth và RLS kiểm tra.

## 4. Dùng thiệp và tải nhạc

- Mở `/` khi chưa đăng nhập: chỉ thấy trang đăng nhập. Phiên cũ được xác minh với Supabase trước khi tải editor; tài khoản chưa có quyền sẽ bị chặn.
- Đăng nhập quản trị → chọn mẫu, chỉnh ảnh/chữ, thêm tiện ích → **Lưu thiệp**.
- **Nhạc & Hiệu ứng → Tải bài nhạc của bạn**: tệp được POST trực tiếp vào `wedding-audio/<user-id>/<invite-id>/<random-id>.<ext>`, dùng access token của admin. Chỉ khi upload thành công, URL Storage mới được gắn vào thiệp. Sau đó **Lưu thiệp** để khách nhận bản nhạc mới. Chọn tệp không tự xuất bản thiệp.
- Nhạc hỗ trợ MP3/M4A/AAC/WAV/OGG/WebM, tối đa 20 MB. Khách chạm nút nhạc để phát theo quy định trình duyệt điện thoại.
- **Chia sẻ thiệp → nhập tên khách → Tạo liên kết** sẽ lưu và xuất bản thiệp, tạo mã khách, trả URL dạng `https://ten-mien-cua-ban/?invite=<id>&guest=<ten>&g=<ma-khach>` cùng QR. URL không kèm Project URL hoặc API key.
- Mở URL đó trên điện thoại: xem thiệp trực tiếp, không cần đăng nhập, không vào editor. `/invite/?invite=...` vẫn được hỗ trợ cho liên kết cũ cùng dự án. Liên kết mới không đổi đường dẫn sang `/invite/`.
- Khách chỉ đọc thiệp đã xuất bản. Danh sách liên lạc khách, bản nháp và quyền sửa/upload chịu RLS. Quyền admin còn giới hạn theo chủ sở hữu thiệp; admin khác không tự sửa thiệp của bạn.
- Phiên lưu trong sessionStorage của tab (không lưu mật khẩu), làm mới token khi gần hết hạn, kiểm tra quyền khi quay lại tab và mỗi phút. Thu hồi quyền ở database chặn thao tác dữ liệu ngay cả khi tab cũ còn mở; editor đóng khi lần kiểm tra tiếp theo thất bại.
- Đăng xuất ở **Tài khoản**. Thu hồi quyền quản trị bằng SQL ở cuối `supabase/grant-admin.sql`.

Ảnh và nhạc trong hai bucket là tài nguyên công khai dùng cho thiệp. Không tải tài liệu riêng tư vào hai bucket này. Sau khi đổi tên miền, tạo lại liên kết chia sẻ để dùng tên miền mới.

## 5. Kiểm tra và xử lý lỗi

- “Could not find the table …”: chưa chạy SQL hoặc chạy nhầm dự án.
- “Chưa kiểm tra được quyền quản trị”: chạy lại SQL tổng hợp, kiểm tra kết nối.
- “Tài khoản này chưa được cấp quyền quản trị”: kiểm tra Authentication user và chạy grant-admin.sql đúng email.
- “Invalid login credentials”: dùng email/mật khẩu user trong Authentication của dự án; kiểm tra email đã xác nhận.
- Upload báo bucket không tồn tại / RLS: chạy SQL tổng hợp, đăng nhập đúng admin, kiểm tra giới hạn file 20 MB.
- Thiệp không tồn tại / chưa chia sẻ: mở đúng URL từ nút Chia sẻ, đảm bảo thiệp được xuất bản và database đúng dự án.

Kiểm tra đã chạy trong môi trường tạo mã: TypeScript, build Next.js production; kiểm thử DOM phần đăng nhập/quyền quản trị, refresh/logout, tải nhạc trực tiếp với HTTP giả lập, liên kết khách và các chức năng thiệp; kiểm thử SQL thực trong PostgreSQL PGlite (RLS, người không có quyền, thu hồi admin, sở hữu file, RPC khách). Kiểm tra live bằng publishable key xác nhận Auth hoạt động nhưng bảng invitations chưa tồn tại tại thời điểm bàn giao. Chưa kiểm thử đăng nhập/upload live vì chưa có schema/admin; chưa kiểm tra hình ảnh bằng trình duyệt do preview không khả dụng. Sau khi thiết lập, nên thử một bản nhạc thật và mở link khách trên điện thoại trước khi gửi hàng loạt.

Tài liệu chính thức: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Next.js trên Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).
