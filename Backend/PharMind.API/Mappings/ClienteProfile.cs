using AutoMapper;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Mappings;

public class ClienteProfile : Profile
{
    public ClienteProfile()
    {
        // Cliente -> ClienteDto
        CreateMap<Cliente, ClienteDto>()
            .ForMember(dest => dest.TipoClienteNombre, opt => opt.MapFrom(src => src.TipoCliente != null ? src.TipoCliente.Nombre : null))
            .ForMember(dest => dest.InstitucionNombre, opt => opt.MapFrom(src => src.Institucion != null ? src.Institucion.RazonSocial : null))
            .ForMember(dest => dest.Direccion, opt => opt.MapFrom(src => src.Direccion))
            .ForMember(dest => dest.DatosDinamicos, opt => opt.Ignore()) // Se mapea manualmente desde EntidadesDinamica
            .ForMember(dest => dest.CodigoAudit, opt => opt.MapFrom(src => src.CodigoAudit));

        // CreateClienteDto -> Cliente
        CreateMap<CreateClienteDto, Cliente>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoAudit, opt => opt.MapFrom(src => src.CodigoAudit));

        // UpdateClienteDto -> Cliente (solo campos modificables)
        CreateMap<UpdateClienteDto, Cliente>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoCliente, opt => opt.Ignore())
            .ForMember(dest => dest.TipoClienteId, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoAudit, opt => opt.MapFrom(src => src.CodigoAudit));

        // Direccione -> DireccionDto
        CreateMap<Direccione, DireccionDto>()
            .ForMember(dest => dest.Provincia, opt => opt.MapFrom(src => src.Estado));
    }
}
