namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed record TaiSanThuHoiInput(
    string MaTS,
    int SoLuong,
    string TinhTrang,
    string? GhiChu,
    string? MinhChung);

public sealed class ChiTietThuHoi
{
    public string MaHD { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }
    public string MaPhong { get; set; } = string.Empty;
    public List<PhongTaiSan> TaiSan { get; set; } = [];
}

public sealed class LapBienBanThuHoiTaiSan(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    DichVuThongBao dichVuThongBao)
{
    public async Task<IReadOnlyList<HopDongCoLichTraPhong>> LayDanhSachHopDongTraPhongHomNay(string? tuKhoa = null)
    {
        using var phien = taoPhienDuLieu();
        return await HopDong.LayDanhSachCoLichTraTrongNgay(tuKhoa);
    }

    public async Task<ChiTietThuHoi> LayChiTietHopDongThuHoi(string maHD)
    {
        using var phien = taoPhienDuLieu();
        var hopDong = await HopDong.DocChiTiet(maHD)
            ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng phù hợp");

        hopDong.KiemTraDangHieuLuc();

        if (!await HopDong.CoLichTraPhongTrongNgay(maHD))
            throw new InvalidOperationException("Hợp đồng không có lịch hẹn trả phòng trong ngày.");

        if (await BienBanGiaoNhan.TonTaiThuHoiTheoHD(maHD))
            throw new InvalidOperationException("Hợp đồng đã có biên bản thu hồi tài sản.");

        var taiSan = await PhongTaiSan.LayTaiSanTheoPhong(hopDong.Phong.MaPhong);
        return new ChiTietThuHoi
        {
            MaHD = hopDong.MaHD,
            TenKhachHang = hopDong.KhachHang.HoTen,
            SoPhong = hopDong.Phong.SoPhong,
            ToaNha = hopDong.Phong.ToaNha,
            MaPhong = hopDong.Phong.MaPhong,
            TaiSan = taiSan.ToList(),
        };
    }

    public async Task<BienBanGiaoNhan> LapBienBan(
        string maHD,
        string? maNV,
        IReadOnlyList<TaiSanThuHoiInput> taiSan)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var hopDong = await HopDong.DocChiTiet(maHD)
                ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng phù hợp");

            hopDong.KiemTraDangHieuLuc();

            if (!await HopDong.CoLichTraPhongTrongNgay(maHD))
                throw new InvalidOperationException("Hợp đồng không có lịch hẹn trả phòng trong ngày.");

            if (await BienBanGiaoNhan.TonTaiThuHoiTheoHD(maHD))
                throw new InvalidOperationException("Hợp đồng đã có biên bản thu hồi tài sản.");

            var taiSanPhong = (await PhongTaiSan.LayTaiSanTheoPhong(hopDong.Phong.MaPhong))
                .ToDictionary(x => x.MaTS, StringComparer.OrdinalIgnoreCase);

            if (taiSan is null || taiSan.Count == 0)
                throw new ArgumentException("Vui lòng nhập đầy đủ tình trạng tài sản");

            var chiTiet = new List<ChiTietGiaoNhan>();
            foreach (var item in taiSan)
            {
                if (string.IsNullOrWhiteSpace(item.MaTS) || !taiSanPhong.TryGetValue(item.MaTS, out var pts))
                    throw new ArgumentException($"Tài sản {item.MaTS} không thuộc phòng của hợp đồng.");

                var dong = new ChiTietGiaoNhan
                {
                    MaTS = pts.MaTS,
                    TenTaiSan = pts.TaiSan.TenTaiSan,
                    SoLuongTieuChuan = pts.SoLuongTieuChuan,
                    SoLuong = item.SoLuong,
                    TinhTrang = item.TinhTrang?.Trim() ?? string.Empty,
                    GhiChu = string.IsNullOrWhiteSpace(item.GhiChu) ? null : item.GhiChu.Trim(),
                    MinhChung = string.IsNullOrWhiteSpace(item.MinhChung) ? null : item.MinhChung.Trim(),
                };
                dong.KiemTraHopLe();
                chiTiet.Add(dong);
            }

            var bienBan = BienBanGiaoNhan.KhoiTaoThuHoi(
                maHD,
                maNV,
                timeProvider.GetLocalNow().DateTime,
                chiTiet);

            bienBan.KiemTraDuLieuTaiSan();
            await bienBan.LuuBienBan();
            await ChiTietGiaoNhan.ThemNhieu(bienBan.ChiTiet);

            var phieuCoc = hopDong.PhieuCoc ?? await PhieuCoc.DocChiTiet(hopDong.MaPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc của hợp đồng.");
            await dichVuThongBao.DongTacVu(
                LoaiSuKienThongBao.LichTraPhong, maHD, maNV);

            var coHuHong = chiTiet.Any(x => x.TinhTrang is "Hư hỏng" or "Mất mát");
            await dichVuThongBao.PhatCanXuLyTheoVaiTro(
                coHuHong
                    ? LoaiSuKienThongBao.BienBanThuHoiChoBoiThuong
                    : LoaiSuKienThongBao.BienBanThuHoiChoDoiSoat,
                phieuCoc.MaCN,
                "KeToan",
                coHuHong ? "Biên bản thu hồi cần lập bồi thường" : "Biên bản thu hồi cần đối soát",
                coHuHong
                    ? $"Biên bản {bienBan.MaBienBan} của hợp đồng {maHD} có tài sản hư hỏng hoặc mất mát."
                    : $"Biên bản {bienBan.MaBienBan} của hợp đồng {maHD} không có hư hỏng và đang chờ đối soát.",
                coHuHong
                    ? $"/accountant/compensation?maBienBan={Uri.EscapeDataString(bienBan.MaBienBan)}"
                    : $"/accountant/doi-soat?maHD={Uri.EscapeDataString(maHD)}",
                maHD,
                maNV,
                tone: coHuHong ? "orange" : "blue",
                khoaChongTrung: $"{(coHuHong ? LoaiSuKienThongBao.BienBanThuHoiChoBoiThuong : LoaiSuKienThongBao.BienBanThuHoiChoDoiSoat)}:{bienBan.MaBienBan}");

            phien.Commit();
            return bienBan;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
