# Code audit — Tạo lịch hẹn

- UI tải chi nhánh, chứng từ và lịch hẹn từ API thật; response sai contract bị chặn bằng Zod.
- `LichHenController` chỉ cho role `Sale`; `MaNV` được lấy từ JWT claim cho cả tạo và sửa.
- Use case kiểm tra thời gian phải lớn hơn hiện tại, chứng từ còn đúng trạng thái và nhân viên không trùng lịch.
- Ghi lịch hẹn nằm trong transaction có commit/rollback đầy đủ.
- Hệ thống không gửi Email/SMS khi tạo lịch; UI không được thông báo rằng việc gửi đã xảy ra.
