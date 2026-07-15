namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

// UC 1.4.25 - Quan ly phong / giuong danh cho vai tro QuanTri.
public sealed class QuanLyPhongGiuong(Func<PhienDuLieu> taoPhienDuLieu)
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu = taoPhienDuLieu;

    public async Task<IReadOnlyList<LoaiPhong>> LayDanhSachLoaiPhong()
    {
        using var phien = _taoPhienDuLieu();
        return await LoaiPhong.LayDanhSach();
    }

    public async Task<IReadOnlyList<ChiNhanh>> LayDanhSachChiNhanh()
    {
        using var phien = _taoPhienDuLieu();
        return await ChiNhanh.LayDanhSach();
    }

    // ---- Phong ----

    public async Task<IReadOnlyList<Phong>> LayDanhSachPhong(string? text, string? maCN,
        string? toaNha, string? trangThai)
    {
        using var phien = _taoPhienDuLieu();
        return await Phong.LayDanhSachQuanTri(text, maCN, toaNha, trangThai);
    }

    public async Task<Phong?> LayChiTietPhong(string maPhong)
    {
        using var phien = _taoPhienDuLieu();
        return await Phong.DocChiTiet(maPhong);
    }

    public async Task<Phong> ThemPhong(Phong phong)
    {
        phong.TrangThai = "Trong";
        phong.ChuanHoa();
        phong.KiemTraDuLieuHopLe();
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var loaiPhong = await LoaiPhong.LayTheoMa(phong.MaLP)
                ?? throw new ArgumentException("Loại phòng không tồn tại.");
            if (!await ChiNhanh.TonTai(phong.MaCN))
                throw new ArgumentException("Chi nhánh không tồn tại.");
            if (await Phong.TrungSoPhong(phong.MaCN, phong.SoPhong, null))
                throw new InvalidOperationException(
                    $"Số phòng {phong.SoPhong} đã tồn tại trong chi nhánh này.");
            phong.LoaiPhong = loaiPhong;
            await phong.Them();
            phien.Commit();
            return phong;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<Phong> CapNhatPhong(string maPhong, Phong thongTin)
    {
        thongTin.ChuanHoa();
        thongTin.KiemTraDuLieuHopLe();
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phong = await Phong.DocChiTiet(maPhong)
                ?? throw new KeyNotFoundException("Không tìm thấy phòng.");
            var loaiPhong = await LoaiPhong.LayTheoMa(thongTin.MaLP)
                ?? throw new ArgumentException("Loại phòng không tồn tại.");
            if (!await ChiNhanh.TonTai(thongTin.MaCN))
                throw new ArgumentException("Chi nhánh không tồn tại.");
            if (await Phong.TrungSoPhong(thongTin.MaCN, thongTin.SoPhong, maPhong))
                throw new InvalidOperationException(
                    $"Số phòng {thongTin.SoPhong} đã tồn tại trong chi nhánh này.");

            var soGiuongHienCo = phong.Giuongs.Count;
            // Doi loai phong: suc chua moi khong duoc nho hon so giuong hien co.
            if (phong.MaLP != thongTin.MaLP)
                phong.KiemTraSucChuaChoDoiLoaiPhong(loaiPhong.SucChua, soGiuongHienCo);
            // Doi trang thai: khong mau thuan voi coc/hop dong/giuong dang su dung.
            if (phong.TrangThai != thongTin.TrangThai)
                phong.KiemTraDoiTrangThai(thongTin.TrangThai, phong.Giuongs,
                    await Phong.DangDuocThamChieu(maPhong));

            phong.SoPhong = thongTin.SoPhong;
            phong.ToaNha = thongTin.ToaNha;
            phong.Tang = thongTin.Tang;
            phong.GioiTinhChoPhep = thongTin.GioiTinhChoPhep;
            phong.TrangThai = thongTin.TrangThai;
            phong.MaLP = thongTin.MaLP;
            phong.MaCN = thongTin.MaCN;
            await phong.CapNhatThongTin();
            phien.Commit();
            return await Phong.DocChiTiet(maPhong) ?? phong;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task XoaPhong(string maPhong)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phong = await Phong.DocChiTiet(maPhong)
                ?? throw new KeyNotFoundException("Không tìm thấy phòng.");
            phong.KiemTraCoTheXoa();
            if (await Phong.DangDuocThamChieu(maPhong))
                throw new InvalidOperationException(
                    "Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.");
            await phong.Xoa();
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    // ---- Giuong ----

    public async Task<IReadOnlyList<Giuong>> LayDanhSachGiuong(string? text, string? maPhong,
        string? trangThai)
    {
        using var phien = _taoPhienDuLieu();
        return await Giuong.LayDanhSachQuanTri(text, maPhong, trangThai);
    }

    public async Task<Giuong?> LayChiTietGiuong(string maGiuong)
    {
        using var phien = _taoPhienDuLieu();
        return await Giuong.DocChiTiet(maGiuong);
    }

    public async Task<Giuong> ThemGiuong(Giuong giuong)
    {
        giuong.TrangThai = "Trong";
        giuong.ChuanHoa();
        giuong.KiemTraDuLieuHopLe();
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phong = await Phong.DocChiTiet(giuong.MaPhong)
                ?? throw new KeyNotFoundException("Phòng của giường không tồn tại.");
            if (await Giuong.TrungSoGiuong(giuong.MaPhong, giuong.SoGiuong, null))
                throw new InvalidOperationException(
                    $"Số giường {giuong.SoGiuong} đã tồn tại trong phòng này.");
            phong.KiemTraSoGiuongKhongVuotSucChua(phong.Giuongs.Count);
            await giuong.Them();
            phien.Commit();
            return await Giuong.DocChiTiet(giuong.MaGiuong) ?? giuong;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<Giuong> CapNhatGiuong(string maGiuong, Giuong thongTin)
    {
        thongTin.ChuanHoa();
        thongTin.KiemTraDuLieuHopLe();
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var giuong = await Giuong.DocChiTiet(maGiuong)
                ?? throw new KeyNotFoundException("Không tìm thấy giường.");
            var phong = await Phong.DocChiTiet(thongTin.MaPhong)
                ?? throw new KeyNotFoundException("Phòng của giường không tồn tại.");
            if (await Giuong.TrungSoGiuong(thongTin.MaPhong, thongTin.SoGiuong, maGiuong))
                throw new InvalidOperationException(
                    $"Số giường {thongTin.SoGiuong} đã tồn tại trong phòng này.");

            var dangDuocThamChieu = await Giuong.DangDuocThamChieu(maGiuong);
            if (giuong.SoGiuong != thongTin.SoGiuong)
                giuong.KiemTraCoTheDoiSoGiuong(dangDuocThamChieu);
            // Chuyen giuong sang phong khac: chi khi khong bi tham chieu, va con suc chua phong dich.
            if (giuong.MaPhong != thongTin.MaPhong)
            {
                giuong.KiemTraCoTheChuyenPhong(dangDuocThamChieu);
                phong.KiemTraSoGiuongKhongVuotSucChua(phong.Giuongs.Count);
            }
            // Doi trang thai: khong mau thuan voi tham chieu dang hieu luc.
            if (giuong.TrangThai != thongTin.TrangThai)
                giuong.KiemTraDoiTrangThai(thongTin.TrangThai, dangDuocThamChieu);

            giuong.SoGiuong = thongTin.SoGiuong;
            giuong.TrangThai = thongTin.TrangThai;
            giuong.MaPhong = thongTin.MaPhong;
            await giuong.CapNhatThongTin();
            phien.Commit();
            return await Giuong.DocChiTiet(maGiuong) ?? giuong;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task XoaGiuong(string maGiuong)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var giuong = await Giuong.DocChiTiet(maGiuong)
                ?? throw new KeyNotFoundException("Không tìm thấy giường.");
            giuong.KiemTraCoTheXoa();
            if (await Giuong.DangDuocThamChieu(maGiuong))
                throw new InvalidOperationException(
                    "Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.");
            await giuong.Xoa();
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
