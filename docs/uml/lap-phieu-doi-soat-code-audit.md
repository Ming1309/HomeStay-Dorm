# Doi chieu literal: Lap phieu doi soat

## Mapping da dat duoc

- `LapPhieuDoiSoat` chi dieu phoi `PhieuCoc`, `HopDong`, `ChinhSachHoanCoc`, `HoaDon`, `PhieuDoiSoat`; khong goi `*DB` truc tiep.
- Moi class nghiep vu co mot class DB tuong ung va tu goi method DB cua minh.
- `PhienDuLieu` giu session/transaction theo request bang `AsyncLocal`, nen sequence khong phai mang tham so connection hay transaction.
- `MHLapPhieuDoiSoat` di qua `PhieuDoiSoatController` trong code web; controller la adapter vat ly bat buoc cua browser.

## Rang buoc database giu nguyen

- `PhieuDoiSoat`, `ChiTietDoiSoat`, `ChinhSachHoanCoc`, `HopDong`, `HoaDon`, `PhieuCoc` giu nguyen schema, PK, FK va gia tri trang thai.
- `PhieuDoiSoat` theo doi ti le hoan, tong khau tru, tien hoan, tien thu them.
- `ChinhSachHoanCoc` lay ti le phu hop dua tren tung loai ho so (Phieu coc huy truoc hop dong: `TiLe_ChuaKy`; Hop dong thanh ly: xac dinh qua thoi gian luu tru so voi `MocLuuTru` de ra truoc han ngan han, truoc han dai han hoac dung han).

## Gioi han

- `maNVDangNhap` duoc gia lap/truyen tu phien dang nhap HTTP hien tai.
- Unit test xac minh logic nghiep vu tinh toan, khong yeu cau ket noi database.
