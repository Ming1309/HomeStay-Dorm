# Đối chiếu code: Lập hóa đơn bồi thường (UC 1.4.20)

## Luồng kiến trúc

- `MHLapHoaDonBoiThuong` (`/accountant/compensation` + `CompensationPanel`) chỉ gọi API; màn hình không tự ghi DB.
- Sơ đồ class/sequence **không** có control class — MH gọi thẳng entity. Trong web stack, `HoaDonBoiThuongController` là **HTTP adapter** của MH (map DTO, auth claim `MaNV`, mở `PhienDuLieu` + transaction khi ghi).
- Controller **không** import `*DB`; mỗi entity tự gọi DB class.
- `PhienDuLieu` bao trọn transaction khi lập HĐ (insert `HoaDon` + các dòng `ChiTietHoaDon`).

## Dòng sự kiện UC 1.4.20

| Bước | Hành vi | Code |
| :-- | :-- | :-- |
| 1.0–1.2 Load BB chưa xử lý | List `ThuHoi` có hư hỏng/mất + chưa có HĐ `BoiThuong` | `BienBanGiaoNhan.LayDSBienBanThuHoiChuaXuLy` → `BienBanGiaoNhanDB.GetDSBienBanThuHoiChuaXuLy` |
| 2.0–2.2 Chọn BB | Chi tiết biên bản | `BienBanGiaoNhan.LayChiTietBienBan` → `GetBienBanTheoMaBienBan` |
| 2.3–2.4 DS tài sản hư | Dòng `Hư hỏng` / `Mất mát` | `ChiTietGiaoNhan.LayDSTaiSanHuHongTheoBienBan` → `GetDSTaiSanHuHongTheoBienBan` |
| 2.5–2.6 Thông tin TS | Giá trị gợi ý | `TaiSan.LayThongTinTaiSan` → `TaiSanDB.GetTaiSanTheoMaTS` |
| 3.0 Nhập số tiền | Form Zod client | `CompensationPanel` |
| 4.0–4.1 Validate | A6 số tiền | `HoaDon.KiemTraTinhHopLe(dsSoTien)` |
| 4.2–4.3 NV | Claim `MaNV` | `NhanVien.LayThongTinNhanVien` → `GetNhanVienTheoMaNV` |
| 4.4–4.5 Tạo HĐ | `LoaiHoaDon=BoiThuong`, `ChuaThanhToan` | `HoaDon.TaoHoaDonBoiThuong` → `HoaDonDB.InsertHoaDon` |
| 4.6–4.7 Chi tiết | `LoaiKhoanThu=BoiThuong`, `MaTS` | `ChiTietHoaDon.TaoChiTietHoaDon` → `InsertChiTietHoaDon` |
| 4.8 Dialog | Thành công | UI dialog + toast |
| A6 Số tiền lỗi | 400 + bôi đỏ field | Message `"Vui lòng nhập số tiền phạt hợp lệ"` |

## Quy tắc “chưa xử lý”

- Không có cột status / FK `HoaDon.MaBienBan`.
- Suy diễn: `LoaiBienBan=ThuHoi` + EXISTS chi tiết `Hư hỏng|Mất mát` + NOT EXISTS `HoaDon` cùng `MaHD` với `LoaiHoaDon=BoiThuong`.
- Mỗi HĐ tối đa 1 biên bản `ThuHoi` (enforce ở UC 1.4.17) nên suy diễn theo `MaHD` đủ dùng.
- `GhiChu` hóa đơn ghi `MaBienBan=...` để truy vết.

## Ranh giới HTTP

| Method | Route | Role | Entity |
| :-- | :-- | :-- | :-- |
| GET | `/api/compensation/bien-ban-chua-xu-ly` | KeToan | `LayDSBienBanThuHoiChuaXuLy` |
| GET | `/api/compensation/bien-ban/{maBienBan}` | KeToan | `LayChiTietBienBan` + `LayDSTaiSanHuHongTheoBienBan` + `LayThongTinTaiSan` |
| POST | `/api/compensation/hoa-don` | KeToan | `KiemTraTinhHopLe` → `LayThongTinNhanVien` → `TaoHoaDonBoiThuong` → `TaoChiTietHoaDon` |
| GET | `/api/asset-recovery/proofs/{tenTep}` | QuanLy,KeToan | (đã có) xem minh chứng |

- `ArgumentException` → 400; `KeyNotFoundException` → 404; `InvalidOperationException` → 409.

## UI

- Route: `/accountant/compensation`.
- Split-view: list biên bản trái + form số tiền phải.
- Service: `features/settlements/services/compensation-invoice-service.ts`.
- Sau lập thành công: dialog + refresh list (biên bản biến mất vì đã có `BoiThuong`).

## Seed / demo

- `04_DemoScenarios.sql`: `BBTH0001` `ThuHoi` cho `HD0004`, chi tiết `TS01` Hư hỏng + `TS03` Mất mát; **không** có `HoaDon BoiThuong` cho `HD0004`.
- `BBGN0003`/`HDON0004` (HD0005) giữ nguyên cho demo đối soát đã xử lý.
