using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models;
using System.Text.Json;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EntidadesDinamicasController : ControllerBase
{
    private readonly PharMindDbContext _context;

    public EntidadesDinamicasController(PharMindDbContext context)
    {
        _context = context;
    }

    // GET: api/EntidadesDinamicas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EntidadDinamica>>> GetEntidadesDinamicas()
    {
        return await _context.EntidadesDinamicas
            .Include(e => e.Esquema)
            .ToListAsync();
    }

    // GET: api/EntidadesDinamicas/esquema/{esquemaId}
    [HttpGet("esquema/{esquemaId}")]
    public async Task<ActionResult<IEnumerable<EntidadDinamica>>> GetEntidadesByEsquema(string esquemaId)
    {
        var entidades = await _context.EntidadesDinamicas
            .Include(e => e.Esquema)
            .Where(e => e.EsquemaId == esquemaId)
            .ToListAsync();

        return entidades;
    }

    // GET: api/EntidadesDinamicas/tipo/{entidadTipo}/subtipo/{subTipo}
    [HttpGet("tipo/{entidadTipo}/subtipo/{subTipo}")]
    public async Task<ActionResult<IEnumerable<EntidadDinamica>>> GetEntidadesByTipoSubTipo(string entidadTipo, string subTipo)
    {
        var entidades = await _context.EntidadesDinamicas
            .Include(e => e.Esquema)
            .Where(e => e.Esquema!.EntidadTipo == entidadTipo && e.Esquema.SubTipo == subTipo)
            .ToListAsync();

        return entidades;
    }

    // GET: api/EntidadesDinamicas/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<EntidadDinamica>> GetEntidadDinamica(string id)
    {
        var entidad = await _context.EntidadesDinamicas
            .Include(e => e.Esquema)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entidad == null)
        {
            return NotFound();
        }

        return entidad;
    }

    // POST: api/EntidadesDinamicas
    [HttpPost]
    public async Task<ActionResult<EntidadDinamica>> PostEntidadDinamica(EntidadDinamica entidad)
    {
        // Generar ID si no existe
        if (string.IsNullOrEmpty(entidad.Id))
        {
            entidad.Id = Guid.NewGuid().ToString();
        }

        // Establecer fechas
        entidad.FechaCreacion = DateTime.UtcNow;

        // Validar que el esquema existe
        var esquema = await _context.EsquemasPersonalizados.FindAsync(entidad.EsquemaId);
        if (esquema == null)
        {
            return BadRequest("El esquema especificado no existe");
        }

        // Procesar campos de tipo 'address' del esquema
        await ProcessAddressFields(entidad, esquema);

        _context.EntidadesDinamicas.Add(entidad);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEntidadDinamica), new { id = entidad.Id }, entidad);
    }

    // PUT: api/EntidadesDinamicas/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEntidadDinamica(string id, EntidadDinamica entidad)
    {
        if (id != entidad.Id)
        {
            return BadRequest();
        }

        var existingEntidad = await _context.EntidadesDinamicas
            .Include(e => e.Esquema)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (existingEntidad == null)
        {
            return NotFound();
        }

        // Procesar campos de tipo 'address' del esquema
        await ProcessAddressFields(entidad, existingEntidad.Esquema!);

        // Actualizar campos
        existingEntidad.Datos = entidad.Datos;
        existingEntidad.Estado = entidad.Estado;
        existingEntidad.Tags = entidad.Tags;
        existingEntidad.FechaModificacion = DateTime.UtcNow;
        existingEntidad.ModificadoPor = entidad.ModificadoPor;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EntidadDinamicaExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/EntidadesDinamicas/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEntidadDinamica(string id)
    {
        var entidad = await _context.EntidadesDinamicas.FindAsync(id);
        if (entidad == null)
        {
            return NotFound();
        }

        _context.EntidadesDinamicas.Remove(entidad);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH: api/EntidadesDinamicas/{id}/estado
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> UpdateEstado(string id, [FromQuery] string estado)
    {
        var entidad = await _context.EntidadesDinamicas.FindAsync(id);
        if (entidad == null)
        {
            return NotFound();
        }

        entidad.Estado = estado;
        entidad.FechaModificacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EntidadDinamicaExists(string id)
    {
        return _context.EntidadesDinamicas.Any(e => e.Id == id);
    }

    private async Task ProcessAddressFields(EntidadDinamica entidad, EsquemaPersonalizado esquema)
    {
        // Parsear el esquema para encontrar campos de tipo 'address'
        var schemaJson = JsonSerializer.Deserialize<JsonElement>(esquema.Schema);
        if (!schemaJson.TryGetProperty("fields", out var fieldsArray))
        {
            return;
        }

        // Parsear los datos de la entidad
        var datosJson = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(entidad.Datos);
        if (datosJson == null)
        {
            return;
        }

        bool datosModificados = false;

        // Recorrer los campos del esquema
        foreach (var field in fieldsArray.EnumerateArray())
        {
            if (field.TryGetProperty("type", out var typeProperty) &&
                typeProperty.GetString() == "address" &&
                field.TryGetProperty("name", out var nameProperty))
            {
                var fieldName = nameProperty.GetString();
                if (string.IsNullOrEmpty(fieldName))
                {
                    continue;
                }

                // Verificar si hay datos de dirección para este campo
                if (datosJson.TryGetValue(fieldName, out var addressData) && addressData.ValueKind == JsonValueKind.Object)
                {
                    // Crear un objeto Direccion desde el JSON
                    var direccion = new Direccion
                    {
                        Id = Guid.NewGuid().ToString(),
                        FechaCreacion = DateTime.UtcNow
                    };

                    // Mapear los campos del JSON a la entidad Direccion
                    if (addressData.TryGetProperty("calle", out var calle)) direccion.Calle = calle.GetString();
                    if (addressData.TryGetProperty("numero", out var numero)) direccion.Numero = numero.GetString();
                    if (addressData.TryGetProperty("apartamento", out var apartamento)) direccion.Apartamento = apartamento.GetString();
                    if (addressData.TryGetProperty("colonia", out var colonia)) direccion.Colonia = colonia.GetString();
                    if (addressData.TryGetProperty("ciudad", out var ciudad)) direccion.Ciudad = ciudad.GetString();
                    if (addressData.TryGetProperty("estado", out var estado)) direccion.Estado = estado.GetString();
                    if (addressData.TryGetProperty("codigoPostal", out var codigoPostal)) direccion.CodigoPostal = codigoPostal.GetString();
                    if (addressData.TryGetProperty("pais", out var pais)) direccion.Pais = pais.GetString();
                    if (addressData.TryGetProperty("referencia", out var referencia)) direccion.Referencia = referencia.GetString();

                    // Procesar campos opcionales de geolocalización
                    if (addressData.TryGetProperty("latitud", out var latitud) && !string.IsNullOrEmpty(latitud.GetString()))
                    {
                        if (decimal.TryParse(latitud.GetString(), out var latitudValue))
                        {
                            direccion.Latitud = latitudValue;
                        }
                    }

                    if (addressData.TryGetProperty("longitud", out var longitud) && !string.IsNullOrEmpty(longitud.GetString()))
                    {
                        if (decimal.TryParse(longitud.GetString(), out var longitudValue))
                        {
                            direccion.Longitud = longitudValue;
                        }
                    }

                    // Guardar la dirección en la base de datos
                    _context.Direcciones.Add(direccion);
                    await _context.SaveChangesAsync();

                    // Reemplazar el objeto de dirección con solo el ID en el JSON
                    datosJson[fieldName] = JsonSerializer.SerializeToElement(direccion.Id);
                    datosModificados = true;
                }
            }
        }

        // Si se modificaron los datos, actualizar el JSON
        if (datosModificados)
        {
            entidad.Datos = JsonSerializer.Serialize(datosJson);
        }
    }
}
