namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed record TaiSanBanGiaoInput(
    string MaTS,
    int SoLuong,
    string TinhTrang,
    string? GhiChu);

public sealed class ChiTietBanGiao
{
    public string MaHD { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }
    public string MaPhong { get; set; } = string.Empty;
    public List<PhongTaiSan> TaiSan { get; set; } = [];
}

public sealed class LapBienBanBanGiao(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
{
    public async Task<IReadOnlyList<HopDongChoBanGiao>> LayDanhSachChoBanGiao(string? tuKhoa = null)
    {
        using var phien = taoPhienDuLieu();
        return await HopDong.LayDanhSachChoBanGiao(tuKhoa);
    }

    public async Task<ChiTietBanGiao> LayChiTietBanGiao(string maHD)
    {
        using var phien = taoPhienDuLieu();
        var hopDong = await HopDong.DocChiTiet(maHD)
            ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng phù hợp");

        hopDong.KiemTraChoBanGiao();

        if (await BienBanGiaoNhan.TonTaiBanGiaoTheoHD(maHD))
            throw new InvalidOperationException("Hợp đồng đã có biên bản bàn giao.");

        var taiSan = await PhongTaiSan.LayTaiSanTheoPhong(hopDong.Phong.MaPhong);
        return new ChiTietBanGiao
        {
            MaHD = hopDong.MaHD,
            TenKhachHang = hopDong.KhachHang.HoTen,
            SoPhong = hopDong.Phong.SoPhong,
            ToaNha = hopDong.Phong.ToaNha,
            MaPhong = hopDong.Phong.MaPhong,
            TaiSan = taiSan.ToList(),
        };
    }

    public async Task<BienBanGiaoNhan> ChotBienBan(string maHD, string? maNV, IReadOnlyList<TaiSanBanGiaoInput> taiSan)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var hopDong = await HopDong.DocChiTiet(maHD)
                ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng phù hợp");

            hopDong.KiemTraChoBanGiao();

            if (await BienBanGiaoNhan.TonTaiBanGiaoTheoHD(maHD))
                throw new InvalidOperationException("Hợp đồng đã có biên bản bàn giao.");

            var taiSanPhong = (await PhongTaiSan.LayTaiSanTheoPhong(hopDong.Phong.MaPhong))
                .ToDictionary(x => x.MaTS, StringComparer.OrdinalIgnoreCase);

            if (taiSan is null || taiSan.Count == 0)
                throw new ArgumentException("Vui lòng nhập đầy đủ và chính xác tình trạng cho tất cả tài sản");

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
                };
                dong.KiemTraHopLe();
                chiTiet.Add(dong);
            }

            var maMoi = await DataAccess.DBs.MaTuDongDB.TaoMaMoi("BienBanGiaoNhan", "MaBienBan", "BBBG");
            var bienBan = BienBanGiaoNhan.KhoiTaoBanGiao(
                maMoi, maHD, maNV, timeProvider.GetLocalNow().DateTime, chiTiet);

            bienBan.KiemTraDuLieuTaiSan();
            await bienBan.LuuBienBan();
            await ChiTietGiaoNhan.ThemNhieu(bienBan.ChiTiet);
            await Giuong.CapNhatDangSuDungTheoHD(maHD);
            // ChiTietHopDong.TrangThaiThue đã là "DangThue" từ khi lập HĐ,
            // DB constraint chỉ cho phép {DangThue, DaTra}, không cần update.
            await hopDong.ChuyenTrangThaiDangHieuLuc();

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
