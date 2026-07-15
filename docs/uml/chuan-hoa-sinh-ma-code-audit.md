# Code audit: chuẩn hoá sinh mã

## Quy tắc

- Mã hiển thị dùng `prefix + số tăng dần`; SQL Server sequence chịu trách nhiệm cấp số.
- `MaSoDB` là whitelist nội bộ của DataAccess. Không nhận loại mã từ HTTP request.
- DB class sở hữu bản ghi cấp mã trước khi insert và gán mã trở lại entity trong cùng transaction.
- Sequence có thể nhảy số khi rollback; primary key/unique constraint bảo vệ trùng mã.
- GUID của thông báo và tên file, cùng các mã tự nhiên `MaCN`/`MaLP`, không đổi.

## Mapping

| Nhóm | Prefix | Độ rộng tối thiểu |
|---|---:|---:|
| Khách hàng / nhân viên | `KH` / `NV` | 4 / 2 |
| Phòng / giường | `P` / `G` | 3 / 3 |
| Dịch vụ / tài sản / quy định / chính sách | `DV` / `TS` / `QD` / `CS` | 2 |
| Đăng ký / lịch hẹn / cọc / hợp đồng | `PDK` / `LH` / `PC` / `HD` | 4 |
| Bàn giao / thu hồi | `BBBG` / `BBTH` | 4 |
| Hóa đơn / đối soát / thu / hoàn | `HDON` / `PDS` / `PT` / `PHC` | 4 |

## UML

SQL sequence và `MaSoDB` không phải thành phần nghiệp vụ nên không xuất hiện như class hoặc
lifeline. Class diagram giữ quan hệ entity → DB class; sequence diagram chỉ gọi `Them()`/`Luu()`.
Có thể ghi chú tại thao tác insert rằng database cấp mã trước khi lưu.
