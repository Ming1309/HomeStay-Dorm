# Doi chieu literal: Xac nhan khoan tien coc

## Mapping

- `MHXacNhanKhoanTienCoc` la route Quan ly cung `ReconciliationQueue` va `ReconciliationPanel`; HTTP adapter khong nam trong UML.
- `XacNhanKhoanTienCoc` dieu phoi cac entity trong mot giao dich du lieu; control khong goi truc tiep lop `*DB`.
- `PhieuCoc`, `PhieuThu` va `Phong` so huu quy tac nghiep vu; moi entity tu truy cap lop DB cung ten theo quy uoc du an.
- Session, transaction, HTTP DTO, claim dang nhap va file-storage adapter la chi tiet ky thuat nen duoc bo qua trong UML use case.

## Xac nhan hop le va dong thoi

- Chi phieu `ChoDoiChieu` co so tien, phuong thuc, chung tu va day du chi tiet giuong moi duoc xac nhan.
- `PhieuCocDB.CapNhatXacNhanThanhToan` dung dieu kien `TrangThai=N'ChoDoiChieu'`; ket qua khac mot dong la tranh chap.
- Cung mot giao dich se chuyen phiếu sang `DaThanhToan`, tao duy nhat mot `PhieuThu`, chuyen tung giuong `GiuCho` sang `DaCoc` va tinh lai trang thai phong.
- Unique index loc tren `PhieuThu.MaPhieuCoc` ngan sinh hai phieu thu cho cung mot phieu coc.
- `PhieuThu.MaNV` lay tu ma Quan ly dang nhap; so tien, phuong thuc va chung tu duoc sao chep tu phieu coc.

## Yeu cau bo sung

- Ly do bat buoc tu 1 den 500 ky tu. Phieu quay ve `ChoThanhToan` de xuat hien lai o man hinh Sales.
- Moi lan Quan ly yeu cau bo sung, `HanThanhToan` duoc dat lai thanh mot ky han day du 24 gio theo cau hinh; thoi gian da cho Quan ly doi chieu khong bi tru vao ky han moi.
- Chung tu va phuong thuc cu duoc giu de Sales tham chieu; ly do hien truc tiep tren form ghi nhan thanh toan.
- Khi Sales gui chung tu moi thanh cong, ly do duoc xoa va tep cu duoc xoa sau khi DB commit.
- Chua tao bang `ThongBao`; thong bao day den Sales duoc de lai cho use case thong bao rieng.
