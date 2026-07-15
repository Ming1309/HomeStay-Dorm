# Bộ dữ liệu mẫu

## Phạm vi chi nhánh

- `CN01`: `sale`, `quanly`, `ketoan`.
- `CN02`: `sale.cn02`, `quanly.cn02`, `ketoan.cn02` (dùng cùng mật khẩu demo với vai trò tương ứng ở CN01).
- `PhieuDangKy`, `LichHen` và `PhieuCoc` giữ snapshot `MaCN`; chứng từ downstream suy ra chi nhánh qua `PhieuCoc`.
- `PC0001`–`PC0004`, `PC0007`, `PC0009`, `PC0010` thuộc CN01; `PC0005`, `PC0006`, `PC0008` thuộc CN02 để kiểm tra queue không rò chéo.

## Thứ tự chạy (database mới / reset)

Trên database mới, chạy lần lượt:

1. `01_InitTables.sql` — **đã gồm** `DROP DATABASE` + `CREATE DATABASE` + schema (kể cả `ThongBao`)
2. `02_Seeds.sql` — danh mục phòng/giường/tài sản/...
3. `03_Auth.sql` — tài khoản dev
4. `04_DemoScenarios.sql` — kịch bản nghiệp vụ
5. `05_ValidateDemoData.sql` — kiểm tra ràng buộc

> `01_InitTables.sql` tự drop/create database `HomeStay` và tạo luôn filtered unique index chống trùng PĐS cho phiếu cọc chưa ký. Chạy 5 file theo thứ tự trên để reset sạch.

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
tạo lại database và chạy đầy đủ các script theo thứ tự trên; không chạy lại seed trên database đã có dữ liệu.
Các SQL sequence cấp mã được tạo trong `01_InitTables.sql`. Sau seed demo,
`04_DemoScenarios.sql` restart từng sequence sau mã lớn nhất để dữ liệu runtime không trùng seed.
Sequence là chi tiết hạ tầng database, không phải participant trong UML nghiệp vụ.

## Quy ước mã

Mã nghiệp vụ chỉ là số thứ tự, không mã hóa trạng thái hay use case:

| Loại dữ liệu | Dải mã |
|---|---|
| Khách hàng | `KH0001` - `KH0015` |
| Phiếu đăng ký | `PDK0001` - `PDK0010` |
| Lịch hẹn | `LH0001` - `LH0010` |
| Phiếu cọc | `PC0001` - `PC0010` |
| Hợp đồng | `HD0001` - `HD0007` |
| Hóa đơn | `HDON0001` - `HDON0004` |
| Phiếu đối soát | `PDS0001` - `PDS0004` |
| Phiếu thu | `PT0001` - `PT0007` |
| Phiếu hoàn cọc | `PHC0001` - `PHC0002` |

Runtime tiếp tục dùng đúng prefix và độ rộng tối thiểu trong bảng trên. Mã có thể nhảy số khi
transaction rollback vì SQL sequence không hoàn lại giá trị đã cấp; đây là hành vi chủ đích.
| Phiếu hoàn cọc | `PHC0001` - `PHC0002` |
| Biên bản giao nhận | `BBBG0001` - `BBBG0002`, `BBTH0001` - `BBTH0003` |
| Thông báo | `TBDEMO0001` - `TBDEMO0005`, các mã `TB...` khác sinh runtime |

## Phạm vi kiểm thử

- `PDK0001` - `PDK0010` phủ đăng ký đang xử lý, đã hẹn xem phòng và đã hủy.
- `LH0001` - `LH0010` phủ lịch xem phòng, nhận phòng và trả phòng; `LH0010` là lịch trả phòng **trong ngày** cho `HD0004` (UC 1.4.17).
- `PC0001` - `PC0010` phủ toàn bộ trạng thái phiếu cọc, cả `OGhep` và `NguyenCan`;
  `PC0007` / `PT0004` là phiếu đã thu tiền bị hủy chờ đối soát, `PC0008` / `PT0006` là phiếu đã thu tiền chưa có hợp đồng có thể dùng để thử thao tác hủy, `PC0009` là phiếu chờ Quản lý đối chiếu.
- `P004` - `P011` phủ toàn bộ trạng thái phòng; các giường tương ứng được seed đủ theo sức chứa loại phòng.
  `P007` có danh mục tài sản phục vụ UC thu hồi.
- `HD0001` - `HD0007` phủ vòng đời hợp đồng từ chờ ký đến đang hiệu lực, đã thanh lý và đã hủy.
- `HDON0001` - `HDON0004` phủ hóa đơn chưa thanh toán, thanh toán một phần, đã thanh toán và bồi thường.
- `PDS0001` - `PDS0002` đã tất toán và có PHC; `PDS0003` đã được khách đồng ý, chờ thanh lý; `PDS0004` ở `ChoXacNhan` để Quản lý thao tác.
- `PT0001` - `PT0007` đều có minh chứng; `PHC0001` - `PHC0002` có chứng từ giao/chuyển tiền, trong đó chuyển khoản có mã giao dịch.
- `BBBG0001` - `BBBG0002` phục vụ bàn giao; `BBTH0001` - `BBTH0003` phục vụ thu hồi tài sản.
- `BBTH0001` là biên bản thu hồi `HD0004` có tài sản `Hư hỏng`/`Mất mát`, **chưa** có hóa đơn bồi thường — phục vụ UC 1.4.20.
- `TBDEMO0001`/`TBDEMO0002` là tác vụ CN01; `TBDEMO0003`/`TBDEMO0004` là tác vụ CN02;
  `TBDEMO0005` minh họa tác vụ đã được một Quản lý xử lý. Thông báo trực tiếp và theo vai trò
  đều bị giới hạn bởi snapshot chi nhánh; trạng thái đọc vẫn riêng theo từng nhân viên.

`03_Auth.sql` tạo các tài khoản phát triển `admin`, `sale`, `ketoan`, `quanly` để kiểm thử phân quyền.
Các màn hình lập phiếu, tính tiền, ghi nhận thanh toán và xác nhận khoản tiền cọc dùng API thật;
các màn hình chưa được chuyển đổi vẫn có thể dùng mock TypeScript riêng.
