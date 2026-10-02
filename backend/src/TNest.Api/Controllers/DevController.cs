using TNest.Application.Common.Interfaces;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace TNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DevController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _hasher;
    private readonly IHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public DevController(AppDbContext context, IPasswordHasher hasher, IHostEnvironment env, IConfiguration configuration)
    {
        _context = context;
        _hasher = hasher;
        _env = env;
        _configuration = configuration;
    }

    [HttpPost("reseed")]
    public async Task<IActionResult> ReseedDatabase([FromHeader(Name = "X-Dev-Secret")] string? devSecret = null)
    {
        var configuredSecret = _configuration["Security:DevSecretKey"];
        // Only allow in Development OR with valid developer secret key
        if (!_env.IsDevelopment() && (string.IsNullOrEmpty(devSecret) || devSecret != configuredSecret))
        {
            return Forbid("Dev endpoints are restricted and protected against unauthorized production access.");
        }
        // Clear old transactional data
        _context.Reviews.RemoveRange(_context.Reviews);
        _context.ProjectDeliveries.RemoveRange(_context.ProjectDeliveries);
        _context.Projects.RemoveRange(_context.Projects);
        _context.ChatMessages.RemoveRange(_context.ChatMessages);
        _context.Conversations.RemoveRange(_context.Conversations);
        _context.Inquiries.RemoveRange(_context.Inquiries);
        _context.Proposals.RemoveRange(_context.Proposals);
        _context.Requirements.RemoveRange(_context.Requirements);
        _context.PortfolioItems.RemoveRange(_context.PortfolioItems);
        _context.ProfessionalSkills.RemoveRange(_context.ProfessionalSkills);
        _context.ProfessionalRoles.RemoveRange(_context.ProfessionalRoles);
        _context.ProfessionalProfiles.RemoveRange(_context.ProfessionalProfiles);
        _context.ClientProfiles.RemoveRange(_context.ClientProfiles);
        _context.Users.RemoveRange(_context.Users);
        await _context.SaveChangesAsync();

        // Run full seeder
        await DbInitializer.InitializeAsync(_context, _hasher);

        var doersCount = await _context.ProfessionalProfiles.CountAsync();
        var tasksCount = await _context.Requirements.CountAsync();
        var usersCount = await _context.Users.CountAsync();

        return Ok(new
        {
            success = true,
            message = "Database cleaned and reseeded with 100 Doers and 75 Tasks successfully.",
            doersCount,
            tasksCount,
            usersCount
        });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var doersCount = await _context.ProfessionalProfiles.CountAsync();
        var tasksCount = await _context.Requirements.CountAsync();
        var usersCount = await _context.Users.CountAsync();

        return Ok(new
        {
            doersCount,
            tasksCount,
            usersCount
        });
    }
}
