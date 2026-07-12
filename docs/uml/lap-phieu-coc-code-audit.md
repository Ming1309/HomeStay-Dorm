# Doi chieu literal: Lap phieu coc

## Mapping da dat duoc

- `LapPhieuCoc` chi dieu phoi `LichHen`, `KhachHang`, `Phong`, `PhieuCoc`; khong goi `*DB` truc tiep.
- Moi class nghiep vu co mot class DB tuong ung va tu goi method DB cua minh.
- `PhienDuLieu` giu session/transaction theo request bang `AsyncLocal`, nen sequence khong phai mang tham so connection hay transaction.
- `MHLapPhieuCoc` di qua `PhieuCocController` trong code web; controller la adapter vat ly bat buoc cua browser.

## Rang buoc database giu nguyen

- `PhieuCoc`, `ChiTietPhieuCoc`, `ThanhVienDangKy`, `LichHen`, `Phong`, `Giuong` giu nguyen schema, PK, FK va gia tri trang thai.
- `Phong` theo doi `GiuongsVuaGiu`; `PhongDB.CapNhat` chi ghi cac giuong nay de khong cap nhat lai giuong da `GiuCho`.
- Filter loai phong chap nhan ma loai, ten loai hoac suc chua; UI gui suc chua `4`/`6` va ten toa dung voi seed.

## Gioi han

- Authentication chua nam trong scope, nen `MaNV` van theo HTTP contract hien tai.
- Integration test can SQL Server khoi dong tu schema va seed; unit test chi xac minh nghiep vu khong can database.
