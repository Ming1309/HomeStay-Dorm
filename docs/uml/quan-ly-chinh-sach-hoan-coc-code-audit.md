# Code Audit – UC 1.4.28 Quản lý chính sách hoàn cọc

## Mục tiêu nghiệp vụ

Chính sách hoàn cọc là dữ liệu có phiên bản. Mỗi lần quản trị thay đổi cấu hình phải tạo một bản ghi `ChinhSachHoanCoc` mới. Phiên bản trước chỉ được hệ thống đóng `NgayKetThuc`; không cập nhật đè tên, mốc lưu trú hoặc tỷ lệ. `HopDong.MaChinhSach` tiếp tục trỏ tới đúng phiên bản được áp dụng khi ký.

## Ánh xạ diagram–code

| Lifeline / Class | File thực thi |
|---|---|
| `MHQuanLyChinhSachHoanCoc` | `AdminDepositPolicyPage.tsx` và `deposit-policy-service.ts` |
| `QuanLyChinhSachHoanCoc` | `BusinessLogic/QuanLyChinhSachHoanCoc.cs` |
| `ChinhSachHoanCoc` | `BusinessLogic/ChinhSachHoanCoc.cs` |
| `ChinhSachHoanCocDB` | `DataAccess/DBs/ChinhSachHoanCocDB.cs` |

## Luồng tải lịch sử

1. UI gọi `GET /api/admin/deposit-policy` qua `layDanhSachChinhSach()`.
2. Control mở `PhienDuLieu` và gọi entity `ChinhSachHoanCoc.LayDanhSach()`.
3. Entity gọi `ChinhSachHoanCocDB.LayDanhSach()`.
4. DB trả các phiên bản theo `NgayApDung DESC`; control tính trạng thái theo ngày hiện tại khi tạo HTTP response.

## Luồng tạo phiên bản

1. React Hook Form và Zod kiểm tra tên, ngày hiệu lực, mốc tháng và bốn tỷ lệ `0..100%`.
2. UI đổi tỷ lệ về số thập phân `0..1`, gọi `POST /api/admin/deposit-policy` và chỉ hiện toast sau khi API thành công.
3. `QuanLyChinhSachHoanCoc.TaoPhienBan()` kiểm tra entity trước khi mở transaction.
4. Control đọc phiên bản mới nhất. `NgayApDung` mới phải lớn hơn ngày áp dụng của phiên bản đó.
5. Nếu phiên bản trước chưa kết thúc trước ngày áp dụng mới, entity cập nhật riêng `NgayKetThuc = NgayApDungMoi - 1 ngày`.
6. Entity sinh mã tuần tự, `INSERT` phiên bản mới và transaction hoàn tất nguyên khối.

Không có endpoint `PUT` cập nhật nội dung phiên bản cũ.

## HTTP contract

| Endpoint | Method | Auth | Kết quả |
|---|---|---|---|
| `/api/admin/deposit-policy` | GET | `QuanTri` | Toàn bộ lịch sử phiên bản |
| `/api/admin/deposit-policy/current` | GET | `QuanTri` | Phiên bản đang hiệu lực |
| `/api/admin/deposit-policy` | POST | `QuanTri` | Tạo phiên bản mới |

## Bảo toàn lịch sử khi đối soát

- Hồ sơ chưa ký hợp đồng dùng chính sách đang hiệu lực tại thời điểm đối soát.
- Hồ sơ hợp đồng dùng `HopDong.MaChinhSach` để đọc đúng phiên bản đã gắn với hợp đồng.
- Chỉ hợp đồng cũ không có `MaChinhSach` mới fallback về chính sách đang hiệu lực.
- Phiếu đối soát đã chốt vẫn lưu tỷ lệ thực tế trong `PhieuDoiSoat.TyLeHoanCoc`.

## Schema fresh init

`ChinhSachHoanCoc` có `NgayApDung NOT NULL`, `NgayKetThuc NULL`, unique index cho ngày áp dụng và check constraint cho mốc lưu trú/khoảng ngày. Seed `CS01` có ngày áp dụng ban đầu. Không có migration riêng vì môi trường kiểm thử được khởi tạo lại bằng init script.

## Kiểm tra alignment

- [x] Mọi lifeline sequence có class trong class diagram.
- [x] Mọi message là method có thật trong code.
- [x] Control chỉ điều phối entity, không gọi DB trực tiếp.
- [x] Entity sở hữu thao tác đọc, thêm và đóng ngày hiệu lực ở DB.
- [x] UI hiển thị lịch sử chỉ đọc và không cho sửa đè phiên bản.
