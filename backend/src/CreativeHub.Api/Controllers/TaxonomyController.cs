using CreativeHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaxonomyController : ControllerBase
{
    private readonly AppDbContext _context;

    public TaxonomyController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Include(c => c.Roles)
            .Include(c => c.Skills)
            .ToListAsync();

        return Ok(categories.Select(c => new
        {
            id = c.Id,
            name = c.Name,
            slug = c.Slug,
            description = c.Description,
            icon = c.Icon,
            dynamicSchemaJson = c.DynamicSchemaJson,
            roles = c.Roles.Select(r => new { id = r.Id, name = r.Name, slug = r.Slug, description = r.Description }),
            skills = c.Skills.Select(s => new { id = s.Id, name = s.Name, slug = s.Slug })
        }));
    }

    [HttpGet("categories/{slug}")]
    public async Task<IActionResult> GetCategoryBySlug(string slug)
    {
        var category = await _context.Categories
            .Include(c => c.Roles)
            .Include(c => c.Skills)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (category == null) return NotFound();

        return Ok(new
        {
            id = category.Id,
            name = category.Name,
            slug = category.Slug,
            description = category.Description,
            icon = category.Icon,
            dynamicSchemaJson = category.DynamicSchemaJson,
            roles = category.Roles.Select(r => new { id = r.Id, name = r.Name, slug = r.Slug, description = r.Description }),
            skills = category.Skills.Select(s => new { id = s.Id, name = s.Name, slug = s.Slug })
        });
    }
}
