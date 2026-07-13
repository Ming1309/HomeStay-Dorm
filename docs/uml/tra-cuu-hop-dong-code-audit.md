# Đối chiếu code: Tra cứu hợp đồng

## Luồng kiến trúc

- `MHTraCuuHopDong` (`ContractLookupWorkspace`) chỉ gọi API của `TraCuuHopDong`; màn hình không thay đổi dữ liệu nghiệp vụ.
- `TraCuuHopDong` điều phối `HopDong`, `ThanhVienHopDong`, `DichVuHopDong`; mỗi business entity tự gọi DB class tương ứng.
- `HopDong.DocChiTiet` load header qua `HopDongDB`, sau đó gọi `ThanhVienHopDong.LayDanhSachTheoHopDong` và `DichVuHopDong.LayDanhSachTheoHopDong` (không gọi `*DB` chéo từ DB class).
- Phiên dữ liệu `PhienDuLieu` bao trọn mỗi method của control; control không import `*DB`.

## Dòng sự kiện UC 1.4.16

| Bước | Hành vi | Code |
| :-- | :-- | :-- |
| 1 Mở màn hình | Load HĐ đang hiệu lực (A2) | `TimKiem(null, null)` → `HopDong.LayDanhSachHieuLuc()` |
| 2 Nhập tiêu chí + Tìm | Lọc theo từ khóa/trạng thái | `HopDong.TimKiem(tuKhoa, trangThai)` → `HopDongDB.TraCuu` |
| A2 Không nhập tiêu chí | Danh sách HĐ `DangHieuLuc` | Control kiểm tra rỗng → `LayDanhSachHieuLuc` |
| A3 Không có kết quả | Empty state + toast | Frontend `items.length === 0` |
| 3 Chọn HĐ | Chi tiết + thành viên + dịch vụ | `HopDong.DocChiTiet` → load `ThanhVienHopDong` + `DichVuHopDong` |

## Trạng thái và dữ liệu

- `HopDong.TrangThai`: `ChoKy`, `ChoThanhToan`, `ChoBanGiao`, `DangHieuLuc`, `DaThanhLy`, `DaHuy`.
- Tiền cọc hiển thị lấy từ `PhieuCoc.TongTien` qua `MaPhieuCoc` (field `TienCoc` trên entity read-only).
- Thành viên: mọi bản ghi `ChiTietHopDong` (kể cả `DaTra`).
- Dịch vụ: `HopDong_DichVu` + `DichVu` với `DonGiaKyKet`.

## Ranh giới HTTP

- Route: `GET /api/contracts/lookup`, `GET /api/contracts/{id}/lookup`.
- Roles: `Sale`, `QuanLy`, `KeToan`.
- Controller chỉ map DTO; logic A2 nằm trong `TraCuuHopDong.TimKiem`.
- `KeyNotFoundException` → HTTP 404; `ArgumentException` → HTTP 400.

## UI

- 1 workspace dùng chung 3 route: `/sale/tra-cuu-hop-dong`, `/manager/contracts`, `/accountant/tra-cuu-hop-dong`.
- Split-view: list trái `w-[350px]` + panel chi tiết phải.
- Badge: pending = amber, active = blue, liquidated = purple, cancelled = red (theo `.agent/RULES.md` §5).
