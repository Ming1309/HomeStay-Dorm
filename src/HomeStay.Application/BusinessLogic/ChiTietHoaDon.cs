namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ChiTietHoaDon
{
    public string MaHoaDon { get; set; } = string.Empty;
    public int STT { get; set; }
    public string LoaiKhoanThu { get; set; } = string.Empty;
    public string? MaDV { get; set; }
    public string? MaTS { get; set; }
    public string? MaGiuong { get; set; }
    public decimal SoLuong { get; set; }
    public string? DonViTinh { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien => SoLuong * DonGia;

    // UC 1.4.14 Xử lý thanh toán hợp đồng
    public static ChiTietHoaDon TaoDongTienThueKyDau(string maHoaDon, int stt, decimal donGia, int soLuong, string? maGiuong = null)
    {
        if (string.IsNullOrWhiteSpace(maHoaDon))
            throw new ArgumentException("Mã hóa đơn không được để trống.");
        if (donGia <= 0)
            throw new ArgumentException("Đơn giá phải lớn hơn 0.");
        if (soLuong <= 0)
            throw new ArgumentException("Số lượng phải lớn hơn 0.");

        return new ChiTietHoaDon
        {
            MaHoaDon = maHoaDon,
            STT = stt,
            LoaiKhoanThu = "TienThue",
            MaDV = null,
            MaTS = null,
            MaGiuong = maGiuong,
            SoLuong = soLuong,
            DonViTinh = "tháng",
            DonGia = donGia,
        };
    }

    public static List<ChiTietHoaDon> TaoDongDichVu(string maHoaDon, IReadOnlyList<DichVuHopDong> dichVus, int sttBatDau)
    {
        if (string.IsNullOrWhiteSpace(maHoaDon))
            throw new ArgumentException("Mã hóa đơn không được để trống.");
        if (dichVus is null)
            throw new ArgumentException("Danh sách dịch vụ không được null.");

        var list = new List<ChiTietHoaDon>();
        var stt = sttBatDau;

        foreach (var dv in dichVus)
        {
            if (string.IsNullOrWhiteSpace(dv.MaDV)) continue;
            list.Add(new ChiTietHoaDon
            {
                MaHoaDon = maHoaDon,
                STT = stt++,
                LoaiKhoanThu = "DichVu",
                MaDV = dv.MaDV,
                MaTS = null,
                MaGiuong = null,
                SoLuong = 1,
                DonViTinh = dv.DichVu?.DonViTinh ?? "dịch vụ",
                DonGia = dv.DonGiaKyKet,
            });
        }

        return list;
    }

    public static async Task LuuDanhSachChiTietHoaDon(IReadOnlyList<ChiTietHoaDon> dsChiTiet)
    {
        if (dsChiTiet is null || dsChiTiet.Count == 0)
            throw new ArgumentException("Hóa đơn phải có ít nhất một dòng chi tiết.");
        await ChiTietHoaDonDB.InsertBatch(dsChiTiet);
    }

    public static async Task<bool> TaoChiTietHoaDon(string maHoaDon, IReadOnlyList<ChiTietHoaDon> dsChiTiet)
    {
        if (string.IsNullOrWhiteSpace(maHoaDon))
            throw new ArgumentException("Mã hóa đơn không được để trống.", nameof(maHoaDon));
        if (dsChiTiet is null || dsChiTiet.Count == 0)
            throw new ArgumentException("Hóa đơn bồi thường phải có ít nhất một dòng chi tiết.");

        var stt = 1;
        foreach (var item in dsChiTiet)
        {
            if (string.IsNullOrWhiteSpace(item.MaTS))
                throw new ArgumentException("Mỗi dòng bồi thường phải gắn mã tài sản.");
            if (item.SoLuong <= 0)
                throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");
            if (item.DonGia < 0)
                throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");

            item.MaHoaDon = maHoaDon;
            item.STT = stt++;
            item.LoaiKhoanThu = "BoiThuong";
            item.MaDV = null;
            item.MaGiuong = null;
            item.DonViTinh ??= "món";

            await ChiTietHoaDonDB.InsertChiTietHoaDon(item);
        }

        return true;
    }
}
