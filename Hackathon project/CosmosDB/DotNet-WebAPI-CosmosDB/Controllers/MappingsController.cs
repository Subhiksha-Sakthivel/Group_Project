using Microsoft.AspNetCore.Mvc;
using YourNamespace.Models;
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
            var mappings = await _service.GetAllAsync();
            return Ok(mappings);
        }

        [HttpGet("table")]
        public async Task<IActionResult> GetTable()
        {
            var mappings = await _service.GetTableAsync();
            return Ok(mappings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var mapping = await _service.GetByIdAsync(id);
            if (mapping == null) return NotFound();
            return Ok(mapping);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Mapping map)
        {
            var mapping = await _service.CreateAsync(map);
            return CreatedAtAction(nameof(GetById), new { id = ((dynamic)mapping).Id }, mapping);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Mapping map)
        {
            var updated = await _service.UpdateAsync(id, map);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
