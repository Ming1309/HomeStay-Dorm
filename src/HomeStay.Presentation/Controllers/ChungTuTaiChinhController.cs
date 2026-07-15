namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/financial-proofs")]
[Authorize(Roles = "KeToan,QuanLy")]
public sealed class ChungTuTaiChinhController(
    IChungTuTaiChinhStorage storage,
    KiemTraQuyenChungTu kiemTraQuyen) : ControllerBase
{
    [HttpGet("{loai}/{tenTep}")]
    public async Task<IActionResult> Doc(string loai, string tenTep, CancellationToken cancellationToken)
    {
        try
        {
            if (!await kiemTraQuyen.DuocDocTaiChinh(loai, tenTep, User.FindFirstValue("MaNV")))
                return NotFound();
            var noiDung = await storage.Doc(loai, tenTep, cancellationToken);
            return noiDung is null ? NotFound() : File(noiDung.DuLieu, noiDung.ContentType);
        }
        catch (ArgumentException) { return NotFound(); }
    }
}
