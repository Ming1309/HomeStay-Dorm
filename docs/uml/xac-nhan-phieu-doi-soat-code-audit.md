# Code Audit Sheet - Xác nhận phiếu đối soát

| Hành vi | Code | Ràng buộc |
|---|---|---|
| Tải hàng đợi | `XacNhanPhieuDoiSoat.LayDanhSachChoXacNhan()` | Chỉ lấy PĐS `ChoXacNhan`. |
| Xác nhận | `PhieuDoiSoat.XacNhanKhachHangDongY()` | Bắt buộc khách đồng ý và claim Quản lý; lưu người/thời điểm/ghi chú xác nhận. |
| Chuyển trạng thái | `PhieuDoiSoatDB.XacNhan()` | `ChoXacNhan -> DaChot`; hòa vốn chuyển thẳng `DaTatToan`; optimistic update trả 409 khi tranh chấp. |
| Phân luồng | `XacNhanPhieuDoiSoat.XacNhan()` | Thông báo Kế toán thu thêm hoặc hoàn trước hợp đồng sau khi xác nhận. |

Schema lưu `KhachHangDongY`, `MaNVChot`, `ThoiDiemChot`, `GhiChuXacNhan`; CHECK ngăn trạng thái đã chốt thiếu audit.
