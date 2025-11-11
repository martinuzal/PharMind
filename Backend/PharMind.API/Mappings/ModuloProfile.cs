using AutoMapper;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Mappings;

public class ModuloProfile : Profile
{
    public ModuloProfile()
    {
        // Modulo -> ModuloDto
        CreateMap<Modulo, ModuloDto>()
            .ForMember(dest => dest.Orden, opt => opt.MapFrom(src => src.OrdenMenu))
            .ForMember(dest => dest.SubModulos, opt => opt.Ignore()); // Se mapea manualmente (recursivo)

        // CreateModuloDto -> Modulo
        CreateMap<CreateModuloDto, Modulo>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrdenMenu, opt => opt.MapFrom(src => src.Orden))
            .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.Codigo, opt => opt.Ignore())
            .ForMember(dest => dest.InverseModuloPadre, opt => opt.Ignore())
            .ForMember(dest => dest.ModuloPadre, opt => opt.Ignore())
            .ForMember(dest => dest.RolModulos, opt => opt.Ignore())
            .ForMember(dest => dest.RolesModulos, opt => opt.Ignore());

        // UpdateModuloDto -> Modulo (solo campos modificables)
        CreateMap<UpdateModuloDto, Modulo>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrdenMenu, opt => opt.MapFrom(src => src.Orden))
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.Codigo, opt => opt.Ignore())
            .ForMember(dest => dest.InverseModuloPadre, opt => opt.Ignore())
            .ForMember(dest => dest.ModuloPadre, opt => opt.Ignore())
            .ForMember(dest => dest.RolModulos, opt => opt.Ignore())
            .ForMember(dest => dest.RolesModulos, opt => opt.Ignore());

        // Modulo -> ModuloConPermisosDto
        CreateMap<Modulo, ModuloConPermisosDto>()
            .ForMember(dest => dest.PuedeVer, opt => opt.Ignore()) // Se asigna manualmente según permisos
            .ForMember(dest => dest.PuedeCrear, opt => opt.Ignore()) // Se asigna manualmente según permisos
            .ForMember(dest => dest.PuedeEditar, opt => opt.Ignore()) // Se asigna manualmente según permisos
            .ForMember(dest => dest.PuedeEliminar, opt => opt.Ignore()) // Se asigna manualmente según permisos
            .ForMember(dest => dest.SubModulos, opt => opt.Ignore()); // Se mapea manualmente (recursivo)
    }
}
