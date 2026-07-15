# Doi chieu literal: Lap phieu coc

## Luong he thong

- `MHLapPhieuCoc` chi hien thi lich `XemPhong + DaHoanThanh + chua co MaPhieuCoc` cua chi nhanh Sale.
- Queue doc rieng summary/detail, hien thi `NgayHen + GioHen`; response duoc kiem tra bang Zod truoc khi dua vao form.
- Sale co the cap nhat thong tin khach, chon `OGhep` hoac `NguyenCan`, tim phong va xac nhan trong dialog truoc khi tao phieu.
- Tien tren man hinh chi la tam tinh `GiaThue * 2 * so giuong`; `NguyenCan` dung `LoaiPhong.SucChua`. `PhieuCoc.TongTien` van bang `0` cho den khi Ke toan xac nhan tinh tien.

## Pham vi va rang buoc

- `MaNV` lay tu claim; `LapPhieuCoc` doc lai `NhanVien.MaCN`. Client khong gui `MaCN`.
- Query phong co dieu kien `Phong.MaCN=@MaCN`; RLS tren `Phong/Giuong` duoc giu lam lop bao ve thu hai.
- Query kha dung nhan gioi tinh khach de loai phong khong phu hop. Khi POST, server doc lai phong theo chi nhanh va goi `Phong.KiemTraGioiTinhChoPhep` truoc khi giu giuong.
- `PhongDB.CapNhat` chi chuyen giuong `Trong -> GiuCho`; request den sau khi tranh chap nhan conflict va toan bo transaction rollback.
- Ho so khac chi nhanh/khong ton tai tra `404`; input khong hop le tra `400`; sai trang thai, sai gioi tinh hoac tranh chap tra `409`.

## Contract va giao dien

- URL giu nguyen: `GET /api/appointments/*`, `GET /api/rooms/available*`, `POST /api/deposits`.
- Response phong dung `PhongDatCocHttpResponse`, chi gom thong tin can cho chon phong/giuong.
- `create-deposit-service.ts` so huu HTTP types, Zod schemas, dinh dang ngay gio va loi co HTTP status.
- Man hinh phan biet loading/empty/error, xoa selection khi dieu kien quan trong thay doi, khoa nut khi submit va reload queue khi gap `404/409`.
- Dialog xac nhan chi ghi nhan hanh dong cua Sale; khong mo hinh hoa viec lien he khach hang va khong them cot database.

## Database va thong bao

- Khong thay doi schema hoac trang thai nghiep vu.
- Tao `PhieuCoc`, giu giuong, gan `LichHen.MaPhieuCoc` va tao thong bao `PhieuCocChoTinhTien` cho Ke toan nam trong cung transaction.
- Class/sequence diagram khong hien controller, HTTP DTO, `PhienDuLieu` hay commit/rollback theo quy uoc UML cua repository.
