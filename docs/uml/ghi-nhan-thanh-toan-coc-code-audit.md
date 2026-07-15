# Doi chieu literal: Ghi nhan thanh toan coc

## Mapping

- `MHGhiNhanThanhToanCoc` la route Sale cung `PendingDepositQueue` va `PaymentProofForm`; HTTP adapter vat ly la `PhieuCocController` va khong nam trong UML.
- `GhiNhanThanhToanCoc` dieu phoi `PhieuCoc` va adapter luu tep; control khong goi `PhieuCocDB`, `NhanVienDB` hay tao `PhieuThu`.
- `PhieuCoc` so huu validation trang thai, han thanh toan, phuong thuc va hanh vi cap nhat; moi thao tac SQL di qua `PhieuCocDB`.
- File upload duoc xu ly boi adapter filesystem. Adapter nay la ha tang web, duoc bo qua trong use-case UML nhu HTTP DTO va transaction.

## Trang thai va tinh toan dong thoi

- Hang doi chi lay `ChoThanhToan` co `HanThanhToan` lon hon thoi diem server hien tai; form hien dong ho dem nguoc tu cung gia tri nay.
- Chi `ChoThanhToan` con han duoc chuyen sang `ChoDoiChieu`; het han dung tai moc deadline cung bi tu choi.
- `PhieuCocDB.CapNhatThanhToan` kiem tra lai ca trang thai va deadline; het han/tranh chap tra HTTP 409, giao dien bo selection va tai lai queue.
- Use case chi ghi `AnhMinhChung` va `PhuongThucThanhToan`; khong ghi de `ThoiDiemCoc`, khong doi `Phong`/`Giuong` va khong sinh `PhieuThu`.

## Chung tu

- Chap nhan JPG/JPEG, PNG va PDF toi da 5 MB; client kiem tra som, server kiem tra lai chu ky tep.
- Ten tep do server sinh. Neu DB rollback sau khi luu tep, control xoa tep vua tao de tranh tep rac.
