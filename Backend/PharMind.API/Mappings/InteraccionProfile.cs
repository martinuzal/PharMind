using AutoMapper;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Mappings;

public class InteraccionProfile : Profile
{
    public InteraccionProfile()
    {
        // Interaccion -> InteraccionDto
        CreateMap<Interaccion, InteraccionDto>()
            .ForMember(dest => dest.TipoInteraccionNombre, opt => opt.MapFrom(src => src.TipoInteraccionEsquema != null ? src.TipoInteraccionEsquema.Nombre : null))
            .ForMember(dest => dest.RelacionCodigo, opt => opt.MapFrom(src => src.Relacion != null ? src.Relacion.CodigoRelacion : null))
            .ForMember(dest => dest.AgenteNombre, opt => opt.MapFrom(src => src.Agente != null ? (src.Agente.Nombre + " " + src.Agente.Apellido) : null))
            .ForMember(dest => dest.ClienteNombre, opt => opt.MapFrom(src => src.Cliente != null ? src.Cliente.RazonSocial : null))
            .ForMember(dest => dest.DatosDinamicos, opt => opt.Ignore()) // Se mapea manualmente
            .ForMember(dest => dest.ProductosPromocionados, opt => opt.MapFrom(src => src.ProductosPromocionados))
            .ForMember(dest => dest.MuestrasEntregadas, opt => opt.MapFrom(src => src.MuestrasEntregadas))
            .ForMember(dest => dest.ProductosSolicitados, opt => opt.MapFrom(src => src.ProductosSolicitados));

        // CreateInteraccionDto -> Interaccion
        CreateMap<CreateInteraccionDto, Interaccion>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore())
            .ForMember(dest => dest.ProductosPromocionados, opt => opt.Ignore()) // Se manejan separadamente
            .ForMember(dest => dest.MuestrasEntregadas, opt => opt.Ignore())
            .ForMember(dest => dest.ProductosSolicitados, opt => opt.Ignore());

        // UpdateInteraccionDto -> Interaccion
        CreateMap<UpdateInteraccionDto, Interaccion>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoInteraccion, opt => opt.Ignore())
            .ForMember(dest => dest.TipoInteraccionId, opt => opt.Ignore())
            .ForMember(dest => dest.RelacionId, opt => opt.Ignore())
            .ForMember(dest => dest.AgenteId, opt => opt.Ignore())
            .ForMember(dest => dest.ClienteId, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore())
            .ForMember(dest => dest.ProductosPromocionados, opt => opt.Ignore())
            .ForMember(dest => dest.MuestrasEntregadas, opt => opt.Ignore())
            .ForMember(dest => dest.ProductosSolicitados, opt => opt.Ignore());

        // Productos de interacción
        CreateMap<InteraccionProductoPromocionado, InteraccionProductoDto>()
            .ForMember(dest => dest.ProductoNombre, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : null))
            .ForMember(dest => dest.ProductoCodigoProducto, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.CodigoProducto : null))
            .ForMember(dest => dest.ProductoPresentacion, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Presentacion : null));

        CreateMap<InteraccionMuestraEntregada, InteraccionProductoDto>()
            .ForMember(dest => dest.ProductoNombre, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : null))
            .ForMember(dest => dest.ProductoCodigoProducto, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.CodigoProducto : null))
            .ForMember(dest => dest.ProductoPresentacion, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Presentacion : null));

        CreateMap<InteraccionProductoSolicitado, InteraccionProductoSolicitadoDto>()
            .ForMember(dest => dest.ProductoNombre, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : null))
            .ForMember(dest => dest.ProductoCodigoProducto, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.CodigoProducto : null))
            .ForMember(dest => dest.ProductoPresentacion, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Presentacion : null));

        // DTOs -> Entities (para crear productos de interacción)
        CreateMap<CreateInteraccionProductoDto, InteraccionProductoPromocionado>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.InteraccionId, opt => opt.Ignore());

        CreateMap<CreateInteraccionProductoDto, InteraccionMuestraEntregada>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.InteraccionId, opt => opt.Ignore());

        CreateMap<CreateInteraccionProductoSolicitadoDto, InteraccionProductoSolicitado>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.InteraccionId, opt => opt.Ignore());
    }
}
