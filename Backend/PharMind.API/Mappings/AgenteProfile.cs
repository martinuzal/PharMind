using AutoMapper;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Mappings;

public class AgenteProfile : Profile
{
    public AgenteProfile()
    {
        // Agente -> AgenteDto
        CreateMap<Agente, AgenteDto>()
            .ForMember(dest => dest.TipoAgenteNombre, opt => opt.MapFrom(src => src.TipoAgente != null ? src.TipoAgente.Nombre : null))
            .ForMember(dest => dest.RegionNombre, opt => opt.MapFrom(src => src.Region != null ? src.Region.Nombre : null))
            .ForMember(dest => dest.DistritoNombre, opt => opt.MapFrom(src => src.Distrito != null ? src.Distrito.Nombre : null))
            .ForMember(dest => dest.LineaNegocioNombre, opt => opt.MapFrom(src => src.LineaNegocio != null ? src.LineaNegocio.Nombre : null))
            .ForMember(dest => dest.ManagerNombre, opt => opt.MapFrom(src => src.Manager != null ? (src.Manager.Nombre + " " + src.Manager.Apellido) : null))
            .ForMember(dest => dest.TimelineNombre, opt => opt.MapFrom(src => src.Timeline != null ? src.Timeline.Nombre : null))
            .ForMember(dest => dest.FechaIngreso, opt => opt.MapFrom(src => src.FechaIngreso.HasValue ? src.FechaIngreso.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null))
            .ForMember(dest => dest.DatosDinamicos, opt => opt.Ignore()); // Se mapea manualmente desde EntidadesDinamica

        // CreateAgenteDto -> Agente
        CreateMap<CreateAgenteDto, Agente>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => src.Activo ? "Activo" : "Inactivo"))
            .ForMember(dest => dest.FechaIngreso, opt => opt.MapFrom(src => src.FechaIngreso.HasValue ? DateOnly.FromDateTime(src.FechaIngreso.Value) : (DateOnly?)null))
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore())
            // Campos legacy que se ignoran
            .ForMember(dest => dest.CodigoDistrito, opt => opt.Ignore())
            .ForMember(dest => dest.DistritoNombre, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoLineaNegocio, opt => opt.Ignore())
            .ForMember(dest => dest.LineaNegocioNombre, opt => opt.Ignore())
            .ForMember(dest => dest.ZonaGeografica, opt => opt.Ignore())
            .ForMember(dest => dest.SupervisorId, opt => opt.Ignore());

        // UpdateAgenteDto -> Agente
        CreateMap<UpdateAgenteDto, Agente>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoAgente, opt => opt.Ignore())
            .ForMember(dest => dest.TipoAgenteId, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => src.Activo ? "Activo" : "Inactivo"))
            .ForMember(dest => dest.FechaIngreso, opt => opt.MapFrom(src => src.FechaIngreso.HasValue ? DateOnly.FromDateTime(src.FechaIngreso.Value) : (DateOnly?)null))
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore())
            // Campos legacy
            .ForMember(dest => dest.CodigoDistrito, opt => opt.Ignore())
            .ForMember(dest => dest.DistritoNombre, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoLineaNegocio, opt => opt.Ignore())
            .ForMember(dest => dest.LineaNegocioNombre, opt => opt.Ignore())
            .ForMember(dest => dest.ZonaGeografica, opt => opt.Ignore())
            .ForMember(dest => dest.SupervisorId, opt => opt.Ignore());
    }
}
