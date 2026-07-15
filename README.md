# HomeStay Dorm

Hệ thống quản lý Ký Túc Xá / HomeStay.

## Kiến trúc dự án
Dự án được xây dựng theo kiến trúc **3-Layer Architecture** (Backend .NET) kết hợp với Frontend React (Vite).

### Cấu trúc thư mục
- `src/HomeStay.Presentation`: Lớp giao diện và API (ASP.NET Core Web API). Chứa cấu hình routing, middleware và controller.
  - `ClientApp/`: Mã nguồn Frontend (ReactJS, Vite, Tailwind CSS, TanStack Router).
- `src/HomeStay.BusinessLogic`: Lớp xử lý nghiệp vụ chính của hệ thống (Services, Models, Validators).
- `src/HomeStay.DataAccess`: Lớp truy cập dữ liệu (sử dụng SQL thuần / ADO.NET / Dapper thay vì Entity Framework).
- `tests/`: Chứa các dự án kiểm thử tự động (Unit Tests & Integration Tests).

## Cơ sở dữ liệu (Database)
Dự án sử dụng **SQL Server**.
Toàn bộ các file script để khởi tạo bảng (Schema), dữ liệu mẫu (Seed) được lưu trữ tại:
`src/HomeStay.DataAccess/SqlScripts/`

## Hướng dẫn cài đặt & Chạy dự án

### Yêu cầu môi trường
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) hoặc [Bun](https://bun.sh/) cho Frontend
- Microsoft SQL Server

### 1. Khởi chạy Frontend (React / Vite)
Di chuyển vào thư mục ClientApp và khởi chạy server dev:
```bash
cd src/HomeStay.Presentation/ClientApp
npm install
npm run dev
```

### 2. Khởi chạy Backend (.NET Web API)
Thực thi dự án Presentation từ thư mục gốc hoặc qua Visual Studio/Rider:
```bash
dotnet run --project src/HomeStay.Presentation/HomeStay.Presentation.csproj
```

## Cấu hình database
Để cấu hình kết nối đến SQL Server, hãy chỉnh sửa file appsettings.json (hoặc appsettings.Development.json) tại thư mục src/HomeStay.Presentation.

Thay thế ConnectionString bằng chuỗi kết nối của bạn:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server-name;Database=your-database-name;User Id=your-user-id;Password=your-password;"
  }
}
```
