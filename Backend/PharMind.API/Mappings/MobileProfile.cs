using AutoMapper;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Mappings;

public class MobileProfile : Profile
{
    public MobileProfile()
    {
        // ==================== RELACIÓN MOBILE ====================

        // Relacion -> RelacionMobileDto
        CreateMap<Relacion, RelacionMobileDto>()
            .ForMember(dest => dest.TipoRelacionNombre, opt => opt.MapFrom(src => src.TipoRelacionEsquema != null ? src.TipoRelacionEsquema.Nombre : string.Empty))
            .ForMember(dest => dest.TipoRelacionSubTipo, opt => opt.MapFrom(src => src.TipoRelacionEsquema != null ? src.TipoRelacionEsquema.SubTipo ?? string.Empty : string.Empty))
            .ForMember(dest => dest.TipoRelacionIcono, opt => opt.MapFrom(src => src.TipoRelacionEsquema != null ? src.TipoRelacionEsquema.Icono : null))
            .ForMember(dest => dest.TipoRelacionColor, opt => opt.MapFrom(src => src.TipoRelacionEsquema != null ? src.TipoRelacionEsquema.Color : null))
            .ForMember(dest => dest.TipoRelacionSchema, opt => opt.MapFrom(src => src.TipoRelacionEsquema != null ? src.TipoRelacionEsquema.Schema : null))
            .ForMember(dest => dest.AgenteNombre, opt => opt.MapFrom(src => src.Agente != null ? $"{src.Agente.Nombre} {src.Agente.Apellido}" : null))
            .ForMember(dest => dest.ClientePrincipalNombre, opt => opt.MapFrom(src => src.ClientePrincipal != null ? src.ClientePrincipal.RazonSocial : null))
            .ForMember(dest => dest.ClientePrincipalTelefono, opt => opt.MapFrom(src => src.ClientePrincipal != null ? src.ClientePrincipal.Telefono : null))
            .ForMember(dest => dest.ClientePrincipalEmail, opt => opt.MapFrom(src => src.ClientePrincipal != null ? src.ClientePrincipal.Email : null))
            .ForMember(dest => dest.ClientePrincipalEspecialidad, opt => opt.MapFrom(src => src.ClientePrincipal != null ? src.ClientePrincipal.Especialidad : null))
            .ForMember(dest => dest.ClienteSecundario1Nombre, opt => opt.MapFrom(src => src.ClienteSecundario1 != null ? src.ClienteSecundario1.RazonSocial : null))
            .ForMember(dest => dest.ClienteSecundario2Nombre, opt => opt.MapFrom(src => src.ClienteSecundario2 != null ? src.ClienteSecundario2.RazonSocial : null))
            .ForMember(dest => dest.TipoRelacion, opt => opt.MapFrom(src => src.TipoRelacionEsquema != null ? src.TipoRelacionEsquema.SubTipo : null))
            .ForMember(dest => dest.DatosDinamicos, opt => opt.Ignore()) // Se mapea manualmente
            .ForMember(dest => dest.Frecuencia, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.UltimaInteraccionFecha, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.UltimaInteraccionTipo, opt => opt.Ignore()); // Se calcula manualmente

        // CreateRelacionMobileDto -> Relacion
        CreateMap<CreateRelacionMobileDto, Relacion>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoRelacion, opt => opt.Ignore())
            .ForMember(dest => dest.FechaInicio, opt => opt.Ignore())
            .ForMember(dest => dest.Estado, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore());

        // UpdateRelacionMobileDto -> Relacion (actualización parcial)
        CreateMap<UpdateRelacionMobileDto, Relacion>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // ==================== INTERACCIÓN MOBILE ====================

        // Interaccion -> InteraccionMobileDto
        CreateMap<Interaccion, InteraccionMobileDto>()
            .ForMember(dest => dest.TipoInteraccionNombre, opt => opt.MapFrom(src => src.TipoInteraccionEsquema != null ? src.TipoInteraccionEsquema.Nombre : string.Empty))
            .ForMember(dest => dest.TipoInteraccionSubTipo, opt => opt.MapFrom(src => src.TipoInteraccionEsquema != null ? src.TipoInteraccionEsquema.SubTipo ?? string.Empty : string.Empty))
            .ForMember(dest => dest.TipoInteraccionIcono, opt => opt.MapFrom(src => src.TipoInteraccionEsquema != null ? src.TipoInteraccionEsquema.Icono : null))
            .ForMember(dest => dest.TipoInteraccionColor, opt => opt.MapFrom(src => src.TipoInteraccionEsquema != null ? src.TipoInteraccionEsquema.Color : null))
            .ForMember(dest => dest.AgenteNombre, opt => opt.MapFrom(src => src.Agente != null ? $"{src.Agente.Nombre} {src.Agente.Apellido}" : null))
            .ForMember(dest => dest.ClientePrincipalId, opt => opt.MapFrom(src => src.ClienteId))
            .ForMember(dest => dest.ClientePrincipalNombre, opt => opt.MapFrom(src => src.Cliente != null ? src.Cliente.RazonSocial : null))
            .ForMember(dest => dest.ClienteSecundario1Id, opt => opt.Ignore()) // No existe en Interaccion
            .ForMember(dest => dest.ClienteSecundario1Nombre, opt => opt.Ignore()) // No existe en Interaccion
            .ForMember(dest => dest.ResultadoVisita, opt => opt.MapFrom(src => src.Resultado))
            .ForMember(dest => dest.Latitud, opt => opt.MapFrom(src => (double?)src.Latitud))
            .ForMember(dest => dest.Longitud, opt => opt.MapFrom(src => (double?)src.Longitud))
            .ForMember(dest => dest.DireccionCapturada, opt => opt.MapFrom(src => src.Observaciones))
            .ForMember(dest => dest.DatosDinamicos, opt => opt.Ignore()) // Se mapea manualmente
            .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => "Completada"))
            .ForMember(dest => dest.Sincronizada, opt => opt.MapFrom(src => true));

        // CreateInteraccionMobileDto -> Interaccion
        CreateMap<CreateInteraccionMobileDto, Interaccion>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CodigoInteraccion, opt => opt.Ignore())
            .ForMember(dest => dest.TipoInteraccion, opt => opt.Ignore())
            .ForMember(dest => dest.ClienteId, opt => opt.MapFrom(src => src.ClientePrincipalId))
            .ForMember(dest => dest.Resultado, opt => opt.MapFrom(src => src.ResultadoVisita))
            .ForMember(dest => dest.Latitud, opt => opt.MapFrom(src => (decimal?)src.Latitud))
            .ForMember(dest => dest.Longitud, opt => opt.MapFrom(src => (decimal?)src.Longitud))
            .ForMember(dest => dest.Observaciones, opt => opt.MapFrom(src => src.DireccionCapturada))
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.EntidadDinamicaId, opt => opt.Ignore());

        // UpdateInteraccionMobileDto -> Interaccion (actualización parcial)
        CreateMap<UpdateInteraccionMobileDto, Interaccion>()
            .ForMember(dest => dest.Resultado, opt => opt.MapFrom(src => src.ResultadoVisita))
            .ForMember(dest => dest.Latitud, opt => opt.MapFrom(src => src.Latitud.HasValue ? (decimal?)src.Latitud : null))
            .ForMember(dest => dest.Longitud, opt => opt.MapFrom(src => src.Longitud.HasValue ? (decimal?)src.Longitud : null))
            .ForMember(dest => dest.Observaciones, opt => opt.MapFrom(src => src.DireccionCapturada))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // ==================== CLIENTE MOBILE ====================

        // Cliente -> ClienteMobileDto
        CreateMap<Cliente, ClienteMobileDto>()
            .ForMember(dest => dest.TipoClienteNombre, opt => opt.MapFrom(src => src.TipoCliente != null ? src.TipoCliente.Nombre : null))
            .ForMember(dest => dest.DireccionCompleta, opt => opt.MapFrom(src => src.Direccion != null ? $"{src.Direccion.Calle} {src.Direccion.Numero}, {src.Direccion.Ciudad}" : null))
            .ForMember(dest => dest.Ciudad, opt => opt.MapFrom(src => src.Direccion != null ? src.Direccion.Ciudad : null))
            .ForMember(dest => dest.Provincia, opt => opt.MapFrom(src => src.Direccion != null ? src.Direccion.Estado : null))
            .ForMember(dest => dest.InstitucionNombre, opt => opt.MapFrom(src => src.Institucion != null ? src.Institucion.RazonSocial : null))
            .ForMember(dest => dest.DatosDinamicos, opt => opt.Ignore()); // Se mapea manualmente

        // ==================== TIPOS (ESQUEMAS) MOBILE ====================

        // EsquemaPersonalizado -> TipoRelacionMobileDto
        CreateMap<EsquemasPersonalizado, TipoRelacionMobileDto>()
            .ForMember(dest => dest.SubTipo, opt => opt.MapFrom(src => src.SubTipo ?? string.Empty));

        // EsquemaPersonalizado -> TipoInteraccionMobileDto
        CreateMap<EsquemasPersonalizado, TipoInteraccionMobileDto>()
            .ForMember(dest => dest.SubTipo, opt => opt.MapFrom(src => src.SubTipo ?? string.Empty));

        // ==================== PRODUCTOS ====================

        // Producto -> ProductoDto
        CreateMap<Producto, ProductoDto>()
            .ForMember(dest => dest.LineaNegocioNombre, opt => opt.MapFrom(src => src.LineaNegocio != null ? src.LineaNegocio.Nombre : null));

        // CreateProductoDto -> Producto
        CreateMap<CreateProductoDto, Producto>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.FechaModificacion, opt => opt.Ignore())
            .ForMember(dest => dest.ModificadoPor, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.LineaNegocio, opt => opt.Ignore());

        // UpdateProductoDto -> Producto (actualización parcial)
        CreateMap<UpdateProductoDto, Producto>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // ==================== INVENTARIO ====================

        // InventarioAgente -> InventarioAgenteDto
        CreateMap<InventarioAgente, InventarioAgenteDto>()
            .ForMember(dest => dest.Producto, opt => opt.MapFrom(src => src.Producto))
            .ForMember(dest => dest.EstaPorVencer, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.EstaVencido, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.StockBajo, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.DiasParaVencer, opt => opt.Ignore()); // Se calcula manualmente

        // ==================== CITAS ====================

        // Cita -> CitaDto
        CreateMap<Cita, CitaDto>()
            .ForMember(dest => dest.AgenteNombre, opt => opt.MapFrom(src => src.Agente != null ? $"{src.Agente.Nombre} {src.Agente.Apellido}" : null))
            .ForMember(dest => dest.ClienteNombre, opt => opt.MapFrom(src => src.Cliente != null ? src.Cliente.RazonSocial : null))
            .ForMember(dest => dest.EsHoy, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.YaPaso, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.EnProgreso, opt => opt.Ignore()) // Se calcula manualmente
            .ForMember(dest => dest.DuracionMinutos, opt => opt.Ignore()); // Se calcula manualmente

        // ==================== PRODUCTOS DE INTERACCIÓN ====================

        // InteraccionMuestraEntregada -> InteraccionMuestraEntregadaDto
        CreateMap<InteraccionMuestraEntregada, InteraccionMuestraEntregadaDto>()
            .ForMember(dest => dest.ProductoNombre, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : null));

        // InteraccionProductoPromocionado -> InteraccionProductoPromocionadoDto
        CreateMap<InteraccionProductoPromocionado, InteraccionProductoPromocionadoDto>()
            .ForMember(dest => dest.ProductoNombre, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : null));

        // InteraccionProductoSolicitado -> InteraccionProductoSolicitadoMobileDto
        CreateMap<InteraccionProductoSolicitado, InteraccionProductoSolicitadoMobileDto>()
            .ForMember(dest => dest.ProductoNombre, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : null));

        // ==================== MOVIMIENTOS INVENTARIO ====================

        // MovimientoInventario -> MovimientoInventarioDto
        CreateMap<MovimientoInventario, MovimientoInventarioDto>();

        // ==================== TIEMPO UTILIZADO ====================

        // TiempoUtilizado -> TiempoUtilizadoDto
        CreateMap<TiempoUtilizado, TiempoUtilizadoDto>()
            .ForMember(dest => dest.TipoActividadNombre, opt => opt.MapFrom(src => src.TipoActividad != null ? src.TipoActividad.Nombre : null));

        // TipoActividad -> TipoActividadDto
        CreateMap<TipoActividad, TipoActividadDto>();
    }
}
