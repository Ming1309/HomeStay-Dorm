# Bộ dữ liệu mẫu

## Thứ tự chạy (database mới / reset)

Trên database mới, chạy lần lượt:

1. `01_InitTables.sql` — **đã gồm** `DROP DATABASE` + `CREATE DATABASE` + schema (kể cả `ThongBao`)
2. `02_Seeds.sql` — danh mục phòng/giường/tài sản/...
3. `03_Auth.sql` — tài khoản dev
4. `04_DemoScenarios.sql` — kịch bản nghiệp vụ
5. `05_ValidateDemoData.sql` — kiểm tra ràng buộc

> `01_InitTables.sql` tự drop/create database `HomeStay`. Chỉ cần chạy 5 file theo thứ tự trên là đủ reset sạch.

### Ví dụ với Docker SQL Server (`homestay-sql`)

```bash
# Copy scripts vào container
docker cp src/HomeStay.Application/DataAccess/SqlScripts homestay-sql:/tmp/sql

# Chạy theo thứ tự (-I bật QUOTED_IDENTIFIER, cần cho computed column ChiTietHoaDon)
docker exec homestay-sql bash -lc '
  for f in 01_InitTables.sql 02_Seeds.sql 03_Auth.sql 04_DemoScenarios.sql 05_ValidateDemoData.sql; do
    echo "=== $f ==="
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MyStrongPass123" -C -I -i "/tmp/sql/$f"
  done
'
```

### Ví dụ với sqlcmd local

```bash
SERVER="localhost,1433"
USER="sa"
PASS="MyStrongPass123"
DIR="src/HomeStay.Application/DataAccess/SqlScripts"

for f in 01_InitTables.sql 02_Seeds.sql 03_Auth.sql 04_DemoScenarios.sql 05_ValidateDemoData.sql; do
  # -I / -C: QUOTED_IDENTIFIER ON + TrustServerCertificate
  sqlcmd -S "$SERVER" -U "$USER" -P "$PASS" -C -I -i "$DIR/$f"
done
```

Bộ seed này cố định ngày giờ để kết quả kiểm thử không thay đổi theo ngày chạy. Không chạy lặp trên database đã có dữ liệu vì các script seed nghiệp vụ không có mục đích migration (ngoại trừ `01_InitTables.sql` vốn drop/create).
Schema trong `01_InitTables.sql` là nguồn cấu trúc database duy nhất. Khi cấu trúc thay đổi,
tạo lại database và chạy đầy đủ các script theo thứ tự trên.

## Quy ước mã

Mã nghiệp vụ chỉ là số thứ tự, không mã hóa trạng thái hay use case:

| Loại dữ liệu | Dải mã |
|---|---|
| Khách hàng | `KH0001` - `KH0015` |
| Phiếu đăng ký | `PDK0001` - `PDK0010` |
| Lịch hẹn | `LH0001` - `LH0010` |
| Phiếu cọc | `PC0001` - `PC0009` |
| Hợp đồng | `HD0001` - `HD0006` |
| Hóa đơn | `HDON0001` - `HDON0004` |
| Phiếu đối soát | `PDS0001` - `PDS0002` |
| Phiếu thu | `PT0001` - `PT0003` |
| Phiếu hoàn cọc | `PHC0001` - `PHC0002` |
| Biên bản giao nhận | `BBGN0001` - `BBGN0003` |
| Thông báo | `TB...` (sinh runtime) |

## Phạm vi kiểm thử

- `PDK0001` - `PDK0010` phủ đăng ký đang xử lý, đã hẹn xem phòng và đã hủy.
- `LH0001` - `LH0010` phủ lịch xem phòng, nhận phòng và trả phòng; `LH0010` là lịch trả phòng **trong ngày** cho `HD0004` (UC 1.4.17).
- `PC0001` - `PC0009` phủ toàn bộ trạng thái phiếu cọc, cả `OGhep` và `NguyenCan`;
  `PC0009` là phiếu chờ Quản lý đối chiếu.
- `P004` - `P011` phủ toàn bộ trạng thái phòng; các giường tương ứng được seed đủ theo sức chứa loại phòng.
  `P007` có danh mục tài sản phục vụ UC thu hồi.
- `HD0001` - `HD0006` phủ vòng đời hợp đồng từ chờ ký đến đang hiệu lực, đã thanh lý và đã hủy.
- `HDON0001` - `HDON0004` phủ hóa đơn chưa thanh toán, thanh toán một phần, đã thanh toán và bồi thường.
- `PDS0001` - `PDS0002`, `PT0001` - `PT0003` và `PHC0001` - `PHC0002` phục vụ đối soát, thu tiền và hoàn cọc.
- `BBGN0001` - `BBGN0003` phục vụ bàn giao và thu hồi tài sản.
- Bảng `ThongBao` / `ThongBao_NguoiDoc` phục vụ chuông thông báo theo vai trò (header Bell).

`03_Auth.sql` tạo các tài khoản phát triển `admin`, `sale`, `ketoan`, `quanly` để kiểm thử phân quyền.
Các màn hình lập phiếu, tính tiền, ghi nhận thanh toán và xác nhận khoản tiền cọc dùng API thật;
các màn hình chưa được chuyển đổi vẫn có thể dùng mock TypeScript riêng.
