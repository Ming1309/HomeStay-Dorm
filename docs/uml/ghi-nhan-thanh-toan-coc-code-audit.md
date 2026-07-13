# Doi chieu literal: Ghi nhan thanh toan coc

## Mapping

- `MHGhiNhanThanhToanCoc` la route Sale cung `PendingDepositQueue` va `PaymentProofForm`; HTTP adapter vat ly la `PhieuCocController` va khong nam trong UML.
- `GhiNhanThanhToanCoc` dieu phoi `PhieuCoc` va adapter luu tep; control khong goi `PhieuCocDB`, `NhanVienDB` hay tao `PhieuThu`.
- `PhieuCoc` so huu validation trang thai, phuong thuc thanh toan va hanh vi cap nhat; moi thao tac SQL di qua `PhieuCocDB`.
- File upload duoc xu ly boi adapter filesystem. Adapter nay la ha tang web, duoc bo qua trong use-case UML nhu HTTP DTO va transaction.

## Trang thai va tinh toan dong thoi

- Chi `ChoThanhToan` duoc chuyen sang `ChoDoiChieu`.
- `PhieuCocDB.CapNhatThanhToan` dung `WHERE TrangThai=N'ChoThanhToan'`; ket qua khac mot dong duoc xem la tranh chap.
- Use case chi ghi `AnhMinhChung` va `PhuongThucThanhToan`; khong ghi de `ThoiDiemCoc`, khong doi `Phong`/`Giuong` va khong sinh `PhieuThu`.

## Chung tu

- Chap nhan JPG/JPEG, PNG va PDF toi da 5 MB; client kiem tra som, server kiem tra lai chu ky tep.
- Ten tep do server sinh. Neu DB rollback sau khi luu tep, control xoa tep vua tao de tranh tep rac.
