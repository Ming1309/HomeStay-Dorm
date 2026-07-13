# Code Audit Sheet - Lập phiếu hoàn cọc

| Thành phần UML | Mã nguồn thực tế | Ghi chú |
| :--- | :--- | :--- |
| `MHHoanCoc` | `accountant.refunds.tsx` | Request không chứa số tiền; hiển thị người dùng đăng nhập. |
| `PhieuHoanCocController` | `PhieuHoanCocController.cs` | Role `KeToan`, lấy `MaNV` từ claim, ánh xạ lỗi 400/404/409/500. |
| `LapPhieuHoanCoc.ThucHienHoanCoc()` | `LapPhieuHoanCoc.cs` | Dùng `TienHoan` phía máy chủ và thực hiện trong một transaction. |
| `PhieuHoanCoc.DaTonTaiChoPhieuDoiSoat()` | `PhieuHoanCoc.cs` | Chặn tạo phiếu hoàn trùng. |
| `PhieuDoiSoat.ChuyenSangDaTatToan()` | `PhieuDoiSoat.cs` | Chỉ chấp nhận chuyển `DaChot -> DaTatToan`. |
| `PhieuHoanCocDB.TonTaiTheoMaPhieuDoiSoat()` | `PhieuHoanCocDB.cs` | Schema init có unique index theo `MaPDS`. |
