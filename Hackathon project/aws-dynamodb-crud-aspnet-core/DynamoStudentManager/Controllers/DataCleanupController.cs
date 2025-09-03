using Microsoft.AspNetCore.Mvc;
using YourNamespace.Services;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataCleanupController : ControllerBase
    {
        private readonly IDataCleanupService _dataCleanupService;

        public DataCleanupController(IDataCleanupService dataCleanupService)
        {
            _dataCleanupService = dataCleanupService;
        }

        [HttpPost("cleanup-and-reseed")]
        public async Task<IActionResult> CleanupAndReseed()
        {
            try
            {
                await _dataCleanupService.CleanupAndReseedAsync();
                return Ok(new { message = "Data cleanup and reseed completed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
