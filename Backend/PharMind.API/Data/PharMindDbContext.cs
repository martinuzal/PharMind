using Microsoft.EntityFrameworkCore;
using PharMind.API.Models;
using PharMind.API.Models.Analytics;

namespace PharMind.API.Data;

public class PharMindDbContext : DbContext
{
    public PharMindDbContext(DbContextOptions<PharMindDbContext> options) : base(options)
    {
    }

    public DbSet<Empresa> Empresas { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Rol> Roles { get; set; }
    public DbSet<Modulo> Modulos { get; set; }
    public DbSet<UsuarioRol> UsuarioRoles { get; set; }
    public DbSet<RolModulo> RolModulos { get; set; }
    public DbSet<EsquemasPersonalizado> EsquemasPersonalizados { get; set; }
    public DbSet<EntidadesDinamica> EntidadesDinamicas { get; set; }
    public DbSet<TablaMaestra> TablasMaestras { get; set; }
    public DbSet<Direccione> Direcciones { get; set; }
    public DbSet<Pais> Paises { get; set; }
    public DbSet<Estado> Estados { get; set; }
    public DbSet<Ciudad> Ciudades { get; set; }
    public DbSet<Calle> Calles { get; set; }
    public DbSet<TiempoUtilizado> TiempoUtilizado { get; set; }
    public DbSet<TipoActividad> TiposActividad { get; set; }

    // Agentes DbSets
    // Apuntando a la entidad LineasNegocio (plural) en lugar de LineaNegocio (singular)
    public DbSet<LineasNegocio> LineasNegocio { get; set; }
    public DbSet<Regiones> Regiones { get; set; }
    public DbSet<Distrito> Distritos { get; set; }
    public DbSet<Agente> Agentes { get; set; }
    public DbSet<Manager> Managers { get; set; }
    public DbSet<ManagerRegione> ManagerRegiones { get; set; }
    public DbSet<ManagerDistrito> ManagerDistritos { get; set; }
    public DbSet<ManagerLineasNegocio> ManagerLineasNegocio { get; set; }

    // CRM DbSets
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Relacion> Relaciones { get; set; }
    public DbSet<Interaccion> Interacciones { get; set; }
    public DbSet<AuditoriaAgente> AuditoriasAgentes { get; set; }

    // Analytics DbSets
    public DbSet<Models.Analytics.AnalyticsMedico> AnalyticsMedicos { get; set; }
    public DbSet<Models.Analytics.AnalyticsRepresentante> AnalyticsRepresentantes { get; set; }
    public DbSet<Models.Analytics.AnalyticsVisita> AnalyticsVisitas { get; set; }
    public DbSet<Models.Analytics.AnalyticsProducto> AnalyticsProductos { get; set; }
    public DbSet<Models.Analytics.AnalyticsObjetivo> AnalyticsObjetivos { get; set; }

    // Audit DbSets (Auditoría de Prescripciones)
    public DbSet<AuditMercado> AuditMercados { get; set; }
    public DbSet<AuditCategory> AuditCategories { get; set; }
    public DbSet<AuditCustomer> AuditCustomers { get; set; }
    public DbSet<AuditPeriod> AuditPeriods { get; set; }
    public DbSet<AuditProductClass> AuditProductClasses { get; set; }
    public DbSet<AuditMarketMarca> AuditMarketMarcas { get; set; }

    // Process Logs
    public DbSet<ProcessLog> ProcessLogs { get; set; }

    // Timelines y Períodos
    public DbSet<Timeline> Timelines { get; set; }
    public DbSet<Period> Periods { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Ignorar entidad Role (en inglés) ANTES de llamar a base para evitar que se configure
        modelBuilder.Ignore<Role>();

        base.OnModelCreating(modelBuilder);

        // Configuración de índices únicos
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Empresa>()
            .HasIndex(e => e.Cuit)
            .IsUnique();

        modelBuilder.Entity<EsquemasPersonalizado>()
            .HasIndex(e => new { e.EmpresaId, e.EntidadTipo, e.SubTipo })
            .IsUnique();

        // Configuración de relaciones
        modelBuilder.Entity<UsuarioRol>()
            .HasOne(ur => ur.Usuario)
            .WithMany(u => u.UsuarioRoles)
            .HasForeignKey(ur => ur.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UsuarioRol>()
            .HasOne(ur => ur.Rol)
            .WithMany(r => r.UsuarioRols)
            .HasForeignKey(ur => ur.RolId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RolModulo>()
            .HasOne(rm => rm.Rol)
            .WithMany(r => r.RolModulos)
            .HasForeignKey(rm => rm.RolId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolModulo>()
            .HasOne(rm => rm.Modulo)
            .WithMany(m => m.RolModulos)
            .HasForeignKey(rm => rm.ModuloId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Modulo>()
            .HasOne(m => m.ModuloPadre)
            .WithMany(m => m.InverseModuloPadre)
            .HasForeignKey(m => m.ModuloPadreId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de relaciones para Distritos
        modelBuilder.Entity<Distrito>()
            .HasOne(d => d.Region)
            .WithMany(r => r.Distritos)
            .HasForeignKey(d => d.RegionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relaciones muchos-a-muchos para Managers
        modelBuilder.Entity<ManagerRegione>()
            .HasOne(mr => mr.Manager)
            .WithMany(m => m.ManagerRegiones)
            .HasForeignKey(mr => mr.ManagerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ManagerRegione>()
            .HasOne(mr => mr.Region)
            .WithMany(r => r.ManagerRegiones)
            .HasForeignKey(mr => mr.RegionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ManagerDistrito>()
            .HasOne(md => md.Manager)
            .WithMany(m => m.ManagerDistritos)
            .HasForeignKey(md => md.ManagerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ManagerDistrito>()
            .HasOne(md => md.Distrito)
            .WithMany(d => d.ManagerDistritos)
            .HasForeignKey(md => md.DistritoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ManagerLineasNegocio>()
            .HasOne(mln => mln.Manager)
            .WithMany(m => m.ManagerLineasNegocio)
            .HasForeignKey(mln => mln.ManagerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ManagerLineasNegocio>()
            .HasOne(mln => mln.LineaNegocio)
            .WithMany(ln => ln.ManagerLineasNegocios)
            .HasForeignKey(mln => mln.LineaNegocioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configuración de relaciones para Agente
        modelBuilder.Entity<Agente>()
            .HasOne(a => a.LineaNegocio)
            .WithMany(ln => ln.Agentes)
            .HasForeignKey(a => a.LineaNegocioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agente>()
            .HasOne(a => a.Distrito)
            .WithMany(d => d.Agentes)
            .HasForeignKey(a => a.DistritoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agente>()
            .HasOne(a => a.Region)
            .WithMany(r => r.Agentes)
            .HasForeignKey(a => a.RegionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agente>()
            .HasOne(a => a.Manager)
            .WithMany(m => m.Agentes)
            .HasForeignKey(a => a.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agente>()
            .HasOne(a => a.TipoAgente)
            .WithMany(ep => ep.Agentes)
            .HasForeignKey(a => a.TipoAgenteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agente>()
            .HasOne(a => a.EntidadesDinamica)
            .WithMany(ed => ed.Agentes)
            .HasForeignKey(a => a.EntidadDinamicaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agente>()
            .HasOne(a => a.Supervisor)
            .WithMany(u => u.Agentes)
            .HasForeignKey(a => a.SupervisorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de relación Manager - Usuario
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Manager)
            .WithMany(m => m.Usuarios)
            .HasForeignKey(u => u.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de relación TiempoUtilizado - TipoActividad
        modelBuilder.Entity<TiempoUtilizado>()
            .HasOne(tu => tu.TipoActividad)
            .WithMany(ta => ta.TiempoUtilizados)
            .HasForeignKey(tu => tu.TipoActividadId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de tabla AuditCustomer (singular)
        modelBuilder.Entity<AuditCustomer>()
            .ToTable("AuditCustomer");

        // Configuración de relaciones CRM
        modelBuilder.Entity<Cliente>()
            .HasOne(c => c.Institucion)
            .WithMany(i => i.InverseInstitucion)
            .HasForeignKey(c => c.InstitucionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cliente>()
            .HasOne(c => c.Direccion)
            .WithMany(d => d.Clientes)
            .HasForeignKey(c => c.DireccionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cliente>()
            .HasOne(c => c.TipoCliente)
            .WithMany(ep => ep.Clientes)
            .HasForeignKey(c => c.TipoClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cliente>()
            .HasOne(c => c.EntidadesDinamica)
            .WithMany(ed => ed.Clientes)
            .HasForeignKey(c => c.EntidadDinamicaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Relacione>()
            .HasOne(r => r.Agente)
            .WithMany(a => a.Relaciones)
            .HasForeignKey(r => r.AgenteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Relacione>()
            .HasOne(r => r.ClientePrincipal)
            .WithMany(c => c.RelacioneClientePrincipals)
            .HasForeignKey(r => r.ClientePrincipalId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Relacione>()
            .HasOne(r => r.ClienteSecundario1)
            .WithMany(c => c.RelacioneClienteSecundario1s)
            .HasForeignKey(r => r.ClienteSecundario1Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Relacione>()
            .HasOne(r => r.ClienteSecundario2)
            .WithMany(c => c.RelacioneClienteSecundario2s)
            .HasForeignKey(r => r.ClienteSecundario2Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Interaccione>()
            .HasOne(i => i.Relacion)
            .WithMany(r => r.Interacciones)
            .HasForeignKey(i => i.RelacionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Interaccione>()
            .HasOne(i => i.Agente)
            .WithMany(a => a.Interacciones)
            .HasForeignKey(i => i.AgenteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Interaccione>()
            .HasOne(i => i.Cliente)
            .WithMany(c => c.Interacciones)
            .HasForeignKey(i => i.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Interaccione>()
            .HasOne(i => i.EntidadDinamica)
            .WithMany()
            .HasForeignKey(i => i.EntidadDinamicaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Comentado temporalmente - Agente no tiene colección Auditorias en el modelo actual
        // modelBuilder.Entity<AuditoriaAgente>()
        //     .HasOne(aa => aa.Agente)
        //     .WithMany(a => a.Auditorias)
        //     .HasForeignKey(aa => aa.AgenteId)
        //     .OnDelete(DeleteBehavior.Restrict);

        // Seed data - IDs fijos para datos de prueba
        var empresaDefaultId = "EMP-DEFAULT-001";
        var rolAdminId = "ROL-ADMIN-001";
        var usuarioAdminId = "USR-ADMIN-001";
        var moduloUsuariosId = "MOD-USUARIOS-001";
        var moduloRolesId = "MOD-ROLES-001";
        var moduloEmpresasId = "MOD-EMPRESAS-001";
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // Seed data - Empresa por defecto
        modelBuilder.Entity<Empresa>().HasData(
            new Empresa
            {
                Id = empresaDefaultId,
                Nombre = "PharMind",
                RazonSocial = "PharMind S.A.",
                Cuit = "20-12345678-9",
                Email = "info@pharmind.com",
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            }
        );

        // Seed data - Rol Administrador
        modelBuilder.Entity<Rol>().HasData(
            new Rol
            {
                Id = rolAdminId,
                EmpresaId = empresaDefaultId,
                Nombre = "Administrador",
                Descripcion = "Acceso total al sistema",
                EsSistema = true,
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            }
        );

        // Seed data - Usuario Administrador
        // Password: Admin123! (BCrypt hash generated with BCrypt.Net.BCrypt.HashPassword)
        modelBuilder.Entity<Usuario>().HasData(
            new Usuario
            {
                Id = usuarioAdminId,
                EmpresaId = empresaDefaultId,
                Email = "admin@pharmind.com",
                PasswordHash = "$2a$11$HvE3qX5WzLJKN5/9YJX0x.JYWZXzJK5qKHJxZHJK5qKHJxZHJK5q.", // Admin123! - This is a temporary hash, will be regenerated on first run
                NombreCompleto = "Administrador del Sistema",
                EmailVerificado = true,
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            }
        );

        // Seed data - Asignar rol admin al usuario admin
        modelBuilder.Entity<UsuarioRol>().HasData(
            new UsuarioRol
            {
                Id = "USRROL-ADMIN-001",
                UsuarioId = usuarioAdminId,
                RolId = rolAdminId,
                FechaAsignacion = seedDate,
                FechaCreacion = seedDate,
                Status = false
            }
        );

        // Seed data - Módulos del sistema
        modelBuilder.Entity<Modulo>().HasData(
            new Modulo
            {
                Id = moduloUsuariosId,
                Codigo = "USUARIOS",
                Nombre = "Usuarios",
                Descripcion = "Gestión de usuarios del sistema",
                Icono = "people",
                Ruta = "/usuarios",
                OrdenMenu = 1,
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new Modulo
            {
                Id = moduloRolesId,
                Codigo = "ROLES",
                Nombre = "Roles",
                Descripcion = "Gestión de roles y permisos",
                Icono = "admin_panel_settings",
                Ruta = "/roles",
                OrdenMenu = 2,
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new Modulo
            {
                Id = moduloEmpresasId,
                Codigo = "EMPRESAS",
                Nombre = "Empresas",
                Descripcion = "Gestión de empresas",
                Icono = "business",
                Ruta = "/empresas",
                OrdenMenu = 3,
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            }
        );

        // Seed data - Permisos del rol Administrador (acceso total a todos los módulos)
        modelBuilder.Entity<RolModulo>().HasData(
            new RolModulo
            {
                Id = "ROLMOD-ADMIN-USR-001",
                RolId = rolAdminId,
                ModuloId = moduloUsuariosId,
                NivelAcceso = "Completo",
                PuedeVer = true,
                PuedeCrear = true,
                PuedeEditar = true,
                PuedeEliminar = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new RolModulo
            {
                Id = "ROLMOD-ADMIN-ROL-001",
                RolId = rolAdminId,
                ModuloId = moduloRolesId,
                NivelAcceso = "Completo",
                PuedeVer = true,
                PuedeCrear = true,
                PuedeEditar = true,
                PuedeEliminar = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new RolModulo
            {
                Id = "ROLMOD-ADMIN-EMP-001",
                RolId = rolAdminId,
                ModuloId = moduloEmpresasId,
                NivelAcceso = "Completo",
                PuedeVer = true,
                PuedeCrear = true,
                PuedeEditar = true,
                PuedeEliminar = true,
                FechaCreacion = seedDate,
                Status = false
            }
        );
    }
}
