# Code Audit Sheet - Lập phiếu hoàn cọc

| Thành phần UML | Mã nguồn thực tế | Ghi chú |
| :--- | :--- | :--- |
| `MHHoanCoc` | `accountant.refunds.tsx` | Dùng `react-hook-form + zod`, giới hạn thông tin chuyển khoản, chống double-submit; request không chứa số tiền hay ghi chú không được lưu. |
| `PhieuHoanCocController` | `PhieuHoanCocController.cs` | Role `KeToan`, lấy `MaNV` từ claim, ánh xạ lỗi 400/404/409/500. |
| `LapPhieuHoanCoc.LayDSPhieuDoiSoatCanHoan()` | `LapPhieuHoanCoc.cs` | Chỉ trả PĐS `DaChot`, `TienHoan > 0` và chưa có PHC. |
| `LapPhieuHoanCoc.LayChiTietPhieuDoiSoatDto()` | `LapPhieuHoanCoc.cs` | Phiếu cọc hủy hiển thị tỷ lệ đã chốt trong PĐS và không gắn mã chính sách hiện tại. |
| `LapPhieuHoanCoc.ThucHienHoanCoc()` | `LapPhieuHoanCoc.cs` | Khóa/đọc lại PĐS, dùng `PDS.TienHoan` phía máy chủ; bắt buộc chứng từ, chuyển khoản có mã giao dịch; insert PHC và chuyển `DaChot -> DaTatToan` trong cùng transaction. |
| `PhieuHoanCoc.DaTonTaiChoPhieuDoiSoat()` | `PhieuHoanCoc.cs` | Chặn tạo phiếu hoàn trùng. |
| `PhieuDoiSoat.LayChiTietChoCapNhat()` | `PhieuDoiSoat.cs` | DB đọc PĐS bằng `UPDLOCK, HOLDLOCK` trong transaction hoàn cọc. |
| `PhieuDoiSoat.ChuyenSangDaTatToan()` | `PhieuDoiSoat.cs` | Chỉ chấp nhận chuyển `DaChot -> DaTatToan`; cập nhật tranh chấp trả HTTP 409. |
| `PhieuHoanCocDB.TonTaiTheoMaPhieuDoiSoat()` | `PhieuHoanCocDB.cs` | Schema init có unique index theo `MaPDS`. |

PHC là chứng từ xác nhận tiền đã được giao/chuyển, không phải lệnh hoàn. Demo đặt PĐS đã có PHC ở `DaTatToan`; script validation phát hiện PHC thiếu chứng từ và PĐS `DaChot` đã có PHC.
