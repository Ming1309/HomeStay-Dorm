# Đối chiếu code: Lập biên bản thu hồi tài sản

## Luồng kiến trúc

- `MHLapBienBanThuHoi` (`ManagerAssetRecoveryPage`) chỉ gọi API của `LapBienBanThuHoiTaiSan` / upload minh chứng; màn hình không tự ghi DB.
- `LapBienBanThuHoiTaiSan` điều phối `HopDong`, `BienBanGiaoNhan`, `ChiTietGiaoNhan`, `PhongTaiSan`, `DichVuThongBao`.
- Control **không** import `*DB`; mỗi entity tự gọi DB class (`BienBanGiaoNhanDB`, `ChiTietGiaoNhanDB`, `HopDongDB`, `PhongTaiSanDB`, `ThongBaoDB`).
- `PhienDuLieu` bao trọn transaction khi lưu biên bản (insert biên bản + chi tiết + thông báo).

## Dòng sự kiện UC 1.4.17

| Bước | Hành vi | Code |
| :-- | :-- | :-- |
| 1.0 Truy cập chức năng | Load HĐ có lịch trả phòng trong ngày | `LayDanhSachHopDongTraPhongHomNay` → `HopDong.LayDanhSachCoLichTraTrongNgay` → `HopDongDB.LayDanhSachCoLichTraTrongNgay` |
| 2.0 Chọn HĐ | Chi tiết + danh sách tài sản phòng | `LayChiTietHopDongThuHoi` → `HopDong.DocChiTiet` + `KiemTraDangHieuLuc` + `CoLichTraPhongTrongNgay` + `PhongTaiSan.LayTaiSanTheoPhong` |
| 3.0 Nhập SL / tình trạng / minh chứng | Validate client (Zod) + upload ảnh | Frontend form + `POST /api/asset-recovery/proofs` → `MinhChungThuHoiFileStorage` |
| 3.1 Lưu biên bản | Validate server + insert `ThuHoi` | `LapBienBan` → `BienBanGiaoNhan.KhoiTaoThuHoi` + `KiemTraDuLieuTaiSan` + `LuuBienBan` + `ChiTietGiaoNhan.ThemNhieu` |
| 3.8 Thông báo Kế toán | Ghi `ThongBao` vai trò `KeToan` | `DichVuThongBao.GuiThongBaoKeToan` (cùng transaction) |
| 3.9 Thành công | Toast UI | `toast.success("...Đã gửi thông báo cho Kế toán.")` |
| A4 Thiếu tình trạng | Báo lỗi, không lưu | `ChiTietGiaoNhan.KiemTraHopLe` / Zod `condition.min(1)` |

## Trạng thái và dữ liệu

- Điều kiện đầu vào: `HopDong.TrangThai = DangHieuLuc` + `LichHen.LoaiLichHen = TraPhong` trong ngày + chưa có `BienBanGiaoNhan` loại `ThuHoi`.
- `BienBanGiaoNhan.LoaiBienBan = ThuHoi`; **không** cập nhật trạng thái HĐ / giường (thuộc UC 1.4.18 / 1.4.23).
- `ChiTietGiaoNhan.TinhTrang` ∈ {`Bình thường`, `Hư hỏng`, `Mất mát`}; `SoLuong >= 0` và `<= SoLuongTieuChuan` của `Phong_TaiSan`.
- `MinhChung` lưu path `/api/asset-recovery/proofs/{file}` (file vật lý `App_Data/MinhChungThuHoi`).

## Thông báo nội bộ

- Schema: `ThongBao` (theo `VaiTroNhan`) + `ThongBao_NguoiDoc` (đã đọc theo `MaNV`).
- UC 1.4.17 gửi `VaiTroNhan = KeToan`, `LienKet = /accountant/doi-soat`, `Tone = orange`.
- Header Bell (`AppShell`) load `GET /api/notifications`; mark-read / mark-all-read qua API.
- Toast vẫn hiển thị sau khi lưu (feedback tức thì cho Quản lý).

## Ranh giới HTTP

| Method | Route | Role | Control |
| :-- | :-- | :-- | :-- |
| GET | `/api/asset-recovery/contracts` | QuanLy | `LayDanhSachHopDongTraPhongHomNay` |
| GET | `/api/asset-recovery/contracts/{id}` | QuanLy | `LayChiTietHopDongThuHoi` |
| POST | `/api/asset-recovery/contracts/{id}` | QuanLy | `LapBienBan` |
| POST | `/api/asset-recovery/proofs` | QuanLy | storage upload |
| GET | `/api/asset-recovery/proofs/{tenTep}` | QuanLy,KeToan | storage download |
| GET | `/api/notifications` | Sale,QuanLy,KeToan,QuanTri | `DichVuThongBao.LayThongBaoCuaToi` |
| POST | `/api/notifications/{id}/read` | … | `DanhDauDaDoc` |
| POST | `/api/notifications/read-all` | … | `DanhDauTatCaDaDoc` |

- Controller chỉ map DTO / auth claim `MaNV`; không quyết định trạng thái nghiệp vụ.
- `KeyNotFoundException` → 404; `ArgumentException` → 400; `InvalidOperationException` → 409.

## UI

- Route: `/manager/thu-hoi-tai-san` → `ManagerAssetRecoveryPage`.
- Split-view: list HĐ trái + form tài sản phải (số lượng thu hồi, tình trạng, minh chứng, ghi chú).
- Sau lưu thành công: remove HĐ khỏi list + toast; Kế toán thấy thông báo ở chuông header.

## Seed / reset

- `01_InitTables.sql` tạo schema `ThongBao` (+ `SET QUOTED_IDENTIFIER ON` cho computed column).
- `04_DemoScenarios.sql`: `LH0010` lịch trả phòng **trong ngày** cho `HD0004`; `Phong_TaiSan` của `P007`.
- Reset: chạy 01 → 05 theo `SEED_SCENARIOS.md` (dùng `-I` với sqlcmd).
