using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PharMind.API.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Agente> Agentes { get; set; }

    public virtual DbSet<AnalyticsMedico> AnalyticsMedicos { get; set; }

    public virtual DbSet<AnalyticsObjetivo> AnalyticsObjetivos { get; set; }

    public virtual DbSet<AnalyticsProducto> AnalyticsProductos { get; set; }

    public virtual DbSet<AnalyticsRepresentante> AnalyticsRepresentantes { get; set; }

    public virtual DbSet<AnalyticsVisita> AnalyticsVisitas { get; set; }

    public virtual DbSet<AuditCategory> AuditCategories { get; set; }

    public virtual DbSet<AuditCustomer> AuditCustomers { get; set; }

    public virtual DbSet<AuditMarketMarca> AuditMarketMarcas { get; set; }

    public virtual DbSet<AuditMercado> AuditMercados { get; set; }

    public virtual DbSet<AuditPeriod> AuditPeriods { get; set; }

    public virtual DbSet<AuditProductClass> AuditProductClasses { get; set; }

    public virtual DbSet<AuditoriaAgente> AuditoriaAgentes { get; set; }

    public virtual DbSet<Calle> Calles { get; set; }

    public virtual DbSet<Categoria> Categorias { get; set; }

    public virtual DbSet<Ciudade> Ciudades { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Direccione> Direcciones { get; set; }

    public virtual DbSet<Distrito> Distritos { get; set; }

    public virtual DbSet<Empresa> Empresas { get; set; }

    public virtual DbSet<EntidadesDinamica> EntidadesDinamicas { get; set; }

    public virtual DbSet<Especialidade> Especialidades { get; set; }

    public virtual DbSet<EsquemasPersonalizado> EsquemasPersonalizados { get; set; }

    public virtual DbSet<Estado> Estados { get; set; }

    public virtual DbSet<Interaccione> Interacciones { get; set; }

    public virtual DbSet<LineasNegocio> LineasNegocios { get; set; }

    public virtual DbSet<Manager> Managers { get; set; }

    public virtual DbSet<ManagerDistrito> ManagerDistritos { get; set; }

    public virtual DbSet<ManagerLineasNegocio> ManagerLineasNegocios { get; set; }

    public virtual DbSet<ManagerRegione> ManagerRegiones { get; set; }

    public virtual DbSet<Modulo> Modulos { get; set; }

    public virtual DbSet<Paise> Paises { get; set; }

    public virtual DbSet<Period> Periods { get; set; }

    public virtual DbSet<ProcessLog> ProcessLogs { get; set; }

    public virtual DbSet<Regiones> Regiones { get; set; }

    public virtual DbSet<Relacione> Relaciones { get; set; }

    public virtual DbSet<RolModulo> RolModulos { get; set; }

    // COMENTADO: Usar Rol en lugar de Role para coincidir con la nomenclatura de la base de datos
    // public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RolesModulo> RolesModulos { get; set; }

    public virtual DbSet<TablasMaestra> TablasMaestras { get; set; }

    public virtual DbSet<Tarea> Tareas { get; set; }

    public virtual DbSet<TiempoUtilizado> TiempoUtilizados { get; set; }

    public virtual DbSet<Timeline> Timelines { get; set; }

    public virtual DbSet<TiposActividad> TiposActividads { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<UsuarioRole> UsuarioRoles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Agente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Agentes__3214EC074F6773E5");

            entity.HasIndex(e => e.CodigoAgente, "IX_Agentes_CodigoAgente");

            entity.HasIndex(e => e.CodigoDistrito, "IX_Agentes_CodigoDistrito");

            entity.HasIndex(e => e.CodigoLineaNegocio, "IX_Agentes_CodigoLineaNegocio");

            entity.HasIndex(e => e.Estado, "IX_Agentes_Estado");

            entity.HasIndex(e => e.Status, "IX_Agentes_Status");

            entity.HasIndex(e => e.SupervisorId, "IX_Agentes_SupervisorId");

            entity.HasIndex(e => e.TimelineId, "IX_Agentes_TimelineId");

            entity.HasIndex(e => e.CodigoAgente, "UQ__Agentes__797B81C1ACF288DE").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Apellido).HasMaxLength(200);
            entity.Property(e => e.CodigoAgente).HasMaxLength(50);
            entity.Property(e => e.CodigoDistrito).HasMaxLength(50);
            entity.Property(e => e.CodigoLineaNegocio).HasMaxLength(50);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.DistritoId).HasMaxLength(450);
            entity.Property(e => e.DistritoNombre).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.EntidadDinamicaId).HasMaxLength(450);
            entity.Property(e => e.Estado)
                .HasMaxLength(50)
                .HasDefaultValue("Activo");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.LineaNegocioId).HasMaxLength(450);
            entity.Property(e => e.LineaNegocioNombre).HasMaxLength(200);
            entity.Property(e => e.ManagerId).HasMaxLength(450);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Observaciones).HasMaxLength(1000);
            entity.Property(e => e.RegionId).HasMaxLength(450);
            entity.Property(e => e.Telefono).HasMaxLength(50);
            entity.Property(e => e.TipoAgenteId).HasMaxLength(450);
            entity.Property(e => e.ZonaGeografica).HasMaxLength(100);

            entity.HasOne(d => d.Distrito).WithMany(p => p.Agentes)
                .HasForeignKey(d => d.DistritoId)
                .HasConstraintName("FK_Agentes_Distritos");

            entity.HasOne(d => d.EntidadesDinamica).WithMany(p => p.Agentes)
                .HasForeignKey(d => d.EntidadDinamicaId)
                .HasConstraintName("FK_Agentes_EntidadesDinamicas");

            entity.HasOne(d => d.LineaNegocio).WithMany(p => p.Agentes)
                .HasForeignKey(d => d.LineaNegocioId)
                .HasConstraintName("FK_Agentes_LineasNegocio");

            entity.HasOne(d => d.Manager).WithMany(p => p.Agentes)
                .HasForeignKey(d => d.ManagerId)
                .HasConstraintName("FK_Agentes_Managers");

            entity.HasOne(d => d.Region).WithMany(p => p.Agentes)
                .HasForeignKey(d => d.RegionId)
                .HasConstraintName("FK_Agentes_Regiones");

            entity.HasOne(d => d.Supervisor).WithMany(p => p.Agentes).HasForeignKey(d => d.SupervisorId);

            entity.HasOne(d => d.Timeline).WithMany(p => p.Agentes).HasForeignKey(d => d.TimelineId);

            entity.HasOne(d => d.TipoAgente).WithMany(p => p.Agentes)
                .HasForeignKey(d => d.TipoAgenteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Agentes_EsquemasPersonalizados");
        });

        modelBuilder.Entity<AnalyticsMedico>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__analytic__3214EC073970F015");

            entity.ToTable("analytics_medicos");

            entity.HasIndex(e => e.Provincia, "IX_Medicos_Provincia");

            entity.HasIndex(e => e.Segmento, "IX_Medicos_Segmento");

            entity.HasIndex(e => e.Matricula, "UQ__analytic__0FB9FB4F370BC898").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Apellido).HasMaxLength(200);
            entity.Property(e => e.Categoria).HasMaxLength(50);
            entity.Property(e => e.Ciudad).HasMaxLength(100);
            entity.Property(e => e.Direccion).HasMaxLength(300);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Especialidad).HasMaxLength(100);
            entity.Property(e => e.FechaAlta)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Matricula).HasMaxLength(50);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Provincia).HasMaxLength(100);
            entity.Property(e => e.Sector).HasMaxLength(50);
            entity.Property(e => e.Segmento)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.Telefono).HasMaxLength(50);
            entity.Property(e => e.TipoAtencion).HasMaxLength(50);
            entity.Property(e => e.TipoInstitucion).HasMaxLength(100);
        });

        modelBuilder.Entity<AnalyticsObjetivo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__analytic__3214EC07540EADCB");

            entity.ToTable("analytics_objetivos");

            entity.Property(e => e.Periodo).HasMaxLength(20);
            entity.Property(e => e.Porcentaje)
                .HasComputedColumnSql("((CONVERT([decimal](10,2),[Alcanzado])/CONVERT([decimal](10,2),[Meta]))*(100))", false)
                .HasColumnType("decimal(27, 13)");
            entity.Property(e => e.TipoObjetivo).HasMaxLength(50);

            entity.HasOne(d => d.Representante).WithMany(p => p.AnalyticsObjetivos)
                .HasForeignKey(d => d.RepresentanteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__analytics__Repre__0D7A0286");
        });

        modelBuilder.Entity<AnalyticsProducto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__analytic__3214EC073EF82BDE");

            entity.ToTable("analytics_productos");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.LineaProducto).HasMaxLength(100);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Presentacion).HasMaxLength(200);
            entity.Property(e => e.Principio).HasMaxLength(200);
        });

        modelBuilder.Entity<AnalyticsRepresentante>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__analytic__3214EC07A20ED50C");

            entity.ToTable("analytics_representantes");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Distrito).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.FechaIngreso).HasColumnType("datetime");
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Region).HasMaxLength(100);
            entity.Property(e => e.Zona).HasMaxLength(100);
        });

        modelBuilder.Entity<AnalyticsVisita>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__analytic__3214EC07281CA0BA");

            entity.ToTable("analytics_visitas");

            entity.HasIndex(e => e.FechaVisita, "IX_Visitas_Fecha");

            entity.HasIndex(e => e.MedicoId, "IX_Visitas_Medico");

            entity.HasIndex(e => e.RepresentanteId, "IX_Visitas_Representante");

            entity.Property(e => e.Exitosa).HasDefaultValue(true);
            entity.Property(e => e.FechaVisita).HasColumnType("datetime");
            entity.Property(e => e.MuestrasMedicasEntregadas).HasDefaultValue(false);
            entity.Property(e => e.ProximaVisitaPlaneada).HasColumnType("datetime");
            entity.Property(e => e.TipoVisita).HasMaxLength(50);
            entity.Property(e => e.Turno).HasMaxLength(20);

            entity.HasOne(d => d.Medico).WithMany(p => p.AnalyticsVisita)
                .HasForeignKey(d => d.MedicoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__analytics__Medic__03F0984C");

            entity.HasOne(d => d.Representante).WithMany(p => p.AnalyticsVisita)
                .HasForeignKey(d => d.RepresentanteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__analytics__Repre__04E4BC85");
        });

        modelBuilder.Entity<AuditCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__auditCat__3214EC0718A28A36");

            entity.ToTable("auditCategory");

            entity.HasIndex(e => e.CdgmedReg, "IX_auditCategory_Medico");

            entity.HasIndex(e => new { e.CdgMercado, e.CdgPeruser }, "IX_auditCategory_Mercado_Periodo");

            entity.HasIndex(e => e.CdgPeruser, "IX_auditCategory_Periodo");

            entity.HasIndex(e => e.CdgRaiz, "IX_auditCategory_Producto");

            entity.Property(e => e.Cat)
                .HasMaxLength(500)
                .HasColumnName("CAT");
            entity.Property(e => e.CdgMercado)
                .HasMaxLength(100)
                .HasColumnName("CDG_MERCADO");
            entity.Property(e => e.CdgPeruser)
                .HasMaxLength(100)
                .HasColumnName("CDG_PERUSER");
            entity.Property(e => e.CdgRaiz)
                .HasMaxLength(100)
                .HasColumnName("CDG_RAIZ");
            entity.Property(e => e.CdgmedReg)
                .HasMaxLength(100)
                .HasColumnName("CDGMED_REG");
            entity.Property(e => e.CdgregPmix)
                .HasMaxLength(100)
                .HasColumnName("CDGREG_PMIX");
            entity.Property(e => e.MerMs)
                .HasMaxLength(100)
                .HasColumnName("MER_MS");
            entity.Property(e => e.Px)
                .HasMaxLength(100)
                .HasColumnName("PX");
            entity.Property(e => e.PxLab)
                .HasMaxLength(100)
                .HasColumnName("PX_LAB");
            entity.Property(e => e.PxMer)
                .HasMaxLength(100)
                .HasColumnName("PX_MER");
            entity.Property(e => e.PxMs)
                .HasMaxLength(100)
                .HasColumnName("PX_MS");
            entity.Property(e => e.RawData).HasMaxLength(1000);
        });

        modelBuilder.Entity<AuditCustomer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__auditCus__3214EC07CD25F3D7");

            entity.ToTable("auditCustomer");

            entity.HasIndex(e => e.CdgmedReg, "IX_auditCustomer_CdgMedReg");

            entity.HasIndex(e => e.Cdgesp1, "IX_auditCustomer_Especialidad");

            entity.Property(e => e.Bairro)
                .HasMaxLength(200)
                .HasColumnName("BAIRRO");
            entity.Property(e => e.Blank)
                .HasMaxLength(100)
                .HasColumnName("BLANK");
            entity.Property(e => e.Cdgesp1)
                .HasMaxLength(100)
                .HasColumnName("CDGESP1");
            entity.Property(e => e.Cdgesp2)
                .HasMaxLength(100)
                .HasColumnName("CDGESP2");
            entity.Property(e => e.CdgmedReg)
                .HasMaxLength(100)
                .HasColumnName("CDGMED_REG");
            entity.Property(e => e.CdgmedVis)
                .HasMaxLength(100)
                .HasColumnName("CDGMED_VIS");
            entity.Property(e => e.CdgregPmix)
                .HasMaxLength(100)
                .HasColumnName("CDGREG_PMIX");
            entity.Property(e => e.Cep)
                .HasMaxLength(50)
                .HasColumnName("CEP");
            entity.Property(e => e.Crm)
                .HasMaxLength(100)
                .HasColumnName("CRM");
            entity.Property(e => e.Local)
                .HasMaxLength(500)
                .HasColumnName("LOCAL");
            entity.Property(e => e.Nome)
                .HasMaxLength(500)
                .HasColumnName("NOME");
            entity.Property(e => e.RawData).HasMaxLength(1000);
        });

        modelBuilder.Entity<AuditMarketMarca>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__auditMar__3214EC07BD657941");

            entity.ToTable("auditMarketMarcas");

            entity.HasIndex(e => e.CodigoPmix, "IX_auditMarketMarcas_CodigoPMIX");

            entity.HasIndex(e => e.Siglalab, "IX_auditMarketMarcas_Lab");

            entity.Property(e => e.Codigo)
                .HasMaxLength(100)
                .HasColumnName("CODIGO");
            entity.Property(e => e.CodigoPmix)
                .HasMaxLength(100)
                .HasColumnName("CODIGO_PMIX");
            entity.Property(e => e.Nome)
                .HasMaxLength(500)
                .HasColumnName("NOME");
            entity.Property(e => e.RawData).HasMaxLength(1000);
            entity.Property(e => e.Siglalab)
                .HasMaxLength(100)
                .HasColumnName("SIGLALAB");
        });

        modelBuilder.Entity<AuditMercado>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__auditMer__3214EC07BB041687");

            entity.ToTable("auditMercados");

            entity.HasIndex(e => e.CdgMercado, "IX_auditMercados_CdgMercado");

            entity.Property(e => e.Abreviatura).HasMaxLength(50);
            entity.Property(e => e.Audit).HasMaxLength(1);
            entity.Property(e => e.CdgLabora).HasMaxLength(100);
            entity.Property(e => e.CdgMercado).HasMaxLength(100);
            entity.Property(e => e.CdgPais).HasMaxLength(100);
            entity.Property(e => e.CdgUsuario).HasMaxLength(100);
            entity.Property(e => e.Closeup).HasMaxLength(1);
            entity.Property(e => e.Controlado).HasMaxLength(1);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.Edicion).HasMaxLength(20);
            entity.Property(e => e.FechaHoraProc).HasMaxLength(50);
            entity.Property(e => e.Feedback).HasMaxLength(1);
            entity.Property(e => e.Generado).HasMaxLength(1);
            entity.Property(e => e.Path).HasMaxLength(500);
            entity.Property(e => e.Recetario).HasMaxLength(1);
        });

        modelBuilder.Entity<AuditPeriod>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__auditPer__3214EC070D0FFF09");

            entity.ToTable("auditPeriod");

            entity.HasIndex(e => e.CdgPeruser, "IX_auditPeriod_CdgPeriodo");

            entity.Property(e => e.Blank)
                .HasMaxLength(100)
                .HasColumnName("BLANK");
            entity.Property(e => e.CdgPeruser)
                .HasMaxLength(100)
                .HasColumnName("CDG_PERUSER");
            entity.Property(e => e.Desc)
                .HasMaxLength(500)
                .HasColumnName("DESC");
            entity.Property(e => e.RawData).HasMaxLength(1000);
        });

        modelBuilder.Entity<AuditProductClass>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__auditPro__3214EC07F7A54B2E");

            entity.ToTable("auditProductClass");

            entity.Property(e => e.CdgMercado)
                .HasMaxLength(100)
                .HasColumnName("CDG_MERCADO");
            entity.Property(e => e.CodigoPmix)
                .HasMaxLength(100)
                .HasColumnName("CODIGO_PMIX");
            entity.Property(e => e.RawData).HasMaxLength(1000);
        });

        modelBuilder.Entity<AuditoriaAgente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Auditori__3214EC07F30BED71");

            entity.HasIndex(e => e.AgenteId, "IX_AuditoriaAgentes_AgenteId");

            entity.HasIndex(e => e.FechaOperacion, "IX_AuditoriaAgentes_FechaOperacion");

            entity.HasIndex(e => e.TipoOperacion, "IX_AuditoriaAgentes_TipoOperacion");

            entity.Property(e => e.CampoModificado).HasMaxLength(200);
            entity.Property(e => e.Descripcion).HasMaxLength(1000);
            entity.Property(e => e.DireccionIp)
                .HasMaxLength(50)
                .HasColumnName("DireccionIP");
            entity.Property(e => e.FechaOperacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TipoOperacion).HasMaxLength(50);
            entity.Property(e => e.UsuarioOperacion).HasMaxLength(255);

            entity.HasOne(d => d.Agente).WithMany(p => p.AuditoriaAgentes)
                .HasForeignKey(d => d.AgenteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AuditoriaAgentes_Agentes");
        });

        modelBuilder.Entity<Calle>(entity =>
        {
            entity.HasIndex(e => e.CiudadId, "IX_Calles_CiudadId");

            entity.Property(e => e.CodigoPostal).HasMaxLength(20);
            entity.Property(e => e.Colonia).HasMaxLength(100);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);

            entity.HasOne(d => d.Ciudad).WithMany(p => p.Calles).HasForeignKey(d => d.CiudadId);
        });

        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(e => e.Codigo);

            entity.Property(e => e.Codigo).ValueGeneratedNever();
            entity.Property(e => e.Descripcion).HasMaxLength(255);
        });

        modelBuilder.Entity<Ciudade>(entity =>
        {
            entity.HasIndex(e => e.EstadoId, "IX_Ciudades_EstadoId");

            entity.Property(e => e.CodigoPostal).HasMaxLength(20);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);

            entity.HasOne(d => d.Estado).WithMany(p => p.Ciudades).HasForeignKey(d => d.EstadoId);
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Clientes__3214EC0792BAA03B");

            entity.HasIndex(e => e.Categoria, "IX_Clientes_Categoria");

            entity.HasIndex(e => e.CodigoAudit, "IX_Clientes_CodigoAudit").HasFilter("([CodigoAudit] IS NOT NULL)");

            entity.HasIndex(e => e.CodigoCliente, "IX_Clientes_CodigoCliente");

            entity.HasIndex(e => e.DireccionId, "IX_Clientes_DireccionId");

            entity.HasIndex(e => e.EntidadDinamicaId, "IX_Clientes_EntidadDinamicaId");

            entity.HasIndex(e => e.Estado, "IX_Clientes_Estado");

            entity.HasIndex(e => e.InstitucionId, "IX_Clientes_InstitucionId");

            entity.HasIndex(e => e.Nombre, "IX_Clientes_Nombre");

            entity.HasIndex(e => e.Segmento, "IX_Clientes_Segmento");

            entity.HasIndex(e => e.Status, "IX_Clientes_Status");

            entity.HasIndex(e => e.TipoClienteId, "IX_Clientes_TipoClienteId");

            entity.HasIndex(e => e.CodigoCliente, "UQ__Clientes__E0DD7E70563A3859").IsUnique();

            entity.Property(e => e.Apellido).HasMaxLength(200);
            entity.Property(e => e.Categoria).HasMaxLength(100);
            entity.Property(e => e.CodigoAudit)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.CodigoCliente).HasMaxLength(50);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Especialidad).HasMaxLength(200);
            entity.Property(e => e.Estado)
                .HasMaxLength(50)
                .HasDefaultValue("Activo");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.RazonSocial).HasMaxLength(300);
            entity.Property(e => e.Segmento).HasMaxLength(100);
            entity.Property(e => e.Telefono).HasMaxLength(50);

            entity.HasOne(d => d.Direccion).WithMany(p => p.Clientes).HasForeignKey(d => d.DireccionId);

            entity.HasOne(d => d.EntidadesDinamica).WithMany(p => p.Clientes).HasForeignKey(d => d.EntidadDinamicaId);

            entity.HasOne(d => d.Institucion).WithMany(p => p.InverseInstitucion).HasForeignKey(d => d.InstitucionId);

            entity.HasOne(d => d.TipoCliente).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.TipoClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Direccione>(entity =>
        {
            entity.Property(e => e.Apartamento).HasMaxLength(50);
            entity.Property(e => e.Calle).HasMaxLength(200);
            entity.Property(e => e.Ciudad).HasMaxLength(100);
            entity.Property(e => e.CodigoPostal).HasMaxLength(20);
            entity.Property(e => e.Colonia).HasMaxLength(100);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Estado).HasMaxLength(100);
            entity.Property(e => e.Latitud).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Longitud).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Numero).HasMaxLength(20);
            entity.Property(e => e.Pais).HasMaxLength(100);
            entity.Property(e => e.Referencia).HasMaxLength(500);
            entity.Property(e => e.TipoDireccion).HasMaxLength(50);
        });

        modelBuilder.Entity<Distrito>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Distrito__3214EC07921DB9C6");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Codigo).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.LegacyCode).HasMaxLength(100);
            entity.Property(e => e.Legajo).HasMaxLength(100);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.RegionId).HasMaxLength(450);

            entity.HasOne(d => d.Region).WithMany(p => p.Distritos)
                .HasForeignKey(d => d.RegionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Distritos_Regiones");
        });

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

        modelBuilder.Entity<EntidadesDinamica>(entity =>
        {
            entity.HasIndex(e => e.EmpresaId, "IX_EntidadesDinamicas_EmpresaId");

            entity.HasIndex(e => e.EsquemaId, "IX_EntidadesDinamicas_EsquemaId");

            entity.HasIndex(e => e.UsuarioId, "IX_EntidadesDinamicas_UsuarioId");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FullDescription).HasMaxLength(500);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);

            entity.HasOne(d => d.Empresa).WithMany(p => p.EntidadesDinamicas).HasForeignKey(d => d.EmpresaId);

            entity.HasOne(d => d.Esquema).WithMany(p => p.EntidadesDinamicas).HasForeignKey(d => d.EsquemaId);

            entity.HasOne(d => d.Usuario).WithMany(p => p.EntidadesDinamicas).HasForeignKey(d => d.UsuarioId);
        });

        modelBuilder.Entity<Especialidade>(entity =>
        {
            entity.HasKey(e => e.Codigo);

            entity.Property(e => e.Codigo).ValueGeneratedNever();
            entity.Property(e => e.Descripcion).HasMaxLength(255);
        });

        modelBuilder.Entity<EsquemasPersonalizado>(entity =>
        {
            entity.HasIndex(e => new { e.EmpresaId, e.EntidadTipo, e.SubTipo }, "IX_EsquemasPersonalizados_EmpresaId_EntidadTipo_SubTipo")
                .IsUnique()
                .HasFilter("([EmpresaId] IS NOT NULL AND [SubTipo] IS NOT NULL)");

            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.ConfiguracionUi).HasColumnName("ConfiguracionUI");
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.EntidadTipo).HasMaxLength(50);
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.SubTipo).HasMaxLength(50);

            entity.HasOne(d => d.Empresa).WithMany(p => p.EsquemasPersonalizados).HasForeignKey(d => d.EmpresaId);
        });

        modelBuilder.Entity<Estado>(entity =>
        {
            entity.HasIndex(e => e.PaisId, "IX_Estados_PaisId");

            entity.Property(e => e.Codigo).HasMaxLength(10);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);

            entity.HasOne(d => d.Pais).WithMany(p => p.Estados).HasForeignKey(d => d.PaisId);
        });

        modelBuilder.Entity<Interaccione>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Interacc__3214EC07EAF7F464");

            entity.HasIndex(e => e.AgenteId, "IX_Interacciones_AgenteId");

            entity.HasIndex(e => e.ClienteId, "IX_Interacciones_ClienteId");

            entity.HasIndex(e => e.CodigoInteraccion, "IX_Interacciones_CodigoInteraccion");

            entity.HasIndex(e => e.EntidadDinamicaId, "IX_Interacciones_EntidadDinamicaId");

            entity.HasIndex(e => e.Fecha, "IX_Interacciones_Fecha");

            entity.HasIndex(e => e.FechaProximaAccion, "IX_Interacciones_FechaProximaAccion");

            entity.HasIndex(e => e.RelacionId, "IX_Interacciones_RelacionId");

            entity.HasIndex(e => e.Resultado, "IX_Interacciones_Resultado");

            entity.HasIndex(e => e.Status, "IX_Interacciones_Status");

            entity.HasIndex(e => e.TipoInteraccion, "IX_Interacciones_TipoInteraccion");

            entity.HasIndex(e => e.TipoInteraccionId, "IX_Interacciones_TipoInteraccionId");

            entity.HasIndex(e => e.Turno, "IX_Interacciones_Turno");

            entity.HasIndex(e => e.CodigoInteraccion, "UQ__Interacc__8127E4130A33982B").IsUnique();

            entity.Property(e => e.CodigoInteraccion).HasMaxLength(50);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Latitud).HasColumnType("decimal(10, 7)");
            entity.Property(e => e.Longitud).HasColumnType("decimal(10, 7)");
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.ObjetivoVisita).HasMaxLength(500);
            entity.Property(e => e.Observaciones).HasMaxLength(2000);
            entity.Property(e => e.ProximaAccion).HasMaxLength(500);
            entity.Property(e => e.Resultado).HasMaxLength(100);
            entity.Property(e => e.ResumenVisita).HasMaxLength(2000);
            entity.Property(e => e.TipoInteraccion).HasMaxLength(100);
            entity.Property(e => e.Turno).HasMaxLength(20);

            entity.HasOne(d => d.Agente).WithMany(p => p.Interacciones)
                .HasForeignKey(d => d.AgenteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Interacciones_Agentes");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Interacciones)
                .HasForeignKey(d => d.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Interacciones_Clientes");

            entity.HasOne(d => d.EntidadDinamica).WithMany(p => p.Interacciones).HasForeignKey(d => d.EntidadDinamicaId);

            entity.HasOne(d => d.Relacion).WithMany(p => p.Interacciones)
                .HasForeignKey(d => d.RelacionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Interacciones_Relaciones");

            entity.HasOne(d => d.TipoInteraccionNavigation).WithMany(p => p.Interacciones)
                .HasForeignKey(d => d.TipoInteraccionId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<LineasNegocio>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__LineasNe__3214EC0770421A32");

            entity.ToTable("LineasNegocio");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Codigo).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.LegacyCode).HasMaxLength(100);
            entity.Property(e => e.Legajo).HasMaxLength(100);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
        });

        modelBuilder.Entity<Manager>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Managers__3214EC077D4887F6");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Apellido).HasMaxLength(200);
            entity.Property(e => e.Cargo).HasMaxLength(100);
            entity.Property(e => e.Codigo).HasMaxLength(50);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaIngreso).HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.LegacyCode).HasMaxLength(100);
            entity.Property(e => e.Legajo).HasMaxLength(100);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Observaciones).HasMaxLength(1000);
            entity.Property(e => e.Telefono).HasMaxLength(50);

            // Relación Manager -> Usuarios supervisados (usuarios que reportan a este manager)
            // Un Manager supervisa muchos Usuarios, un Usuario tiene un Manager
            entity.HasMany(d => d.Usuarios).WithOne(p => p.Manager)
                .HasForeignKey(p => p.ManagerId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<ManagerDistrito>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ManagerD__3214EC07D701F783");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.DistritoId).HasMaxLength(450);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.ManagerId).HasMaxLength(450);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);

            entity.HasOne(d => d.Distrito).WithMany(p => p.ManagerDistritos)
                .HasForeignKey(d => d.DistritoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ManagerDistritos_Distritos");

            entity.HasOne(d => d.Manager).WithMany(p => p.ManagerDistritos)
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ManagerDistritos_Managers");
        });

        modelBuilder.Entity<ManagerLineasNegocio>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ManagerL__3214EC071B8F4FFE");

            entity.ToTable("ManagerLineasNegocio");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.LineaNegocioId).HasMaxLength(450);
            entity.Property(e => e.ManagerId).HasMaxLength(450);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);

            entity.HasOne(d => d.LineaNegocio).WithMany(p => p.ManagerLineasNegocios)
                .HasForeignKey(d => d.LineaNegocioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ManagerLineasNegocio_LineasNegocio");

            entity.HasOne(d => d.Manager).WithMany(p => p.ManagerLineasNegocio)
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ManagerLineasNegocio_Managers");
        });

        modelBuilder.Entity<ManagerRegione>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ManagerR__3214EC079C759775");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.ManagerId).HasMaxLength(450);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.RegionId).HasMaxLength(450);

            entity.HasOne(d => d.Manager).WithMany(p => p.ManagerRegiones)
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ManagerRegiones_Managers");

            entity.HasOne(d => d.Region).WithMany(p => p.ManagerRegiones)
                .HasForeignKey(d => d.RegionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ManagerRegiones_Regiones");
        });

        modelBuilder.Entity<Modulo>(entity =>
        {
            entity.HasIndex(e => e.ModuloPadreId, "IX_Modulos_ModuloPadreId");

            entity.HasIndex(e => e.Codigo, "UQ_Modulos_Codigo").IsUnique();

            entity.Property(e => e.Codigo)
                .HasMaxLength(50)
                .HasDefaultValueSql("('MOD_'+CONVERT([nvarchar](50),newid()))");
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Ruta).HasMaxLength(200);

            entity.HasOne(d => d.ModuloPadre).WithMany(p => p.InverseModuloPadre).HasForeignKey(d => d.ModuloPadreId);
        });

        modelBuilder.Entity<Paise>(entity =>
        {
            entity.Property(e => e.Codigo).HasMaxLength(10);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<Period>(entity =>
        {
            entity.HasIndex(e => e.TimelineId, "IX_Periods_TimelineId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Codigo).HasMaxLength(20);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Status).HasDefaultValue(true);

            entity.HasOne(d => d.Timeline).WithMany(p => p.Periods).HasForeignKey(d => d.TimelineId);
        });

        modelBuilder.Entity<Regiones>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Regiones__3214EC074749EE53");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Codigo).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.LegacyCode).HasMaxLength(100);
            entity.Property(e => e.Legajo).HasMaxLength(100);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
        });

        modelBuilder.Entity<Relacione>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Relacion__3214EC07B6C38E70");

            entity.HasIndex(e => e.AgenteId, "IX_Relaciones_AgenteId");

            entity.HasIndex(e => e.ClientePrincipalId, "IX_Relaciones_ClientePrincipalId");

            entity.HasIndex(e => e.ClienteSecundario1Id, "IX_Relaciones_ClienteSecundario1Id");

            entity.HasIndex(e => e.ClienteSecundario2Id, "IX_Relaciones_ClienteSecundario2Id");

            entity.HasIndex(e => e.CodigoRelacion, "IX_Relaciones_CodigoRelacion");

            entity.HasIndex(e => e.EntidadDinamicaId, "IX_Relaciones_EntidadDinamicaId");

            entity.HasIndex(e => e.Estado, "IX_Relaciones_Estado");

            entity.HasIndex(e => e.FechaInicio, "IX_Relaciones_FechaInicio");

            entity.HasIndex(e => e.Prioridad, "IX_Relaciones_Prioridad");

            entity.HasIndex(e => e.Status, "IX_Relaciones_Status");

            entity.HasIndex(e => e.TipoRelacionId, "IX_Relaciones_TipoRelacionId");

            entity.HasIndex(e => e.CodigoRelacion, "UQ__Relacion__26FB572BC455750B").IsUnique();

            entity.Property(e => e.CodigoRelacion).HasMaxLength(50);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Estado)
                .HasMaxLength(50)
                .HasDefaultValue("Activa");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.FrecuenciaVisitas).HasMaxLength(50);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Observaciones).HasMaxLength(2000);
            entity.Property(e => e.Prioridad)
                .HasMaxLength(50)
                .HasDefaultValue("Media");
            entity.Property(e => e.TipoRelacion).HasMaxLength(100);

            entity.HasOne(d => d.Agente).WithMany(p => p.Relaciones)
                .HasForeignKey(d => d.AgenteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Relaciones_Agentes");

            entity.HasOne(d => d.ClientePrincipal).WithMany(p => p.RelacioneClientePrincipals)
                .HasForeignKey(d => d.ClientePrincipalId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Relaciones_Clientes_Principal");

            entity.HasOne(d => d.ClienteSecundario1).WithMany(p => p.RelacioneClienteSecundario1s)
                .HasForeignKey(d => d.ClienteSecundario1Id)
                .HasConstraintName("FK_Relaciones_Clientes_Secundario1");

            entity.HasOne(d => d.ClienteSecundario2).WithMany(p => p.RelacioneClienteSecundario2s)
                .HasForeignKey(d => d.ClienteSecundario2Id)
                .HasConstraintName("FK_Relaciones_Clientes_Secundario2");

            entity.HasOne(d => d.EntidadDinamica).WithMany(p => p.Relaciones).HasForeignKey(d => d.EntidadDinamicaId);

            entity.HasOne(d => d.TipoRelacionNavigation).WithMany(p => p.Relaciones)
                .HasForeignKey(d => d.TipoRelacionId)
                .OnDelete(DeleteBehavior.ClientSetNull);
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

        // COMENTADO: Usar Rol en lugar de Role para coincidir con la nomenclatura de la base de datos
        /*
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(e => e.EmpresaId, "IX_Roles_EmpresaId");

            entity.HasIndex(e => e.Codigo, "UQ_Roles_Codigo").IsUnique();

            entity.Property(e => e.Codigo)
                .HasMaxLength(50)
                .HasDefaultValueSql("('ROL_'+CONVERT([nvarchar](50),newid()))");
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(100);

            entity.HasOne(d => d.Empresa).WithMany(p => p.Roles).HasForeignKey(d => d.EmpresaId);
        });
        */

        modelBuilder.Entity<RolesModulo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RolesMod__3214EC078E5308D9");

            entity.HasIndex(e => e.ModuloId, "IX_RolesModulos_ModuloId");

            entity.HasIndex(e => e.RolId, "IX_RolesModulos_RolId");

            entity.HasIndex(e => new { e.RolId, e.ModuloId }, "UQ_RolesModulos_RolModulo").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreadoPor).HasMaxLength(256);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ModificadoPor).HasMaxLength(450);
            entity.Property(e => e.PuedeVer).HasDefaultValue(true);
            entity.Property(e => e.Status).HasDefaultValue(false);

            entity.HasOne(d => d.Modulo).WithMany(p => p.RolesModulos)
                .HasForeignKey(d => d.ModuloId)
                .HasConstraintName("FK_RolesModulos_Modulo");

            entity.HasOne(d => d.Rol).WithMany(p => p.RolesModulos)
                .HasForeignKey(d => d.RolId)
                .HasConstraintName("FK_RolesModulos_Rol");
        });

        modelBuilder.Entity<TablasMaestra>(entity =>
        {
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.NombreTabla).HasMaxLength(100);
        });

        modelBuilder.Entity<Tarea>(entity =>
        {
            entity.HasKey(e => e.Codigo);

            entity.ToTable("Tarea");

            entity.HasIndex(e => e.Abreviatura, "UQ_Tarea_Abreviatura").IsUnique();

            entity.Property(e => e.Codigo).ValueGeneratedNever();
            entity.Property(e => e.Abreviatura).HasMaxLength(1);
            entity.Property(e => e.Descripcion).HasMaxLength(10);
        });

        modelBuilder.Entity<TiempoUtilizado>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TiempoUt__3214EC07C572054C");

            entity.ToTable("TiempoUtilizado");

            entity.HasIndex(e => e.Fecha, "IX_TiempoUtilizado_Fecha");

            entity.HasIndex(e => e.RepresentanteId, "IX_TiempoUtilizado_RepresentanteId");

            entity.HasIndex(e => e.Status, "IX_TiempoUtilizado_Status");

            entity.HasIndex(e => e.TipoActividadId, "IX_TiempoUtilizado_TipoActividadId");

            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.HorasUtilizadas).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Observaciones).HasMaxLength(1000);
            entity.Property(e => e.Status).HasDefaultValue(false);
            entity.Property(e => e.Turno)
                .HasMaxLength(20)
                .HasDefaultValue("TodoElDia");

            entity.HasOne(d => d.Representante).WithMany(p => p.TiempoUtilizados)
                .HasForeignKey(d => d.RepresentanteId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.TipoActividad).WithMany(p => p.TiempoUtilizados)
                .HasForeignKey(d => d.TipoActividadId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Timeline>(entity =>
        {
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Status).HasDefaultValue(true);
        });

        modelBuilder.Entity<TiposActividad>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TiposAct__3214EC074336A882");

            entity.ToTable("TiposActividad");

            entity.HasIndex(e => e.Activo, "IX_TiposActividad_Activo");

            entity.HasIndex(e => e.Clasificacion, "IX_TiposActividad_Clasificacion");

            entity.HasIndex(e => e.Codigo, "IX_TiposActividad_Codigo");

            entity.HasIndex(e => e.Status, "IX_TiposActividad_Status");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Clasificacion)
                .HasMaxLength(50)
                .HasDefaultValue("Laboral");
            entity.Property(e => e.Codigo).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Icono).HasMaxLength(50);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Status).HasDefaultValue(false);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(e => e.AgenteId, "IX_Usuarios_AgenteId");

            entity.HasIndex(e => e.Email, "IX_Usuarios_Email").IsUnique();

            entity.HasIndex(e => e.EmpresaId, "IX_Usuarios_EmpresaId");

            entity.HasIndex(e => e.RolId, "IX_Usuarios_RolId");

            entity.Property(e => e.Cargo).HasMaxLength(100);
            entity.Property(e => e.Departamento).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.ManagerId).HasMaxLength(450);
            entity.Property(e => e.NombreCompleto).HasMaxLength(200);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.ProveedorSso)
                .HasMaxLength(50)
                .HasColumnName("ProveedorSSO");
            entity.Property(e => e.Ssoid).HasColumnName("SSOId");
            entity.Property(e => e.Telefono).HasMaxLength(50);

            entity.HasOne(d => d.Agente).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.AgenteId)
                .HasConstraintName("FK_Usuarios_Agente");

            entity.HasOne(d => d.Empresa).WithMany(p => p.Usuarios).HasForeignKey(d => d.EmpresaId);

            // Relación con Manager ya configurada en la entidad Manager (líneas 830-832)
            // entity.HasOne(d => d.Manager).WithMany(p => p.Usuarios).HasForeignKey(d => d.ManagerId);

            entity.HasOne(d => d.Rol).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.RolId)
                .HasConstraintName("FK_Usuarios_Rol");
        });

        modelBuilder.Entity<UsuarioRol>(entity =>
        {
            entity.HasIndex(e => e.RolId, "IX_UsuarioRoles_RolId");

            entity.HasIndex(e => e.UsuarioId, "IX_UsuarioRoles_UsuarioId");

            entity.Property(e => e.AsignadoPor).HasMaxLength(255);
            entity.Property(e => e.CreadoPor).HasMaxLength(255);
            entity.Property(e => e.ModificadoPor).HasMaxLength(255);

            entity.HasOne(d => d.Rol).WithMany(p => p.UsuarioRols)
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
