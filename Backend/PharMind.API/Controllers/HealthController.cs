using Microsoft.AspNetCore.Mvc;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Endpoint simple de health check
    /// GET /api/health
    /// </summary>
    [HttpGet]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            service = "PharMind API",
            version = "1.0.0"
        });
    }

    /// <summary>
    /// Endpoint de ping simple
    /// GET /api/health/ping
    /// </summary>
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "pong", timestamp = DateTime.UtcNow });
    }
}
