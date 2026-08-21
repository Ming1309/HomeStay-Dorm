# HomeStay Dorm

HomeStay Dorm là hệ thống quản lý quy trình cho thuê phòng và giường tại ký túc xá/homestay, từ lúc tiếp nhận nhu cầu của khách hàng, đặt cọc, lập hợp đồng, nhận phòng cho đến đối soát, hoàn cọc và thanh lý hợp đồng.

**Demo**: https://youtu.be/f0olSgZnqXg

## Chức năng chính

Hệ thống phân quyền theo bốn vai trò. Nhân viên nghiệp vụ chỉ xem và xử lý hồ sơ thuộc chi nhánh đang được phân công.

### Nhân viên Sale

- Lập và tra cứu phiếu đăng ký.
- Tạo, cập nhật và tra cứu lịch hẹn.
- Tra cứu phòng, giường và tình trạng chỗ trống.
- Lập phiếu cọc từ lịch xem phòng đã hoàn thành.
- Ghi nhận minh chứng thanh toán cọc và hủy phiếu cọc.
- Lập hồ sơ lưu trú và bổ sung người ở cùng.
- Lập hợp đồng thuê.
- Tra cứu phiếu cọc và hợp đồng.

### Quản lý

- Xét duyệt hồ sơ nhận phòng và thành viên lưu trú.
- Xác nhận khoản tiền cọc.
- Xác nhận kết quả đối soát.
- Lập biên bản bàn giao phòng và tài sản.
- Lập biên bản thu hồi tài sản khi trả phòng.
- Thanh lý hợp đồng sau khi khách đã hoàn tất nghĩa vụ tài chính.
- Tra cứu phòng, phiếu cọc và hợp đồng.

### Kế toán

- Tính và xác nhận số tiền cọc phải thu.
- Thu tiền kỳ đầu của hợp đồng.
- Lập phiếu đối soát khi hủy cọc hoặc trả phòng.
- Ghi nhận khoản thu thêm khi đối soát phát sinh công nợ.
- Lập hóa đơn bồi thường tài sản.
- Lập phiếu hoàn cọc và lưu minh chứng hoàn tiền.
- Tra cứu phòng, phiếu cọc và hợp đồng.

### Quản trị viên

- Quản lý phòng và giường.
- Quản lý dịch vụ và tài sản.
- Quản lý văn bản quy định.
- Quản lý tài khoản, vai trò và chi nhánh của nhân viên.
- Quản lý các phiên bản chính sách hoàn cọc.

### Chức năng dùng chung

- Đăng nhập bằng cookie, kiểm soát quyền theo vai trò.
- Cô lập dữ liệu nghiệp vụ theo chi nhánh.
- Thông báo tác vụ và trạng thái xử lý cho nhân viên liên quan.
- Lưu và kiểm soát quyền truy cập minh chứng cọc, chứng từ tài chính, biên bản và văn bản quy định.
- Tự động hủy phiếu cọc quá hạn thanh toán. Mặc định thời hạn là 24 giờ.
- Chống xử lý trùng đối với các chứng từ và thao tác tài chính quan trọng.
- Dashboard tổng quan theo vai trò, lấy snapshot API thật theo chi nhánh (Sale/Quản lý/Kế toán) hoặc toàn hệ thống (Admin).

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | C#, ASP.NET Core Web API, .NET 10 |
| Truy cập dữ liệu | Dapper, Microsoft.Data.SqlClient, SQL thuần |
| Cơ sở dữ liệu | Microsoft SQL Server |
| Frontend | TypeScript, React 19, TanStack Router/Start, Vite 7 |
| Giao diện | Tailwind CSS 4, Radix UI, Lucide React |
| Form và validation | React Hook Form, Zod |
| Kiểm thử backend | xUnit |
 |

Các ngôn ngữ lập trình và định dạng chính trong repository gồm **C#**, **TypeScript**, **SQL**, **HTML/CSS** và **PlantUML**. Toàn bộ nhãn giao diện, thông báo lỗi và thuật ngữ nghiệp vụ hướng tới người dùng đều sử dụng tiếng Việt.

## Kiến trúc và cấu trúc thư mục

Backend tổ chức theo ba tầng logic:

```text
Giao diện/API → Nghiệp vụ → Truy cập dữ liệu → SQL Server
```

```text
HomeStay-Dorm/
├── src/
│   ├── HomeStay.Presentation/
│   │   ├── Controllers/          # API và phân quyền HTTP
│   │   ├── Contracts/            # Request/response của API
│   │   ├── HostedServices/       # Worker chạy nền
│   │   ├── App_Data/             # File upload khi chạy local
│   │   ├── SeedData/             # Văn bản mẫu đi kèm ứng dụng
│   │   └── ClientApp/            # Frontend React/TypeScript
│   └── HomeStay.Application/
│       ├── BusinessLogic/        # Use case và business entity
│       └── DataAccess/
│           ├── DBs/              # Dapper/SQL
│           ├── FileStorage/      # Lưu và đọc file nghiệp vụ
│           └── SqlScripts/       # Schema và dữ liệu demo
└── HomeStay.sln
```

## Yêu cầu môi trường

- [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) phiên bản LTS và npm
- Microsoft SQL Server
- `sqlcmd`, Azure Data Studio hoặc SQL Server Management Studio để chạy script database
- Docker là tùy chọn nếu không cài SQL Server trực tiếp

Kiểm tra phiên bản đã cài:

```bash
dotnet --version
node --version
npm --version
```

## Khởi tạo cơ sở dữ liệu

Các script nằm tại:

```text
src/HomeStay.Application/DataAccess/SqlScripts/
```

Chạy đúng thứ tự:

1. `01_InitTables.sql` — tạo lại database và toàn bộ schema.
2. `02_Seeds.sql` — tạo dữ liệu danh mục.
3. `03_Auth.sql` — tạo tài khoản đăng nhập demo.
4. `04_DemoScenarios.sql` — tạo các kịch bản nghiệp vụ.
5. `05_ValidateDemoData.sql` — kiểm tra tính nhất quán của dữ liệu demo.

> **Cảnh báo:** `01_InitTables.sql` thực hiện `DROP DATABASE HomeStay` trước khi tạo lại database. Không chạy file này trên database có dữ liệu cần giữ.

## Cấu hình backend

Backend đọc connection string có tên `DefaultConnection`. Ví dụ connection string là:

```text
Server=localhost,1433;Database=HomeStay;User Id=sa;Password=MyStrongPass123;TrustServerCertificate=True;
```

Có thể cấu hình bằng cách sau.

### File cấu hình Development

Cập nhật `ConnectionStrings.DefaultConnection` trong:

```text
src/HomeStay.Presentation/appsettings.Development.json
```

## Cài đặt dependency

Từ thư mục gốc repository:

```bash
dotnet restore HomeStay.sln
npm --prefix src/HomeStay.Presentation/ClientApp ci
```

## Chạy dự án ở môi trường phát triển

Cần chạy backend và frontend ở hai terminal riêng.

### Terminal 1 — Backend

```bash
dotnet run --project src/HomeStay.Presentation/HomeStay.Presentation.csproj --launch-profile http
```

Backend chạy tại:

- API: `http://localhost:5050`

### Terminal 2 — Frontend

```bash
npm run dev
```

Frontend chạy mặc định tại:

```text
http://localhost:5173
```

Vite tự chuyển tiếp các request `/api` đến backend tại `http://localhost:5050`.

## Tài khoản demo

| Vai trò | Chi nhánh | Tên đăng nhập | Mật khẩu |
|---|---|---|---|
| Quản trị | Toàn hệ thống | `admin` | `admin123` |
| Sale | CN01 | `sale` | `sale123` |
| Quản lý | CN01 | `quanly` | `quanly123` |
| Kế toán | CN01 | `ketoan` | `ketoan123` |
| Sale | CN02 | `sale.cn02` | `sale123` |
| Quản lý | CN02 | `quanly.cn02` | `quanly123` |
| Kế toán | CN02 | `ketoan.cn02` | `ketoan123` |

## Build dự án

### Build backend

```bash
dotnet build HomeStay.sln --configuration Release
```

### Kiểm tra và build frontend

```bash
npm run lint
npm run typecheck
npm run build
```
## Cấu hình tự động hủy phiếu cọc

Cấu hình nằm trong section `DepositExpiry` của `appsettings.json`:

```json
{
  "DepositExpiry": {
    "PaymentDeadlineMinutes": 1440,
    "ScanIntervalSeconds": 60,
    "BatchSize": 50
  }
}
```

- `PaymentDeadlineMinutes`: thời hạn thanh toán phiếu cọc, mặc định 1.440 phút (24 giờ).
- `ScanIntervalSeconds`: chu kỳ worker kiểm tra phiếu quá hạn.
- `BatchSize`: số phiếu tối đa xử lý trong một lượt.

## Lưu trữ file khi chạy local

File được lưu ngoài database trong thư mục:

```text
src/HomeStay.Presentation/App_Data/
├── ChungTuCoc/
├── ChungTuTaiChinh/
├── MinhChungThuHoi/
└── QuyDinh/
```

Database chỉ lưu đường dẫn API đến file. Tên file upload được đổi thành tên ngẫu nhiên để tránh trùng. Thư mục `App_Data` đã nằm trong `.gitignore`, vì vậy cần sao lưu riêng khi di chuyển hoặc triển khai hệ thống.

Các văn bản mẫu đi kèm seed nằm trong:

```text
src/HomeStay.Presentation/SeedData/
```

## Lưu ý triển khai

- Thay toàn bộ tài khoản, mật khẩu và connection string demo trước khi triển khai thật.
