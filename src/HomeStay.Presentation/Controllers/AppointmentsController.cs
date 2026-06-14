namespace HomeStay.Presentation.Controllers;

using Microsoft.AspNetCore.Mvc;
using HomeStay.BusinessLogic.Services;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly LichHen _lichHen;
    private readonly KhachHang _khachHang;

    public AppointmentsController(LichHen lichHen, KhachHang khachHang)
    {
        _lichHen = lichHen;
        _khachHang = khachHang;
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingAppointments()
    {
        var appointments = await _lichHen.LayDanhSachXemPhong("DaHoanThanh");
        return Ok(appointments);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchAppointments([FromQuery] string text)
    {
        var appointments = await _lichHen.TimKiemXemPhongHoanThanh(text);
        return Ok(appointments);
    }

    [HttpGet("{id}/customer")]
    public async Task<IActionResult> GetCustomerFromAppointment(string id)
    {
        var maKH = await _lichHen.LayMaKhachHang(id);
        if (string.IsNullOrEmpty(maKH))
        {
            return NotFound(new { Message = "Không tìm thấy khách hàng cho lịch hẹn này" });
        }

        var customer = await _khachHang.LayThongTinKhachHang(maKH);
        return Ok(customer);
    }

    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> CompleteAppointment(string id)
    {
        var updated = await _lichHen.HoanThanh(id);
        if (!updated)
        {
            return NotFound(new { Message = "Không tìm thấy lịch hẹn" });
        }

        return Ok(new { Message = "Đã hoàn thành lịch hẹn" });
    }
}
