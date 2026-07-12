# Doi chieu literal: Tinh tien coc

## Mapping

- `TinhTienCoc` chi dieu phoi `PhieuCoc`; control khong goi truc tiep `PhieuCocDB`.
- `PhieuCoc` doc du lieu va goi `PhieuCocDB` de cap nhat tien, so giuong, han thanh toan va trang thai.
- `PhieuCoc` su dung `Phong.LoaiPhong.GiaThue` va `LoaiPhong.SucChua`; khong nhan gia tien tu HTTP.
- `PhieuCocDB.CapNhatTinhTien` co dieu kien `TrangThai=N'KhoiTao'` de tranh xac nhan hai lan.

## Cong thuc va trang thai

- `OGhep`: gia thue x 2 x so dong `ChiTietPhieuCoc`.
- `NguyenCan`: gia thue x 2 x `LoaiPhong.SucChua`.
- Xac nhan thanh cong chuyen `KhoiTao` sang `ChoThanhToan` va dat han thanh toan sau 24 gio.
