using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UbicacionesController : ControllerBase
{
    private readonly PharMindDbContext _context;

    public UbicacionesController(PharMindDbContext context)
    {
        _context = context;
    }

    // PAISES
    [HttpGet("paises")]
    public async Task<ActionResult<IEnumerable<Pais>>> GetPaises()
    {
        return await _context.Paises
            .Where(p => p.Activo)
            .OrderBy(p => p.Nombre)
            .ToListAsync();
    }

    [HttpGet("paises/{id}")]
    public async Task<ActionResult<Pais>> GetPais(string id)
    {
        var pais = await _context.Paises.FindAsync(id);
        if (pais == null)
        {
            return NotFound();
        }
        return pais;
    }

    [HttpPost("paises")]
    public async Task<ActionResult<Pais>> PostPais(Pais pais)
    {
        if (string.IsNullOrEmpty(pais.Id))
        {
            pais.Id = Guid.NewGuid().ToString();
        }
        pais.FechaCreacion = DateTime.UtcNow;

        _context.Paises.Add(pais);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPais), new { id = pais.Id }, pais);
    }

    // ESTADOS
    [HttpGet("estados")]
    public async Task<ActionResult<IEnumerable<Estado>>> GetEstados([FromQuery] string? paisId = null)
    {
        var query = _context.Estados
            .Include(e => e.Pais)
            .Where(e => e.Activo);

        if (!string.IsNullOrEmpty(paisId))
        {
            query = query.Where(e => e.PaisId == paisId);
        }

        return await query.OrderBy(e => e.Nombre).ToListAsync();
    }

    [HttpGet("estados/{id}")]
    public async Task<ActionResult<Estado>> GetEstado(string id)
    {
        var estado = await _context.Estados
            .Include(e => e.Pais)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (estado == null)
        {
            return NotFound();
        }
        return estado;
    }

    [HttpPost("estados")]
    public async Task<ActionResult<Estado>> PostEstado(Estado estado)
    {
        if (string.IsNullOrEmpty(estado.Id))
        {
            estado.Id = Guid.NewGuid().ToString();
        }
        estado.FechaCreacion = DateTime.UtcNow;

        _context.Estados.Add(estado);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEstado), new { id = estado.Id }, estado);
    }

    // CIUDADES
    [HttpGet("ciudades")]
    public async Task<ActionResult<IEnumerable<Ciudad>>> GetCiudades([FromQuery] string? estadoId = null)
    {
        var query = _context.Ciudades
            .Include(c => c.Estado)
                .ThenInclude(e => e!.Pais)
            .Where(c => c.Activo);

        if (!string.IsNullOrEmpty(estadoId))
        {
            query = query.Where(c => c.EstadoId == estadoId);
        }

        return await query.OrderBy(c => c.Nombre).ToListAsync();
    }

    [HttpGet("ciudades/{id}")]
    public async Task<ActionResult<Ciudad>> GetCiudad(string id)
    {
        var ciudad = await _context.Ciudades
            .Include(c => c.Estado)
                .ThenInclude(e => e!.Pais)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (ciudad == null)
        {
            return NotFound();
        }
        return ciudad;
    }

    [HttpPost("ciudades")]
    public async Task<ActionResult<Ciudad>> PostCiudad(Ciudad ciudad)
    {
        if (string.IsNullOrEmpty(ciudad.Id))
        {
            ciudad.Id = Guid.NewGuid().ToString();
        }
        ciudad.FechaCreacion = DateTime.UtcNow;

        _context.Ciudades.Add(ciudad);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCiudad), new { id = ciudad.Id }, ciudad);
    }

    // CALLES
    [HttpGet("calles")]
    public async Task<ActionResult<IEnumerable<Calle>>> GetCalles([FromQuery] string? ciudadId = null)
    {
        var query = _context.Calles
            .Include(c => c.Ciudad)
                .ThenInclude(c => c!.Estado)
                    .ThenInclude(e => e!.Pais)
            .Where(c => c.Activo);

        if (!string.IsNullOrEmpty(ciudadId))
        {
            query = query.Where(c => c.CiudadId == ciudadId);
        }

        return await query.OrderBy(c => c.Nombre).ToListAsync();
    }

    [HttpGet("calles/{id}")]
    public async Task<ActionResult<Calle>> GetCalle(string id)
    {
        var calle = await _context.Calles
            .Include(c => c.Ciudad)
                .ThenInclude(c => c!.Estado)
                    .ThenInclude(e => e!.Pais)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (calle == null)
        {
            return NotFound();
        }
        return calle;
    }

    [HttpPost("calles")]
    public async Task<ActionResult<Calle>> PostCalle(Calle calle)
    {
        if (string.IsNullOrEmpty(calle.Id))
        {
            calle.Id = Guid.NewGuid().ToString();
        }
        calle.FechaCreacion = DateTime.UtcNow;

        _context.Calles.Add(calle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCalle), new { id = calle.Id }, calle);
    }
}
