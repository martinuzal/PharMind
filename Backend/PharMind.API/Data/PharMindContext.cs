using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Models.Temp;

namespace PharMind.API.Data;

public partial class PharMindContext : DbContext
{
    public PharMindContext(DbContextOptions<PharMindContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Empresa> Empresas { get; set; }

    public virtual DbSet<Modulo> Modulos { get; set; }

    public virtual DbSet<RolModulo> RolModulos { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<UsuarioRole> UsuarioRoles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Empresa>(entity =>
        {
            entity.HasIndex(e => e.Cuit, "IX_Empresas_CUIT")
                .IsUnique()
                .HasFilter("([CUIT] IS NOT NULL)");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Cuit)
                .HasMaxLength(20)
                .HasColumnName("CUIT");
            entity.Property(e => e.Direccion).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.RazonSocial).HasMaxLength(200);
            entity.Property(e => e.Telefono).HasMaxLength(50);
        });

        modelBuilder.Entity<Modulo>(entity =>
        {
            entity.HasIndex(e => e.ModuloPadreId, "IX_Modulos_ModuloPadreId");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Ruta).HasMaxLength(200);

            entity.HasOne(d => d.ModuloPadre).WithMany(p => p.InverseModuloPadre).HasForeignKey(d => d.ModuloPadreId);
        });

        modelBuilder.Entity<RolModulo>(entity =>
        {
            entity.HasIndex(e => e.ModuloId, "IX_RolModulos_ModuloId");

            entity.HasIndex(e => e.RolId, "IX_RolModulos_RolId");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.NivelAcceso).HasMaxLength(50);

            entity.HasOne(d => d.Modulo).WithMany(p => p.RolModulos).HasForeignKey(d => d.ModuloId);

            entity.HasOne(d => d.Rol).WithMany(p => p.RolModulos).HasForeignKey(d => d.RolId);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(e => e.EmpresaId, "IX_Roles_EmpresaId");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);

            entity.HasOne(d => d.Empresa).WithMany(p => p.Roles).HasForeignKey(d => d.EmpresaId);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_Usuarios_Email").IsUnique();

            entity.HasIndex(e => e.EmpresaId, "IX_Usuarios_EmpresaId");

            entity.Property(e => e.Cargo).HasMaxLength(100);
            entity.Property(e => e.Departamento).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.NombreCompleto).HasMaxLength(200);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.ProveedorSso)
                .HasMaxLength(50)
                .HasColumnName("ProveedorSSO");
            entity.Property(e => e.Ssoid).HasColumnName("SSOId");
            entity.Property(e => e.Telefono).HasMaxLength(50);

            entity.HasOne(d => d.Empresa).WithMany(p => p.Usuarios).HasForeignKey(d => d.EmpresaId);
        });

        modelBuilder.Entity<UsuarioRole>(entity =>
        {
            entity.HasIndex(e => e.RolId, "IX_UsuarioRoles_RolId");

            entity.HasIndex(e => e.UsuarioId, "IX_UsuarioRoles_UsuarioId");

            entity.Property(e => e.AsignadoPor).HasMaxLength(255);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);

            entity.HasOne(d => d.Rol).WithMany(p => p.UsuarioRoles)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Usuario).WithMany(p => p.UsuarioRoles)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
