# Doi chieu literal: Quan ly phong / giuong

## Mapping ba tang

- `AdminRoomsBedsPage` tai danh sach phong, giuong, loai phong va chi nhanh qua `rooms-beds-service`; du lieu mock va mutation cuc bo da duoc loai bo.
- `QuanLyPhongGiuongController` la adapter HTTP co `[Authorize(Roles = "QuanTri")]`; request/response nam trong `QuanLyPhongGiuongHttpContracts`.
- `QuanLyPhongGiuong` giu bien giao dich va chi dieu phoi `Phong`, `Giuong`, `LoaiPhong`, `ChiNhanh`; control khong goi class `*DB` truc tiep.
- Moi entity goi DB class cua chinh no. Tat ca cau SQL moi deu dung tham so Dapper va transaction hien tai cua `PhienDuLieu`.

## Luong thao tac

| Thao tac | Control | Entity | DB |
| --- | --- | --- | --- |
| Tai phong | `LayDanhSachPhong` | `Phong.LayDanhSachQuanTri` | `PhongDB.LayDanhSachQuanTri` |
| Them/sua/xoa phong | `ThemPhong` / `CapNhatPhong` / `XoaPhong` | `Phong` validation va persistence | `PhongDB.Them` / `CapNhatThongTin` / `Xoa` |
| Tai giuong | `LayDanhSachGiuong` | `Giuong.LayDanhSachQuanTri` | `GiuongDB.LayDanhSachQuanTri` |
| Them/sua/xoa giuong | `ThemGiuong` / `CapNhatGiuong` / `XoaGiuong` | `Giuong` validation va persistence | `GiuongDB.Them` / `CapNhatThongTin` / `Xoa` |
| Tai loai phong | `LayDanhSachLoaiPhong` | `LoaiPhong.LayDanhSach` | `LoaiPhongDB.LayDanhSach` |
| Tai chi nhanh | `LayDanhSachChiNhanh` | `ChiNhanh.LayDanhSach` | `ChiNhanhDB.LayDanhSach` |

## Rang buoc nghiep vu va database

- Phong bat buoc co `SoPhong`, `MaLP`, `MaCN`; giuong bat buoc co `SoGiuong`, `MaPhong`. Chuoi duoc trim va kiem tra do dai theo `01_InitTables.sql`.
- Trang thai duoc kiem tra theo whitelist giong cac `CHECK` constraint hien co.
- `UQ_Phong_SoPhong (MaCN, SoPhong)` va `UQ_Giuong_SoGiuong (MaPhong, SoGiuong)` da ton tai trong fresh init; khong can migration hay sua schema.
- Loai phong va chi nhanh phai ton tai. Them/chuyen giuong phai con suc chua; doi loai phong khong duoc lam suc chua nho hon so giuong hien co.
- Giuong dang su dung hoac da duoc tham chieu khong duoc doi so giuong hay chuyen phong.
- Xoa bi chan khi phong/giuong dang giu cho, da coc, dang su dung, co coc/hop dong hieu luc, hoa don, doi soat hoac tham chieu lien quan. FK database la lop bao ve cuoi cung khi co race condition.
- Loi input tra `400`, khong tim thay tra `404`, xung dot trang thai/rang buoc tra `409`; loi SQL khong mong doi duoc log va tra thong diep `500` chung.

## Giao dien

- Form dung `react-hook-form` va `zod`, co gioi han do dai phu hop backend.
- Khi them phong, trang thai duoc co dinh la `Trong` tai control va khong hien truong chon tren form; chi form chinh sua moi cho doi trang thai.
- Khi them giuong, trang thai cung duoc co dinh la `Trong`; API tao va form tao khong nhan trang thai.
- Ma phong/giuong moi dung dang tuan tu `P012`, `G043` theo du lieu hien co. Truy van sinh ma dung `UPDLOCK, HOLDLOCK` trong transaction va bo qua cac ma timestamp cu; khong can thay doi schema.
- Trang thai workflow (`GiuCho`, `DaCoc`, `DangSuDung`, `ConGiuongTrong`) duoc hien thi va giu nguyen khi sua; giao dien khong cho admin tu chon cac trang thai nay.
- Toast thanh cong chi hien thi sau khi request ghi thanh cong. Xoa luon qua `AlertDialog`; loading, empty state, retry error va phim tat `Ctrl/Cmd + N` duoc ho tro.
- Thanh cong cu chi hien mot nut hanh dong chinh theo tab dang mo: them phong o tab Phong, them giuong o tab Giuong.
- Form phong sap xep theo `Chi nhanh` -> `Toa nha` -> `Tang` -> `So phong`; toa va tang dung combobox goi y tu du lieu hien co, cho phep them gia tri moi va chuan hoa tien to ma khong thay doi schema.
- Form giuong tach bo loc phu thuoc `Chi nhanh` -> `Toa` -> `Phong`. Moi lan doi chi nhanh hoac toa, cac lua chon phia sau duoc dua ve ban ghi hop le dau tien. Request van chi gui `MaPhong` vi phong da xac dinh toa va chi nhanh.
- Gia thue duoc lay tu `LoaiPhong`, hien thi theo dinh dang VND va khong cho nhap tay.

## Fresh init va kiem thu

- `01_InitTables.sql` da co bang, PK/FK, unique va check constraint can thiet; `02_Seeds.sql` da co chi nhanh, loai phong, phong va giuong hop le. Vi vay contribution nay khong sua SQL init/seed.
- Unit test bao phu required field, status, suc chua, chuyen/doi so/xoa giuong va chuan hoa gioi tinh.
- Integration test la opt-in bang `HOMESTAY_TEST_CONNECTION_STRING`; khong co connection string hay credential theo may trong repository.

## Gioi han

- Cac integration test bi skip neu khong dat `HOMESTAY_TEST_CONNECTION_STRING`.
- Typecheck toan frontend con cac loi baseline o dashboard va `RegistrationForm`; production build cua use case van thanh cong va lint rieng cac file UC sach.
