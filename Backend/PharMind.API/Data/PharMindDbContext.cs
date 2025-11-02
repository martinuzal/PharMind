using Microsoft.EntityFrameworkCore;
using PharMind.API.Models;

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
    public DbSet<EsquemaPersonalizado> EsquemasPersonalizados { get; set; }
    public DbSet<EntidadDinamica> EntidadesDinamicas { get; set; }
    public DbSet<TablaMaestra> TablasMaestras { get; set; }
    public DbSet<Direccion> Direcciones { get; set; }
    public DbSet<Pais> Paises { get; set; }
    public DbSet<Estado> Estados { get; set; }
    public DbSet<Ciudad> Ciudades { get; set; }
    public DbSet<Calle> Calles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de índices únicos
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Empresa>()
            .HasIndex(e => e.CUIT)
            .IsUnique();

        modelBuilder.Entity<EsquemaPersonalizado>()
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
            .WithMany(r => r.UsuarioRoles)
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
            .WithMany(m => m.SubModulos)
            .HasForeignKey(m => m.ModuloPadreId)
            .OnDelete(DeleteBehavior.Restrict);

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
                CUIT = "20-12345678-9",
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
                Nombre = "Usuarios",
                Descripcion = "Gestión de usuarios del sistema",
                Icono = "people",
                Ruta = "/usuarios",
                Orden = 1,
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new Modulo
            {
                Id = moduloRolesId,
                Nombre = "Roles",
                Descripcion = "Gestión de roles y permisos",
                Icono = "admin_panel_settings",
                Ruta = "/roles",
                Orden = 2,
                Activo = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new Modulo
            {
                Id = moduloEmpresasId,
                Nombre = "Empresas",
                Descripcion = "Gestión de empresas",
                Icono = "business",
                Ruta = "/empresas",
                Orden = 3,
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
                NivelAcceso = "Administracion",
                PuedeVer = true,
                PuedeCrear = true,
                PuedeEditar = true,
                PuedeEliminar = true,
                PuedeExportar = true,
                PuedeImportar = true,
                PuedeAprobar = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new RolModulo
            {
                Id = "ROLMOD-ADMIN-ROL-001",
                RolId = rolAdminId,
                ModuloId = moduloRolesId,
                NivelAcceso = "Administracion",
                PuedeVer = true,
                PuedeCrear = true,
                PuedeEditar = true,
                PuedeEliminar = true,
                PuedeExportar = true,
                PuedeImportar = true,
                PuedeAprobar = true,
                FechaCreacion = seedDate,
                Status = false
            },
            new RolModulo
            {
                Id = "ROLMOD-ADMIN-EMP-001",
                RolId = rolAdminId,
                ModuloId = moduloEmpresasId,
                NivelAcceso = "Administracion",
                PuedeVer = true,
                PuedeCrear = true,
                PuedeEditar = true,
                PuedeEliminar = true,
                PuedeExportar = true,
                PuedeImportar = true,
                PuedeAprobar = true,
                FechaCreacion = seedDate,
                Status = false
            }
        );
    }
}
