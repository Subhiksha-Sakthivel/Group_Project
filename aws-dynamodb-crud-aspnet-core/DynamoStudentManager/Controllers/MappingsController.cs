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

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MappingDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = ((dynamic)result).Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MappingDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
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
