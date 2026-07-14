namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/financial-proofs")]
[Authorize(Roles = "KeToan,QuanLy")]
public sealed class ChungTuTaiChinhController(IChungTuTaiChinhStorage storage) : ControllerBase
{
    [HttpGet("{loai}/{tenTep}")]
    public async Task<IActionResult> Doc(string loai, string tenTep, CancellationToken cancellationToken)
    {
        try
        {
            var noiDung = await storage.Doc(loai, tenTep, cancellationToken);
            return noiDung is null ? NotFound() : File(noiDung.DuLieu, noiDung.ContentType);
        }
        catch (ArgumentException) { return NotFound(); }
    }
}
