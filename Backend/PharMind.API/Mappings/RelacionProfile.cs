using AutoMapper;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Mappings;

public class RelacionProfile : Profile
{
    public RelacionProfile()
    {
        // Relacion -> RelacionDto
        CreateMap<Relacion, RelacionDto>()
            .ForMember(dest => dest.TipoRelacionNombre, opt => opt.MapFrom(src => src.TipoRelacionEsquema != null ? src.TipoRelacionEsquema.Nombre : null))
            .ForMember(dest => dest.AgenteNombre, opt => opt.MapFrom(src => src.Agente != null ? (src.Agente.Nombre + " " + src.Agente.Apellido) : string.Empty))
            .ForMember(dest => dest.ClientePrincipalNombre, opt => opt.MapFrom(src => src.ClientePrincipal != null ? src.ClientePrincipal.RazonSocial : string.Empty))
            .ForMember(dest => dest.ClienteSecundario1Nombre, opt => opt.MapFrom(src => src.ClienteSecundario1 != null ? src.ClienteSecundario1.RazonSocial : null))
            .ForMember(dest => dest.ClienteSecundario2Nombre, opt => opt.MapFrom(src => src.ClienteSecundario2 != null ? src.ClienteSecundario2.RazonSocial : null))
            .ForMember(dest => dest.DatosDinamicos, opt => opt.Ignore()) // Se mapea manualmente
            .ForMember(dest => dest.Frecuencia, opt => opt.Ignore()); // Se calcula manualmente

        // CreateRelacionDto -> Relacion
        CreateMap<CreateRelacionDto, Relacion>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore());

        // UpdateRelacionDto -> Relacion
        CreateMap<UpdateRelacionDto, Relacion>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoRelacion, opt => opt.Ignore())
            .ForMember(dest => dest.TipoRelacionId, opt => opt.Ignore())
            .ForMember(dest => dest.AgenteId, opt => opt.Ignore())
            .ForMember(dest => dest.ClientePrincipalId, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore());
    }
}
