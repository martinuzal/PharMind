using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Interfaces;
using PharMind.API.Models;
using System.Text.Json;

namespace PharMind.API.Controllers.Base;

/// <summary>
/// Controlador base genérico para entidades híbridas (estáticas + dinámicas)
/// Implementa CRUD completo con soporte para esquemas personalizados y datos dinámicos
/// </summary>
[ApiController]
public abstract class BaseHybridEntityController<TEntity, TDto, TCreateDto, TUpdateDto, TListResponse> : ControllerBase
    where TEntity : class, IHybridEntity, new()
    where TDto : class, IHybridDto
    where TCreateDto : class, ICreateHybridDto
    where TUpdateDto : class, IUpdateHybridDto
    where TListResponse : class, IListResponse<TDto>, new()
{
    protected readonly PharMindDbContext _context;
    protected readonly ILogger _logger;

    protected BaseHybridEntityController(PharMindDbContext context, ILogger logger)
    {
        _context = context;
        _logger = logger;
    }

    // Métodos abstractos que deben ser implementados por las clases derivadas
    protected abstract DbSet<TEntity> GetDbSet();
    protected abstract string GetEntidadTipo();
    protected abstract string GetEntityName();
    protected abstract IQueryable<TEntity> IncludeRelatedEntities(IQueryable<TEntity> query);
    protected abstract TDto MapToDto(TEntity entity);
    protected abstract void MapCreateDtoToEntity(TCreateDto dto, TEntity entity, string? entidadDinamicaId);
    protected abstract void MapUpdateDtoToEntity(TUpdateDto dto, TEntity entity);
    protected abstract IQueryable<TEntity> ApplyOrdering(IQueryable<TEntity> query);
    protected abstract Task<ActionResult<TDto>?> ValidateCreateDto(TCreateDto dto);
    protected abstract Task<ActionResult<TDto>?> ValidateUpdateDto(string id, TUpdateDto dto);

    /// <summary>
    /// Obtiene una lista paginada de entidades
    /// </summary>
    [HttpGet]
    public virtual async Task<ActionResult<TListResponse>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? tipoEntidadId = null)
    {
        try
        {
            var query = GetDbSet().Where(e => e.Status == false);
            query = IncludeRelatedEntities(query);

            // Filtrar por tipo si se especifica
            if (!string.IsNullOrWhiteSpace(tipoEntidadId))
            {
                query = FilterByTipoEntidad(query, tipoEntidadId);
            }

            // Contar total de items
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Aplicar paginación
            query = ApplyOrdering(query);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear a DTOs
            var itemDtos = items.Select(e => MapToDto(e)).ToList();

            var response = new TListResponse
            {
                Items = itemDtos,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener lista de {EntityName}", GetEntityName());
            return StatusCode(500, new { message = $"Error al obtener la lista de {GetEntityName()}" });
        }
    }

    /// <summary>
    /// Obtiene una entidad por ID
    /// </summary>
    [HttpGet("{id}")]
    public virtual async Task<ActionResult<TDto>> GetById(string id)
    {
        try
        {
            var query = GetDbSet().Where(e => e.Id == id && e.Status == false);
            query = IncludeRelatedEntities(query);
            var entity = await query.FirstOrDefaultAsync();

            if (entity == null)
            {
                return NotFound(new { message = $"{GetEntityName()} no encontrado" });
            }

            var dto = MapToDto(entity);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener {EntityName} con ID: {Id}", GetEntityName(), id);
            return StatusCode(500, new { message = $"Error al obtener {GetEntityName()}" });
        }
    }

    /// <summary>
    /// Crea una nueva entidad
    /// </summary>
    [HttpPost]
    public virtual async Task<ActionResult<TDto>> Create(TCreateDto dto)
    {
        try
        {
            // Validaciones personalizadas
            var validationError = await ValidateCreateDto(dto);
            if (validationError != null)
            {
                return validationError;
            }

            // Validar que el tipo de entidad existe
            var tipoEntidad = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == dto.TipoEntidadId
                    && e.EntidadTipo == GetEntidadTipo()
                    && e.Status == false);

            if (tipoEntidad == null)
            {
                return BadRequest(new { message = $"Tipo de {GetEntityName()} no encontrado" });
            }

            // Crear EntidadesDinamica si hay datos dinámicos
            string? entidadDinamicaId = null;
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                var EntidadesDinamica = new EntidadesDinamica
                {
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoEntidadId,
                    Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                    Status = false,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System"
                };

                _context.EntidadesDinamicas.Add(EntidadesDinamica);
                entidadDinamicaId = EntidadesDinamica.Id;
            }

            // Crear entidad principal
            var entity = new TEntity
            {
                Id = Guid.NewGuid().ToString(),
                EntidadDinamicaId = entidadDinamicaId,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "System"
            };

            // Mapear campos específicos
            MapCreateDtoToEntity(dto, entity, entidadDinamicaId);

            GetDbSet().Add(entity);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            var query = GetDbSet().Where(e => e.Id == entity.Id);
            query = IncludeRelatedEntities(query);
            var reloadedEntity = await query.FirstAsync();

            var result = MapToDto(reloadedEntity);

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear {EntityName}", GetEntityName());
            return StatusCode(500, new { message = $"Error al crear {GetEntityName()}" });
        }
    }

    /// <summary>
    /// Actualiza una entidad existente
    /// </summary>
    [HttpPut("{id}")]
    public virtual async Task<ActionResult<TDto>> Update(string id, TUpdateDto dto)
    {
        try
        {
            // Validaciones personalizadas
            var validationError = await ValidateUpdateDto(id, dto);
            if (validationError != null)
            {
                return validationError;
            }

            var query = GetDbSet().Where(e => e.Id == id && e.Status == false);
            query = IncludeRelatedEntities(query);
            var entity = await query.FirstOrDefaultAsync();

            if (entity == null)
            {
                return NotFound(new { message = $"{GetEntityName()} no encontrado" });
            }

            // Actualizar o crear EntidadesDinamica
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (!string.IsNullOrWhiteSpace(entity.EntidadDinamicaId))
                {
                    // Actualizar entidad dinámica existente
                    var EntidadesDinamica = await _context.EntidadesDinamicas.FindAsync(entity.EntidadDinamicaId);
                    if (EntidadesDinamica != null)
                    {
                        EntidadesDinamica.Datos = JsonSerializer.Serialize(dto.DatosDinamicos);
                        EntidadesDinamica.FechaModificacion = DateTime.Now;
                        EntidadesDinamica.ModificadoPor = "System";
                    }
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var nuevaEntidadDinamica = new EntidadesDinamica
                    {
                        Id = Guid.NewGuid().ToString(),
                        EsquemaId = GetTipoEntidadId(entity),
                        Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                        Status = false,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "System"
                    };

                    _context.EntidadesDinamicas.Add(nuevaEntidadDinamica);
                    entity.EntidadDinamicaId = nuevaEntidadDinamica.Id;
                }
            }

            // Actualizar campos específicos
            MapUpdateDtoToEntity(dto, entity);

            // Actualizar campos de auditoría
            entity.FechaModificacion = DateTime.Now;
            entity.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            var reloadQuery = GetDbSet().Where(e => e.Id == id);
            reloadQuery = IncludeRelatedEntities(reloadQuery);
            var reloadedEntity = await reloadQuery.FirstAsync();

            var result = MapToDto(reloadedEntity);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar {EntityName} con ID: {Id}", GetEntityName(), id);
            return StatusCode(500, new { message = $"Error al actualizar {GetEntityName()}" });
        }
    }

    /// <summary>
    /// Elimina (soft delete) una entidad
    /// </summary>
    [HttpDelete("{id}")]
    public virtual async Task<ActionResult> Delete(string id)
    {
        try
        {
            var entity = await GetDbSet().FindAsync(id);

            if (entity == null || entity.Status == true)
            {
                return NotFound(new { message = $"{GetEntityName()} no encontrado" });
            }

            // Soft delete
            entity.Status = true;
            entity.FechaModificacion = DateTime.Now;
            entity.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            return Ok(new { message = $"{GetEntityName()} eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar {EntityName} con ID: {Id}", GetEntityName(), id);
            return StatusCode(500, new { message = $"Error al eliminar {GetEntityName()}" });
        }
    }

    // Métodos helper protegidos

    /// <summary>
    /// Filtra query por tipo de entidad
    /// </summary>
    protected virtual IQueryable<TEntity> FilterByTipoEntidad(IQueryable<TEntity> query, string tipoEntidadId)
    {
        // Implementación por defecto - las clases derivadas pueden sobrescribir
        return query;
    }

    /// <summary>
    /// Obtiene el ID del tipo de entidad (esquema)
    /// </summary>
    protected virtual string GetTipoEntidadId(TEntity entity)
    {
        // Las clases derivadas deben sobrescribir si necesitan obtener el TipoEntidadId
        return string.Empty;
    }

    /// <summary>
    /// Deserializa datos dinámicos de JSON
    /// </summary>
    protected Dictionary<string, object?>? DeserializeDynamicData(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            return JsonSerializer.Deserialize<Dictionary<string, object?>>(json, options);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error al deserializar datos dinámicos");
            return null;
        }
    }
}
