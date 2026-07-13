# Đối chiếu code: Thanh lý hợp đồng (UC 1.4.23)

## Luồng kiến trúc

- `MHThanhLyHopDong` (`/manager/termination` + `TerminationPanel`) chỉ gọi API; màn hình không tự ghi DB.
- Sơ đồ class/sequence **không** có control class — MH gọi thẳng entity. Trong web stack, `ThanhLyHopDongController` là **HTTP adapter** của MH (map DTO, auth claim `MaNV`, mở `PhienDuLieu` + transaction khi ghi).
- Controller **không** import `*DB`; mỗi entity tự gọi DB class.
- `PhienDuLieu` bao trọn transaction khi thanh lý (cập nhật HĐ + ChiTietHopDong + Giuong + optional `ThongBao`).
- Notify Kế toán: HTTP adapter gọi `DichVuThongBao.GuiThongBaoKeToan` trong cùng transaction khi `TienHoan > 0` (không vẽ lifeline trên sequence theo uml-rules — ghi ở audit).

## Dòng sự kiện UC 1.4.23

| Bước | Hành vi | Code |
| :-- | :-- | :-- |
| 1.0–1.2 Load HĐ chờ thanh lý | `DangHieuLuc` + EXISTS PDS | `HopDong.LayDanhSachChoThanhLy` → `HopDongDB.LayDanhSachChoThanhLy` |
| 2.0–2.2 Chọn HĐ | Chi tiết HĐ + thành viên | `HopDong.LayThongTinHopDong` → `DocChiTiet` + `ThanhVienHopDong` |
| 2.5–2.6 Đối soát | PDS theo MaHD | `PhieuDoiSoat.LayThongTinDoiSoat` → `GetPhieuDoiSoatTheoMaHD` |
| 2.7 UI | Tổng kết tài chính + 3 checkbox | `TerminationPanel` |
| 3.1–3.2 Công nợ | Mở khóa nếu đủ điều kiện | `PhieuDoiSoat.KiemTraCongNo` |
| 3.3–3.5 Thanh lý HĐ | `DaThanhLy` | `HopDong.ThanhLyHopDong` → `UpdateTrangThaiThanhLy` |
| 3.6–3.7 Chi tiết HĐ | `DaTra` + `NgayTra` | `ThanhVienHopDong.CapNhatTrangThaiDaTra` |
| 3.8–3.9 Giường | `Trong` | `Giuong.CapNhatDanhSachTrong` |
| 3.10 Notify (nếu hoàn) | Kế toán hoàn cọc | `DichVuThongBao.GuiThongBaoKeToan` → `/accountant/refunds` |
| A5 Còn nợ | Khóa nút + message | `KiemTraCongNo == false` → 409 / UI banner |

## Điều kiện công nợ

- `true` nếu `TienThuThem <= 0` **hoặc** `TrangThai == DaTatToan`.
- A5 **không** cập nhật PDS (đã `DaChot` khi lập phiếu).

## Side-effect pipeline: queue Đối soát (UC 1.4.18)

`HopDongDB.LayDanhSachChoDoiSoat` đã chỉnh theo pipeline UC:

- `HopDong.TrangThai = DangHieuLuc`
- EXISTS `BienBanGiaoNhan` `LoaiBienBan = ThuHoi`
- NOT EXISTS `PhieuDoiSoat` theo `MaHD`

## Ranh giới HTTP

| Method | Route | Role | Entity |
| :-- | :-- | :-- | :-- |
| GET | `/api/terminations/cho-thanh-ly?text=` | QuanLy | `LayDanhSachChoThanhLy` |
| GET | `/api/terminations/{maHD}` | QuanLy | `LayThongTinHopDong` + `LayThongTinDoiSoat` + `KiemTraCongNo` |
| POST | `/api/terminations` | QuanLy | `ThanhLyHopDong` + `CapNhatTrangThaiDaTra` + `CapNhatDanhSachTrong` + notify |

- `ArgumentException` → 400; `KeyNotFoundException` → 404; `InvalidOperationException` → 409.
- Body confirmations: `customerAgreed`, `liquidationSigned`, `keysRecovered` (cả 3 phải `true`).

## UI

- Route: `/manager/termination`.
- Split-view: list HĐ trái + form xác nhận phải.
- Service: `features/settlements/services/termination-service.ts`.
- Sau thanh lý: dialog + toast + refresh list (HĐ biến mất vì không còn `DangHieuLuc`).

## Seed / demo

- `04_DemoScenarios.sql`:
  - `HD0007` `DangHieuLuc` + `BBTH0002` ThuHoi + `PDS0003` `DaChot` (`TienHoan=3800000`, `TienThuThem=0`) → queue thanh lý happy-path.
  - `HD0004` + `BBTH0001` → queue đối soát (sau fix `LayDanhSachChoDoiSoat`).
  - `HD0005` + `PDS0001` giữ path đã thanh lý / hoàn cọc.

## Naming

- Bảng `ChiTietHopDong` map entity **`ThanhVienHopDong`** / `ThanhVienHopDongDB` (không tạo class `ChiTietHopDong` riêng).
