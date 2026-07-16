namespace HomeStay.Application.DataAccess.DBs;

using System.Globalization;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class DashboardDB
{
    private static readonly CultureInfo Vi = CultureInfo.GetCultureInfo("vi-VN");

    public static async Task<SaleDashboardSnapshot> LaySale(string maCN, string? tenChiNhanh, DateTime asOf)
    {
        const string sql = """
            SELECT
                (SELECT COUNT(1)
                 FROM LichHen lh
                 WHERE lh.MaCN=@MaCN
                   AND CAST(lh.NgayHen AS DATE)=@HomNay
                   AND lh.TrangThai<>N'DaHuy') AS LichHenHomNay,
                (SELECT COUNT(1)
                 FROM LichHen lh
                 WHERE lh.MaCN=@MaCN
                   AND CAST(lh.NgayHen AS DATE)=@HomNay
                   AND lh.TrangThai=N'DaXacNhan') AS LichHenChoXuLy,
                (SELECT COUNT(1)
                 FROM PhieuCoc pc
                 WHERE pc.MaCN=@MaCN
                   AND pc.TrangThai=N'ChoThanhToan'
                   AND (pc.HanThanhToan IS NULL OR pc.HanThanhToan>@AsOf)) AS PhieuCocChoThanhToan,
                (SELECT COUNT(1)
                 FROM PhieuCoc pc
                 WHERE pc.MaCN=@MaCN
                   AND pc.TrangThai=N'DaDuyet'
                   AND NOT EXISTS (
                       SELECT 1 FROM HopDong hd
                       WHERE hd.MaPhieuCoc=pc.MaPhieuCoc AND hd.TrangThai<>N'DaHuy')) AS HopDongChoLap,
                (SELECT COUNT(1)
                 FROM Giuong g
                 INNER JOIN Phong p ON p.MaPhong=g.MaPhong
                 WHERE p.MaCN=@MaCN AND g.TrangThai=N'Trong') AS GiuongTrong,
                (SELECT COUNT(1)
                 FROM PhieuCoc pc
                 WHERE pc.MaCN=@MaCN AND pc.TrangThai=N'DaThanhToan') AS HoSoChoNhap;

            SELECT TOP 5
                lh.MaLH AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                CONVERT(varchar(5), lh.GioHen, 108) AS TimeLabel,
                CASE
                    WHEN lh.MaPhieuCoc IS NOT NULL THEN N'Đã gắn cọc'
                    WHEN lh.MaHD IS NOT NULL THEN N'Gắn hợp đồng'
                    ELSE lh.LoaiLichHen
                END AS Subtitle,
                COALESCE(p.SoPhong, N'—') AS Room,
                lh.TrangThai AS Status
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON pdk.MaPDK=lh.MaPDK
            LEFT JOIN PhieuCoc pc ON pc.MaPhieuCoc=lh.MaPhieuCoc
            LEFT JOIN HopDong hd ON hd.MaHD=lh.MaHD
            LEFT JOIN PhieuCoc pcHd ON pcHd.MaPhieuCoc=hd.MaPhieuCoc
            LEFT JOIN KhachHang kh ON kh.MaKH=COALESCE(pdk.MaKH, pc.MaKH, pcHd.MaKH)
            LEFT JOIN Phong p ON p.MaPhong=COALESCE(pc.MaPhong, pcHd.MaPhong)
            WHERE lh.MaCN=@MaCN
              AND CAST(lh.NgayHen AS DATE)=@HomNay
              AND lh.TrangThai<>N'DaHuy'
            ORDER BY lh.GioHen, lh.MaLH;

            SELECT TOP 1
                pc.MaPhieuCoc AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN
              AND pc.TrangThai=N'ChoThanhToan'
              AND (pc.HanThanhToan IS NULL OR pc.HanThanhToan>@AsOf)
            ORDER BY pc.HanThanhToan, pc.MaPhieuCoc;

            SELECT TOP 1
                pc.MaPhieuCoc AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN
              AND pc.TrangThai=N'DaDuyet'
              AND NOT EXISTS (
                  SELECT 1 FROM HopDong hd
                  WHERE hd.MaPhieuCoc=pc.MaPhieuCoc AND hd.TrangThai<>N'DaHuy')
            ORDER BY pc.ThoiDiemCoc DESC, pc.MaPhieuCoc;

            SELECT TOP 1
                pc.MaPhieuCoc AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN AND pc.TrangThai=N'DaThanhToan'
            ORDER BY pc.ThoiDiemCoc DESC, pc.MaPhieuCoc;
            """;

        await using var multi = await PhienDuLieu.Session.Connection.QueryMultipleAsync(
            sql,
            new { MaCN = maCN, HomNay = asOf.Date, AsOf = asOf },
            PhienDuLieu.Session.Transaction);

        var counts = await multi.ReadSingleAsync<SaleCounts>();
        var recent = (await multi.ReadAsync<QueueRow>()).ToList();
        var samplePendingPayment = await multi.ReadFirstOrDefaultAsync<QueueRow>();
        var sampleApproved = await multi.ReadFirstOrDefaultAsync<QueueRow>();
        var sampleResidence = await multi.ReadFirstOrDefaultAsync<QueueRow>();

        var tasks = new List<DashboardTask>
        {
            TaskItem(
                counts.LichHenHomNay,
                "lịch hẹn hôm nay",
                counts.LichHenChoXuLy > 0
                    ? $"{counts.LichHenChoXuLy} lịch đang ở trạng thái đã xác nhận"
                    : "Không còn lịch hẹn đang chờ xử lý trong ngày.",
                "/sale/tra-cuu-lich-hen",
                counts.LichHenHomNay > 0 ? "orange" : "green"),
            TaskItem(
                counts.PhieuCocChoThanhToan,
                "phiếu cọc chờ ghi nhận thanh toán",
                samplePendingPayment is null
                    ? "Không có phiếu cọc chờ khách thanh toán."
                    : $"{samplePendingPayment.Title} · phòng {samplePendingPayment.Room}",
                "/sale/ghi-nhan-coc",
                counts.PhieuCocChoThanhToan > 0 ? "orange" : "green"),
            TaskItem(
                counts.HopDongChoLap,
                "hợp đồng chờ lập sau khi đã duyệt cọc",
                sampleApproved is null
                    ? "Không có phiếu cọc đã duyệt chờ lập hợp đồng."
                    : $"{sampleApproved.Title} · phòng {sampleApproved.Room}",
                "/sale/lap-hop-dong",
                counts.HopDongChoLap > 0 ? "blue" : "green"),
            TaskItem(
                counts.HoSoChoNhap,
                "hồ sơ lưu trú chờ nhập",
                sampleResidence is null
                    ? "Không có hồ sơ lưu trú cần bổ sung."
                    : $"{sampleResidence.Title} · phòng {sampleResidence.Room}",
                "/sale/ho-so-luu-tru",
                counts.HoSoChoNhap > 0 ? "red" : "green"),
        };

        return new SaleDashboardSnapshot
        {
            Meta = Meta(asOf, maCN, tenChiNhanh, toanHeThong: false),
            Kpis =
            [
                Kpi("lich-hen-hom-nay", "Lịch hẹn hôm nay", counts.LichHenHomNay.ToString("N0", Vi),
                    counts.LichHenChoXuLy > 0
                        ? $"{counts.LichHenChoXuLy} lịch đã xác nhận"
                        : "Không còn lịch chờ xử lý",
                    "blue"),
                Kpi("phieu-coc-cho-thanh-toan", "Phiếu cọc chờ thanh toán", counts.PhieuCocChoThanhToan.ToString("N0", Vi),
                    "Chờ Sale ghi nhận chứng từ", "orange"),
                Kpi("hop-dong-cho-lap", "Hợp đồng chờ lập", counts.HopDongChoLap.ToString("N0", Vi),
                    "Phiếu cọc đã duyệt chưa lập HĐ", "blue"),
                Kpi("giuong-trong", "Giường còn trống", counts.GiuongTrong.ToString("N0", Vi),
                    "Sẵn sàng tư vấn trong chi nhánh", "green"),
            ],
            Tasks = tasks,
            RecentAppointments = recent.Select(x => new DashboardQueueItem
            {
                Id = x.Id,
                Title = x.Title,
                Subtitle = x.Subtitle,
                Room = x.Room,
                Status = MapAppointmentStatus(x.Status),
                TimeLabel = string.IsNullOrWhiteSpace(x.TimeLabel) ? null : $"{x.TimeLabel} hôm nay",
                Tone = ToneForAppointment(x.Status),
            }).ToList(),
        };
    }

    public static async Task<ManagerDashboardSnapshot> LayManager(string maCN, string? tenChiNhanh, DateTime asOf)
    {
        const string sql = """
            SELECT
                (SELECT COUNT(1) FROM PhieuCoc pc
                 WHERE pc.MaCN=@MaCN AND pc.TrangThai=N'ChoDuyet') AS HoSoChoDuyet,
                (SELECT COUNT(1) FROM PhieuCoc pc
                 WHERE pc.MaCN=@MaCN AND pc.TrangThai=N'ChoDoiChieu') AS CocChoXacNhan,
                (SELECT COUNT(1) FROM HopDong hd
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN
                   AND hd.TrangThai=N'ChoBanGiao'
                   AND NOT EXISTS (
                       SELECT 1 FROM BienBanGiaoNhan bb
                       WHERE bb.MaHD=hd.MaHD AND bb.LoaiBienBan=N'BanGiao')) AS PhongChoBanGiao,
                (SELECT COUNT(1) FROM HopDong hd
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
                 INNER JOIN PhieuDoiSoat pds ON pds.MaHD=hd.MaHD
                 WHERE pc.MaCN=@MaCN
                   AND hd.TrangThai=N'DangHieuLuc'
                   AND pds.TrangThai IN (N'DaChot', N'DaTatToan')) AS HopDongChoThanhLy,
                (SELECT COUNT(1) FROM HopDong hd
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
                 INNER JOIN LichHen lh ON lh.MaHD=hd.MaHD
                 WHERE pc.MaCN=@MaCN
                   AND hd.TrangThai=N'DangHieuLuc'
                   AND lh.LoaiLichHen=N'TraPhong'
                   AND CAST(lh.NgayHen AS DATE)=@HomNay
                   AND lh.TrangThai NOT IN (N'DaHuy', N'VangMat')
                   AND NOT EXISTS (
                       SELECT 1 FROM BienBanGiaoNhan bb
                       WHERE bb.MaHD=hd.MaHD AND bb.LoaiBienBan=N'ThuHoi')) AS ThuHoiTaiSan,
                (SELECT COUNT(1) FROM PhieuDoiSoat pds
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=pds.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN AND pds.TrangThai=N'ChoXacNhan') AS DoiSoatChoXacNhan;

            SELECT TOP 5
                hd.MaHD AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room,
                CAST((
                    SELECT COUNT(1) FROM ChiTietHopDong cthd WHERE cthd.MaHD=hd.MaHD
                ) AS nvarchar(20)) AS Extra
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN
              AND hd.TrangThai=N'ChoBanGiao'
              AND NOT EXISTS (
                  SELECT 1 FROM BienBanGiaoNhan bb
                  WHERE bb.MaHD=hd.MaHD AND bb.LoaiBienBan=N'BanGiao')
            ORDER BY hd.MaHD;

            SELECT TOP 1
                pc.MaPhieuCoc AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN AND pc.TrangThai=N'ChoDuyet'
            ORDER BY pc.ThoiDiemCoc DESC, pc.MaPhieuCoc;

            SELECT TOP 1
                pc.MaPhieuCoc AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN AND pc.TrangThai=N'ChoDoiChieu'
            ORDER BY pc.HanThanhToan, pc.MaPhieuCoc;

            SELECT TOP 1
                hd.MaHD AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN
              AND hd.TrangThai=N'ChoBanGiao'
              AND NOT EXISTS (
                  SELECT 1 FROM BienBanGiaoNhan bb
                  WHERE bb.MaHD=hd.MaHD AND bb.LoaiBienBan=N'BanGiao')
            ORDER BY hd.MaHD;

            SELECT TOP 1
                hd.MaHD AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            INNER JOIN LichHen lh ON lh.MaHD=hd.MaHD
            WHERE pc.MaCN=@MaCN
              AND hd.TrangThai=N'DangHieuLuc'
              AND lh.LoaiLichHen=N'TraPhong'
              AND CAST(lh.NgayHen AS DATE)=@HomNay
              AND lh.TrangThai NOT IN (N'DaHuy', N'VangMat')
              AND NOT EXISTS (
                  SELECT 1 FROM BienBanGiaoNhan bb
                  WHERE bb.MaHD=hd.MaHD AND bb.LoaiBienBan=N'ThuHoi')
            ORDER BY lh.GioHen, hd.MaHD;
            """;

        await using var multi = await PhienDuLieu.Session.Connection.QueryMultipleAsync(
            sql,
            new { MaCN = maCN, HomNay = asOf.Date },
            PhienDuLieu.Session.Transaction);

        var counts = await multi.ReadSingleAsync<ManagerCounts>();
        var handover = (await multi.ReadAsync<QueueRow>()).ToList();
        var sampleApproval = await multi.ReadFirstOrDefaultAsync<QueueRow>();
        var sampleDeposit = await multi.ReadFirstOrDefaultAsync<QueueRow>();
        var sampleHandover = await multi.ReadFirstOrDefaultAsync<QueueRow>();
        var sampleRecovery = await multi.ReadFirstOrDefaultAsync<QueueRow>();

        return new ManagerDashboardSnapshot
        {
            Meta = Meta(asOf, maCN, tenChiNhanh, toanHeThong: false),
            Kpis =
            [
                Kpi("ho-so-cho-duyet", "Hồ sơ chờ duyệt", counts.HoSoChoDuyet.ToString("N0", Vi),
                    "Thành viên/điều kiện lưu trú", "blue"),
                Kpi("coc-cho-xac-nhan", "Cọc chờ xác nhận", counts.CocChoXacNhan.ToString("N0", Vi),
                    "Chứng từ khách đã gửi", "orange"),
                Kpi("phong-cho-ban-giao", "Phòng chờ bàn giao", counts.PhongChoBanGiao.ToString("N0", Vi),
                    "Sau khi đã thanh toán kỳ đầu", "green"),
                Kpi("hop-dong-cho-thanh-ly", "Hợp đồng chờ thanh lý", counts.HopDongChoThanhLy.ToString("N0", Vi),
                    counts.ThuHoiTaiSan > 0
                        ? $"{counts.ThuHoiTaiSan} hồ sơ cần thu hồi tài sản hôm nay"
                        : "Đã có đối soát đủ điều kiện",
                    "red"),
            ],
            Tasks =
            [
                TaskItem(counts.HoSoChoDuyet, "hồ sơ lưu trú cần xét duyệt",
                    sampleApproval?.Title ?? "Không còn hồ sơ nào cần kiểm tra điều kiện lưu trú.",
                    "/manager/approval", counts.HoSoChoDuyet > 0 ? "blue" : "green"),
                TaskItem(counts.CocChoXacNhan, "chứng từ cọc chờ xác nhận",
                    sampleDeposit?.Title ?? "Các phiếu cọc hiện tại chưa có chứng từ mới cần đối chiếu.",
                    "/manager/confirm-deposit", counts.CocChoXacNhan > 0 ? "orange" : "green"),
                TaskItem(counts.PhongChoBanGiao, "phòng chờ bàn giao",
                    sampleHandover is null
                        ? "Chưa có phòng nào sẵn sàng bàn giao trong hàng chờ."
                        : $"{sampleHandover.Title} · phòng {sampleHandover.Room}",
                    "/manager/handover", counts.PhongChoBanGiao > 0 ? "blue" : "green"),
                TaskItem(counts.ThuHoiTaiSan, "hồ sơ trả phòng cần thu hồi tài sản",
                    sampleRecovery?.Title ?? "Các hồ sơ trả phòng đã có biên bản tài sản hoặc chưa phát sinh.",
                    "/manager/thu-hoi-tai-san", counts.ThuHoiTaiSan > 0 ? "red" : "green"),
                TaskItem(counts.DoiSoatChoXacNhan, "phiếu đối soát chờ xác nhận",
                    counts.DoiSoatChoXacNhan > 0
                        ? "Cần chốt đồng ý của khách trước khi thu/hoàn"
                        : "Không còn phiếu đối soát chờ xác nhận.",
                    "/manager/reconciliation-approval", counts.DoiSoatChoXacNhan > 0 ? "orange" : "green"),
            ],
            HandoverQueue = handover.Select(x => new DashboardQueueItem
            {
                Id = x.Id,
                Title = x.Title,
                Room = x.Room,
                Extra = string.IsNullOrWhiteSpace(x.Extra) ? "0 người" : $"{x.Extra} người",
                Tone = "blue",
            }).ToList(),
        };
    }

    public static async Task<AccountantDashboardSnapshot> LayAccountant(string maCN, string? tenChiNhanh, DateTime asOf)
    {
        const string sql = """
            SELECT
                (SELECT COALESCE(SUM(pt.SoTienThu), 0)
                 FROM PhieuThu pt
                 LEFT JOIN HoaDon hd ON hd.MaHoaDon=pt.MaHoaDon
                 LEFT JOIN HopDong hop ON hop.MaHD=hd.MaHD
                 LEFT JOIN PhieuCoc pcHd ON pcHd.MaPhieuCoc=hop.MaPhieuCoc
                 LEFT JOIN PhieuCoc pcCoc ON pcCoc.MaPhieuCoc=pt.MaPhieuCoc
                 LEFT JOIN PhieuDoiSoat pds ON pds.MaPDS=pt.MaPDS
                 LEFT JOIN PhieuCoc pcPds ON pcPds.MaPhieuCoc=pds.MaPhieuCoc
                 WHERE CAST(pt.ThoiGian AS DATE)=@HomNay
                   AND COALESCE(pcHd.MaCN, pcCoc.MaCN, pcPds.MaCN)=@MaCN) AS TienThuHomNay,
                (SELECT COUNT(1)
                 FROM PhieuThu pt
                 LEFT JOIN HoaDon hd ON hd.MaHoaDon=pt.MaHoaDon
                 LEFT JOIN HopDong hop ON hop.MaHD=hd.MaHD
                 LEFT JOIN PhieuCoc pcHd ON pcHd.MaPhieuCoc=hop.MaPhieuCoc
                 LEFT JOIN PhieuCoc pcCoc ON pcCoc.MaPhieuCoc=pt.MaPhieuCoc
                 LEFT JOIN PhieuDoiSoat pds ON pds.MaPDS=pt.MaPDS
                 LEFT JOIN PhieuCoc pcPds ON pcPds.MaPhieuCoc=pds.MaPhieuCoc
                 WHERE CAST(pt.ThoiGian AS DATE)=@HomNay
                   AND COALESCE(pcHd.MaCN, pcCoc.MaCN, pcPds.MaCN)=@MaCN) AS SoGiaoDichThuHomNay,
                (SELECT COUNT(1) FROM HopDong hd
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN AND hd.TrangThai=N'ChoThanhToan') AS HopDongChoThu,
                (SELECT COALESCE(SUM(hd.GiaThue + pc.TongTien), 0) FROM HopDong hd
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN AND hd.TrangThai=N'ChoThanhToan') AS GiaTriHopDongChoThu,
                (SELECT COUNT(1) FROM PhieuDoiSoat pds
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=pds.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN AND pds.TrangThai=N'DaChot' AND pds.TienThuThem>0
                   AND NOT EXISTS (SELECT 1 FROM PhieuThu pt WHERE pt.MaPDS=pds.MaPDS)) AS DoiSoatChoThuThem,
                (SELECT COALESCE(SUM(pds.TienThuThem), 0) FROM PhieuDoiSoat pds
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=pds.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN AND pds.TrangThai=N'DaChot' AND pds.TienThuThem>0
                   AND NOT EXISTS (SELECT 1 FROM PhieuThu pt WHERE pt.MaPDS=pds.MaPDS)) AS GiaTriThuThem,
                (SELECT COUNT(1) FROM PhieuDoiSoat pds
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=pds.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN AND pds.TrangThai=N'DaChot' AND pds.TienHoan>0
                   AND (pds.MaHD IS NULL OR EXISTS (
                        SELECT 1 FROM HopDong hd WHERE hd.MaHD=pds.MaHD AND hd.TrangThai=N'DaThanhLy'))
                   AND NOT EXISTS (SELECT 1 FROM PhieuHoanCoc phc WHERE phc.MaPDS=pds.MaPDS)) AS DoiSoatChoHoan,
                (SELECT COUNT(1) FROM HopDong hd
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN
                   AND hd.TrangThai=N'DangHieuLuc'
                   AND EXISTS (
                       SELECT 1 FROM BienBanGiaoNhan bb
                       WHERE bb.MaHD=hd.MaHD AND bb.LoaiBienBan=N'ThuHoi')
                   AND NOT EXISTS (SELECT 1 FROM PhieuDoiSoat pds WHERE pds.MaHD=hd.MaHD)) AS ChoDoiSoat,
                (SELECT COUNT(1) FROM HoaDon hd
                 INNER JOIN HopDong hop ON hop.MaHD=hd.MaHD
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hop.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN
                   AND hd.LoaiHoaDon=N'BoiThuong'
                   AND hd.TrangThai IN (N'ChuaThanhToan', N'ThanhToanMotPhan')) AS HoaDonBoiThuongChoThu,
                (SELECT COALESCE(SUM(hd.TongTien), 0) FROM HoaDon hd
                 INNER JOIN HopDong hop ON hop.MaHD=hd.MaHD
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hop.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN
                   AND hd.LoaiHoaDon=N'BoiThuong'
                   AND hd.TrangThai IN (N'ChuaThanhToan', N'ThanhToanMotPhan')) AS GiaTriBoiThuongChoThu,
                (SELECT COUNT(1) FROM BienBanGiaoNhan bb
                 INNER JOIN HopDong hop ON hop.MaHD=bb.MaHD
                 INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hop.MaPhieuCoc
                 WHERE pc.MaCN=@MaCN
                   AND bb.LoaiBienBan=N'ThuHoi'
                   AND EXISTS (
                       SELECT 1 FROM ChiTietGiaoNhan ct
                       WHERE ct.MaBienBan=bb.MaBienBan
                         AND (ct.TinhTrang LIKE N'%hỏng%' OR ct.TinhTrang LIKE N'%mất%' OR ct.TinhTrang LIKE N'%hong%' OR ct.TinhTrang LIKE N'%mat%'))
                   AND NOT EXISTS (
                       SELECT 1 FROM HoaDon hd
                       WHERE hd.MaHD=bb.MaHD AND hd.LoaiHoaDon=N'BoiThuong')) AS BienBanChuaLapBoiThuong;

            SELECT TOP 5 * FROM (
                SELECT pt.MaPT AS Id,
                       COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                       p.SoPhong AS Room,
                       pt.SoTienThu AS Amount,
                       pt.ThoiGian AS SortTime,
                       N'Thu' AS Extra
                FROM PhieuThu pt
                LEFT JOIN HoaDon hd ON hd.MaHoaDon=pt.MaHoaDon
                LEFT JOIN HopDong hop ON hop.MaHD=hd.MaHD
                LEFT JOIN PhieuCoc pcHd ON pcHd.MaPhieuCoc=hop.MaPhieuCoc
                LEFT JOIN PhieuCoc pcCoc ON pcCoc.MaPhieuCoc=pt.MaPhieuCoc
                LEFT JOIN PhieuDoiSoat pds ON pds.MaPDS=pt.MaPDS
                LEFT JOIN PhieuCoc pcPds ON pcPds.MaPhieuCoc=pds.MaPhieuCoc
                LEFT JOIN PhieuCoc pc ON pc.MaPhieuCoc=COALESCE(pcHd.MaPhieuCoc, pcCoc.MaPhieuCoc, pcPds.MaPhieuCoc)
                LEFT JOIN KhachHang kh ON kh.MaKH=pc.MaKH
                LEFT JOIN Phong p ON p.MaPhong=pc.MaPhong
                WHERE COALESCE(pcHd.MaCN, pcCoc.MaCN, pcPds.MaCN)=@MaCN
                UNION ALL
                SELECT phc.MaPHC AS Id,
                       COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                       p.SoPhong AS Room,
                       phc.SoTienHoan AS Amount,
                       phc.ThoiGian AS SortTime,
                       N'Hoàn' AS Extra
                FROM PhieuHoanCoc phc
                INNER JOIN PhieuDoiSoat pds ON pds.MaPDS=phc.MaPDS
                INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=pds.MaPhieuCoc
                INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
                INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
                WHERE pc.MaCN=@MaCN
            ) g
            ORDER BY SortTime DESC, Id DESC;

            SELECT CAST(d.Ngay AS date) AS Ngay, COALESCE(SUM(pt.SoTienThu), 0) AS GiaTri
            FROM (
                SELECT CAST(DATEADD(day, -n.n, @HomNay) AS date) AS Ngay
                FROM (VALUES (0),(1),(2),(3),(4),(5),(6)) n(n)
            ) d
            LEFT JOIN PhieuThu pt ON CAST(pt.ThoiGian AS date)=d.Ngay
            LEFT JOIN HoaDon hd ON hd.MaHoaDon=pt.MaHoaDon
            LEFT JOIN HopDong hop ON hop.MaHD=hd.MaHD
            LEFT JOIN PhieuCoc pcHd ON pcHd.MaPhieuCoc=hop.MaPhieuCoc
            LEFT JOIN PhieuCoc pcCoc ON pcCoc.MaPhieuCoc=pt.MaPhieuCoc
            LEFT JOIN PhieuDoiSoat pds ON pds.MaPDS=pt.MaPDS
            LEFT JOIN PhieuCoc pcPds ON pcPds.MaPhieuCoc=pds.MaPhieuCoc
            WHERE pt.MaPT IS NULL
               OR COALESCE(pcHd.MaCN, pcCoc.MaCN, pcPds.MaCN)=@MaCN
            GROUP BY d.Ngay
            ORDER BY d.Ngay;

            SELECT TOP 1
                hd.MaHD AS Id,
                COALESCE(kh.HoTen, N'Khách hàng') AS Title,
                p.SoPhong AS Room
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc=hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.MaCN=@MaCN AND hd.TrangThai=N'ChoThanhToan'
            ORDER BY hd.NgayBatDau, hd.MaHD;
            """;

        await using var multi = await PhienDuLieu.Session.Connection.QueryMultipleAsync(
            sql,
            new { MaCN = maCN, HomNay = asOf.Date },
            PhienDuLieu.Session.Transaction);

        var counts = await multi.ReadSingleAsync<AccountantCounts>();
        var recent = (await multi.ReadAsync<TxnRow>()).ToList();
        var trend = (await multi.ReadAsync<TrendRow>()).ToList();
        var samplePayment = await multi.ReadFirstOrDefaultAsync<QueueRow>();

        var pendingCollectionValue = counts.GiaTriHopDongChoThu + counts.GiaTriThuThem + counts.GiaTriBoiThuongChoThu;
        var pendingVoucherCount = counts.DoiSoatChoThuThem + counts.DoiSoatChoHoan;

        return new AccountantDashboardSnapshot
        {
            Meta = Meta(asOf, maCN, tenChiNhanh, toanHeThong: false),
            Kpis =
            [
                Kpi("tien-thu-hom-nay", "Tiền thu hôm nay", FormatMoney(counts.TienThuHomNay),
                    $"{counts.SoGiaoDichThuHomNay.ToString("N0", Vi)} giao dịch đã ghi nhận", "green"),
                Kpi("gia-tri-cho-thu", "Giá trị chờ thu", FormatMoney(pendingCollectionValue),
                    $"{counts.HopDongChoThu} HĐ · {counts.DoiSoatChoThuThem} thu thêm · {counts.HoaDonBoiThuongChoThu} bồi thường",
                    "orange"),
                Kpi("cho-doi-soat", "Hồ sơ chờ đối soát", counts.ChoDoiSoat.ToString("N0", Vi),
                    "Đã thu hồi tài sản, chưa lập phiếu đối soát", "blue"),
                Kpi("phieu-thu-hoan", "Phiếu thu/hoàn cần xử lý", pendingVoucherCount.ToString("N0", Vi),
                    $"{counts.DoiSoatChoHoan} hoàn cọc, {counts.DoiSoatChoThuThem} thu thêm", "blue"),
            ],
            Tasks =
            [
                TaskItem(counts.HopDongChoThu, "hợp đồng chờ thu tiền",
                    samplePayment?.Title ?? "Không có hợp đồng nào đang chờ thu trong danh sách.",
                    "/accountant/payments", counts.HopDongChoThu > 0 ? "orange" : "green"),
                TaskItem(counts.ChoDoiSoat, "hợp đồng chờ đối soát trả phòng",
                    $"{counts.DoiSoatChoHoan} hồ sơ có hoàn cọc, {counts.DoiSoatChoThuThem} hồ sơ cần thu thêm",
                    "/accountant/doi-soat", counts.ChoDoiSoat > 0 ? "blue" : "green"),
                TaskItem(counts.DoiSoatChoHoan, "phiếu hoàn cọc chờ lập",
                    counts.DoiSoatChoHoan > 0
                        ? "Đối soát đã chốt và đủ điều kiện hoàn"
                        : "Không còn phiếu hoàn cọc chờ xử lý.",
                    "/accountant/refunds", counts.DoiSoatChoHoan > 0 ? "blue" : "green"),
                TaskItem(counts.BienBanChuaLapBoiThuong, "biên bản thu hồi chờ lập hóa đơn bồi thường",
                    counts.BienBanChuaLapBoiThuong > 0
                        ? "Có biên bản thu hồi hư hỏng/mất chưa lập hóa đơn"
                        : "Hóa đơn bồi thường đã được lập hoặc chưa phát sinh.",
                    "/accountant/compensation", counts.BienBanChuaLapBoiThuong > 0 ? "red" : "green"),
            ],
            RecentTransactions = recent.Select(x => new DashboardQueueItem
            {
                Id = x.Id,
                Title = x.Title,
                Room = x.Room,
                Amount = x.Amount,
                Extra = x.Extra,
                TimeLabel = x.SortTime.ToString("dd/MM HH:mm", Vi),
                Tone = string.Equals(x.Extra, "Hoàn", StringComparison.OrdinalIgnoreCase) ? "orange" : "green",
            }).ToList(),
            ReceiptTrend = trend.Select(x => new DashboardTrendPoint
            {
                Date = DateOnly.FromDateTime(x.Ngay),
                Label = x.Ngay.ToString("dd/MM", Vi),
                Value = x.GiaTri,
            }).ToList(),
        };
    }

    public static async Task<AdminDashboardSnapshot> LayAdmin(DateTime asOf)
    {
        const string sql = """
            SELECT
                (SELECT COUNT(1) FROM Phong) AS TongPhong,
                (SELECT COUNT(1) FROM Giuong) AS TongGiuong,
                (SELECT COUNT(1) FROM Giuong WHERE TrangThai=N'Trong') AS GiuongTrong,
                (SELECT COUNT(1) FROM Giuong WHERE TrangThai=N'DangBaoTri') AS GiuongBaoTri,
                (SELECT COUNT(1) FROM Phong WHERE TrangThai=N'DangBaoTri') AS PhongBaoTri,
                (SELECT COUNT(1) FROM TaiKhoan) AS TongTaiKhoan,
                (SELECT COUNT(1) FROM TaiKhoan WHERE TrangThai=N'HoatDong') AS TaiKhoanHoatDong,
                (SELECT COUNT(1) FROM TaiKhoan WHERE TrangThai=N'Khoa') AS TaiKhoanKhoa,
                (SELECT COUNT(1) FROM DichVu WHERE TrangThai=N'DangApDung') AS DichVuDangApDung,
                (SELECT COUNT(1) FROM TaiSan WHERE TrangThai=N'DangApDung') AS TaiSanDangApDung,
                (SELECT COUNT(1) FROM QuyDinh
                 WHERE NgayApDung<=@HomNay
                   AND (NgayKetThuc IS NULL OR NgayKetThuc>=@HomNay)) AS QuyDinhDangApDung,
                (SELECT COUNT(1)
                 FROM ChinhSachHoanCoc
                 WHERE NgayApDung<=@HomNay
                   AND (NgayKetThuc IS NULL OR NgayKetThuc>=@HomNay)) AS ChinhSachDangApDung;

            SELECT TOP 1 MaChinhSach, TenChinhSach, MocLuuTru
            FROM ChinhSachHoanCoc
            WHERE NgayApDung<=@HomNay
              AND (NgayKetThuc IS NULL OR NgayKetThuc>=@HomNay)
            ORDER BY NgayApDung DESC;

            SELECT g.TrangThai AS Label, COUNT(1) AS Count
            FROM Giuong g
            GROUP BY g.TrangThai
            ORDER BY COUNT(1) DESC, g.TrangThai;

            SELECT TOP 1 SoPhong AS Room
            FROM Phong
            WHERE TrangThai=N'DangBaoTri'
            ORDER BY MaPhong;

            SELECT TOP 1 SoGiuong AS Room
            FROM Giuong
            WHERE TrangThai=N'DangBaoTri'
            ORDER BY MaGiuong;
            """;

        await using var multi = await PhienDuLieu.Session.Connection.QueryMultipleAsync(
            sql,
            new { HomNay = asOf.Date },
            PhienDuLieu.Session.Transaction);

        var counts = await multi.ReadSingleAsync<AdminCounts>();
        var policy = await multi.ReadFirstOrDefaultAsync<PolicyRow>();
        var breakdown = (await multi.ReadAsync<DashboardStatusBreakdown>()).ToList();
        var sampleMaintRoom = await multi.ReadFirstOrDefaultAsync<QueueRow>();
        var sampleMaintBed = await multi.ReadFirstOrDefaultAsync<QueueRow>();

        var activeConfigCount = counts.DichVuDangApDung
            + counts.TaiSanDangApDung
            + counts.QuyDinhDangApDung
            + counts.ChinhSachDangApDung;
        var maintenanceCount = counts.PhongBaoTri + counts.GiuongBaoTri;

        return new AdminDashboardSnapshot
        {
            Meta = Meta(asOf, null, null, toanHeThong: true),
            ActivePolicyCode = policy?.MaChinhSach,
            ActivePolicyName = policy?.TenChinhSach,
            Kpis =
            [
                Kpi("phong-giuong", "Tổng phòng / giường",
                    $"{counts.TongPhong.ToString("N0", Vi)} / {counts.TongGiuong.ToString("N0", Vi)}",
                    "Danh mục đang quản trị", "blue"),
                Kpi("giuong-trong", "Giường trống", counts.GiuongTrong.ToString("N0", Vi),
                    $"{counts.GiuongBaoTri.ToString("N0", Vi)} giường bảo trì", "green"),
                Kpi("tai-khoan", "Tài khoản hoạt động",
                    $"{counts.TaiKhoanHoatDong.ToString("N0", Vi)}/{counts.TongTaiKhoan.ToString("N0", Vi)}",
                    $"{counts.TaiKhoanKhoa.ToString("N0", Vi)} tài khoản đang khóa", "orange"),
                Kpi("cau-hinh", "Cấu hình đang áp dụng", activeConfigCount.ToString("N0", Vi),
                    policy?.MaChinhSach ?? "Chưa có chính sách hiệu lực",
                    policy is null ? "red" : "blue"),
            ],
            Tasks =
            [
                TaskItem(maintenanceCount, "phòng/giường cần bảo trì",
                    sampleMaintRoom?.Room
                    ?? (sampleMaintBed?.Room is null ? "Không có phòng hoặc giường nào đang bảo trì." : $"Giường {sampleMaintBed.Room}"),
                    "/admin/rooms-beds", maintenanceCount > 0 ? "red" : "green"),
                new DashboardTask
                {
                    Count = policy is null ? 1 : 0,
                    Text = policy is null
                        ? "Chưa có chính sách hoàn cọc hiệu lực"
                        : $"Chính sách hoàn cọc hiệu lực: {policy.MaChinhSach}",
                    Meta = policy is null
                        ? "Cần kiểm tra cấu hình chính sách hoàn cọc."
                        : $"{policy.TenChinhSach} - mốc lưu trú {policy.MocLuuTru} tháng",
                    To = "/admin/deposit-policy",
                    Tone = policy is null ? "red" : "blue",
                },
                TaskItem(4, "danh mục vận hành cần duy trì",
                    "Dịch vụ, phòng/giường, tài sản và quy định lưu trú.",
                    "/admin/services", "blue"),
                TaskItem(counts.TaiKhoanKhoa, "tài khoản nhân viên đang khóa",
                    "Kiểm tra phân quyền và trạng thái truy cập khi thay đổi nhân sự.",
                    "/admin/users", counts.TaiKhoanKhoa > 0 ? "orange" : "green"),
            ],
            ConfigRows =
            [
                new DashboardQueueItem
                {
                    Id = "rooms-beds",
                    Title = "Phòng / Giường",
                    Status = $"{counts.TongPhong} phòng, {counts.GiuongTrong} giường trống",
                    Extra = "Danh mục",
                    Tone = "blue",
                },
                new DashboardQueueItem
                {
                    Id = "deposit-policy",
                    Title = "Chính sách hoàn cọc",
                    Status = policy?.MaChinhSach ?? "Chưa hiệu lực",
                    Extra = "Chính sách",
                    Tone = policy is null ? "red" : "green",
                },
                new DashboardQueueItem
                {
                    Id = "users",
                    Title = "Người dùng",
                    Status = $"{counts.TaiKhoanHoatDong} hoạt động",
                    Extra = "Phân quyền",
                    Tone = "orange",
                },
            ],
            BedStatusBreakdown = breakdown.Select(x => new DashboardStatusBreakdown
            {
                Label = MapBedStatus(x.Label),
                Count = x.Count,
            }).ToList(),
        };
    }

    private static DashboardMeta Meta(DateTime asOf, string? maCN, string? tenChiNhanh, bool toanHeThong) =>
        new()
        {
            AsOf = asOf,
            MaCN = maCN,
            TenChiNhanh = tenChiNhanh,
            ScopeLabel = toanHeThong
                ? "Toàn hệ thống"
                : string.IsNullOrWhiteSpace(tenChiNhanh)
                    ? $"Chi nhánh {maCN}"
                    : $"Chi nhánh {tenChiNhanh}",
        };

    private static DashboardKpi Kpi(string key, string label, string value, string subtext, string tone) =>
        new()
        {
            Key = key,
            Label = label,
            Value = value,
            Subtext = subtext,
            Tone = tone,
        };

    private static DashboardTask TaskItem(int count, string noun, string meta, string to, string tone) =>
        new()
        {
            Count = count,
            Text = $"{count.ToString("N0", Vi)} {noun}",
            Meta = meta,
            To = to,
            Tone = tone,
        };

    private static string FormatMoney(decimal value) =>
        string.Create(Vi, $"{value:N0} VNĐ");

    private static string MapAppointmentStatus(string? status) => status switch
    {
        "DaXacNhan" => "Đã xác nhận",
        "DaCheckin" => "Đã check-in",
        "DaHoanThanh" => "Đã hoàn thành",
        "VangMat" => "Vắng mặt",
        "DaHuy" => "Đã hủy",
        _ => status ?? "—",
    };

    private static string ToneForAppointment(string? status) => status switch
    {
        "DaHoanThanh" => "green",
        "DaCheckin" => "blue",
        "VangMat" => "red",
        "DaHuy" => "red",
        _ => "orange",
    };

    private static string MapBedStatus(string? status) => status switch
    {
        "Trong" => "Trống",
        "GiuCho" => "Giữ chỗ",
        "DaCoc" => "Đã cọc",
        "DangSuDung" => "Đang sử dụng",
        "DangBaoTri" => "Bảo trì",
        "NgungSuDung" => "Ngừng sử dụng",
        _ => status ?? "Khác",
    };

    private sealed class SaleCounts
    {
        public int LichHenHomNay { get; init; }
        public int LichHenChoXuLy { get; init; }
        public int PhieuCocChoThanhToan { get; init; }
        public int HopDongChoLap { get; init; }
        public int GiuongTrong { get; init; }
        public int HoSoChoNhap { get; init; }
    }

    private sealed class ManagerCounts
    {
        public int HoSoChoDuyet { get; init; }
        public int CocChoXacNhan { get; init; }
        public int PhongChoBanGiao { get; init; }
        public int HopDongChoThanhLy { get; init; }
        public int ThuHoiTaiSan { get; init; }
        public int DoiSoatChoXacNhan { get; init; }
    }

    private sealed class AccountantCounts
    {
        public decimal TienThuHomNay { get; init; }
        public int SoGiaoDichThuHomNay { get; init; }
        public int HopDongChoThu { get; init; }
        public decimal GiaTriHopDongChoThu { get; init; }
        public int DoiSoatChoThuThem { get; init; }
        public decimal GiaTriThuThem { get; init; }
        public int DoiSoatChoHoan { get; init; }
        public int ChoDoiSoat { get; init; }
        public int HoaDonBoiThuongChoThu { get; init; }
        public decimal GiaTriBoiThuongChoThu { get; init; }
        public int BienBanChuaLapBoiThuong { get; init; }
    }

    private sealed class AdminCounts
    {
        public int TongPhong { get; init; }
        public int TongGiuong { get; init; }
        public int GiuongTrong { get; init; }
        public int GiuongBaoTri { get; init; }
        public int PhongBaoTri { get; init; }
        public int TongTaiKhoan { get; init; }
        public int TaiKhoanHoatDong { get; init; }
        public int TaiKhoanKhoa { get; init; }
        public int DichVuDangApDung { get; init; }
        public int TaiSanDangApDung { get; init; }
        public int QuyDinhDangApDung { get; init; }
        public int ChinhSachDangApDung { get; init; }
    }

    private sealed class QueueRow
    {
        public string Id { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string? Subtitle { get; init; }
        public string? Room { get; init; }
        public string? Status { get; init; }
        public string? TimeLabel { get; init; }
        public string? Extra { get; init; }
    }

    private sealed class TxnRow
    {
        public string Id { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string? Room { get; init; }
        public decimal Amount { get; init; }
        public DateTime SortTime { get; init; }
        public string Extra { get; init; } = string.Empty;
    }

    private sealed class TrendRow
    {
        public DateTime Ngay { get; init; }
        public decimal GiaTri { get; init; }
    }

    private sealed class PolicyRow
    {
        public string MaChinhSach { get; init; } = string.Empty;
        public string TenChinhSach { get; init; } = string.Empty;
        public int MocLuuTru { get; init; }
    }
}
