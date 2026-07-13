# Bộ dữ liệu mẫu

## Thứ tự chạy

Trên database mới, chạy lần lượt:

1. `01_InitTables.sql`
2. `02_Seeds.sql`
3. `03_Auth.sql`
4. `04_DemoScenarios.sql`
5. `05_ValidateDemoData.sql`

Bộ seed này cố định ngày giờ để kết quả kiểm thử không thay đổi theo ngày chạy. Không chạy lặp trên database đã có dữ liệu vì các script seed nghiệp vụ không có mục đích migration.
Schema trong `01_InitTables.sql` là nguồn cấu trúc database duy nhất. Khi cấu trúc thay đổi,
tạo lại database và chạy đầy đủ các script theo thứ tự trên; không chạy lại seed trên database đã có dữ liệu.
Với database hiện hữu, chạy `06_AddKhachHangSequence.sql` trước khi triển khai phiên bản ứng dụng
dùng mã khách hàng tuần tự.

## Quy ước mã

Mã nghiệp vụ chỉ là số thứ tự, không mã hóa trạng thái hay use case:

| Loại dữ liệu | Dải mã |
|---|---|
| Khách hàng | `KH0001` - `KH0015` |
| Phiếu đăng ký | `PDK0001` - `PDK0010` |
| Lịch hẹn | `LH0001` - `LH0009` |
| Phiếu cọc | `PC0001` - `PC0009` |
| Hợp đồng | `HD0001` - `HD0006` |
| Hóa đơn | `HDON0001` - `HDON0004` |
| Phiếu đối soát | `PDS0001` - `PDS0002` |
| Phiếu thu | `PT0001` - `PT0003` |
| Phiếu hoàn cọc | `PHC0001` - `PHC0002` |
| Biên bản giao nhận | `BBGN0001` - `BBGN0003` |

## Phạm vi kiểm thử

- `PDK0001` - `PDK0010` phủ đăng ký đang xử lý, đã hẹn xem phòng và đã hủy.
- `LH0001` - `LH0009` phủ lịch xem phòng, nhận phòng và trả phòng với các trạng thái xác nhận, hủy, vắng mặt, check-in và hoàn thành.
- `PC0001` - `PC0009` phủ toàn bộ trạng thái phiếu cọc, cả `OGhep` và `NguyenCan`;
  `PC0009` là phiếu chờ Quản lý đối chiếu.
- `P004` - `P011` phủ toàn bộ trạng thái phòng; các giường tương ứng được seed đủ theo sức chứa loại phòng.
- `HD0001` - `HD0006` phủ vòng đời hợp đồng từ chờ ký đến đang hiệu lực, đã thanh lý và đã hủy.
- `HDON0001` - `HDON0004` phủ hóa đơn chưa thanh toán, thanh toán một phần, đã thanh toán và bồi thường.
- `PDS0001` - `PDS0002`, `PT0001` - `PT0003` và `PHC0001` - `PHC0002` phục vụ đối soát, thu tiền và hoàn cọc.
- `BBGN0001` - `BBGN0003` phục vụ bàn giao và thu hồi tài sản.

`03_Auth.sql` tạo các tài khoản phát triển `admin`, `sale`, `ketoan`, `quanly` để kiểm thử phân quyền.
Các màn hình lập phiếu, tính tiền, ghi nhận thanh toán và xác nhận khoản tiền cọc dùng API thật;
các màn hình chưa được chuyển đổi vẫn có thể dùng mock TypeScript riêng.
