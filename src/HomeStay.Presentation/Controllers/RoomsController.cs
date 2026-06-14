namespace HomeStay.Presentation.Controllers;

using Microsoft.AspNetCore.Mvc;
using HomeStay.BusinessLogic.Services;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly Phong _phong;

    public RoomsController(Phong phong)
    {
        _phong = phong;
    }

    [HttpGet("available-with-beds")]
    public async Task<IActionResult> GetAvailableRoomsWithBeds(
        [FromQuery] int soLuong = 1, 
        [FromQuery] string toaNha = "", 
        [FromQuery] string loaiPhong = "", 
        [FromQuery] decimal giaMin = 0, 
        [FromQuery] decimal giaMax = 0)
    {
        var rooms = await _phong.TimKiemPhongConGiuongTrong(soLuong, toaNha, loaiPhong, giaMin, giaMax);
        return Ok(rooms);
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableRooms(
        [FromQuery] string toaNha = "", 
        [FromQuery] string loaiPhong = "", 
        [FromQuery] decimal giaMin = 0, 
        [FromQuery] decimal giaMax = 0)
    {
        var rooms = await _phong.TimKiemPhongTrong(toaNha, loaiPhong, giaMin, giaMax);
        return Ok(rooms);
    }

    [HttpGet("calculate-deposit")]
    public IActionResult CalculateDeposit(
        [FromQuery] string maPhong, 
        [FromQuery] decimal giaThue, 
        [FromQuery] int soLuong, 
        [FromQuery] string hinhThuc)
    {
        var tienCoc = _phong.TinhTienCoc(maPhong, giaThue, soLuong, hinhThuc);
        return Ok(new { TienCoc = tienCoc });
    }
}
