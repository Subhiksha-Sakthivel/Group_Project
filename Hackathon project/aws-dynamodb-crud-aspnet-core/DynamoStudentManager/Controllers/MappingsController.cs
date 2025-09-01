using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using YourNamespace.Dtos;
using YourNamespace.Services;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MappingsController : ControllerBase
    {
        private readonly IMappingService _service;

        public MappingsController(IMappingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("table")]
        public async Task<IActionResult> GetTable()
        {
            var items = await _service.GetTableAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MappingDto mapping)
        {
            var result = await _service.CreateAsync(mapping);
            return CreatedAtAction(nameof(Get), new { id = ((dynamic)result).Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MappingDto mapping)
        {
            var updated = await _service.UpdateAsync(id, mapping);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/soft-delete")]
        public async Task<IActionResult> SoftDelete(string id)
        {
            var result = await _service.SoftDeleteAsync(id);
            return Ok(result);
        }

        [HttpPost("{id}/restore")]
        public async Task<IActionResult> Restore(string id)
        {
            var result = await _service.RestoreAsync(id);
            return Ok(result);
        }

        [HttpPost("cleanup-expired")]
        public async Task<IActionResult> CleanupExpired()
        {
            await _service.CleanupExpiredDeletedMappingsAsync();
            return Ok(new { message = "Cleanup completed" });
        }
    }
}
