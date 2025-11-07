using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharMind.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditPrescripcionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "auditCategory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CdgUsuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CdgPais = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CdgCategoria = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Abreviatura = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Edicion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FechaHoraProc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RawData = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "auditCustomer",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CdgUsuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CdgPais = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CdgCliente = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NombreCliente = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Direccion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Ciudad = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Edicion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FechaHoraProc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RawData = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditCustomer", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "auditMarketMarcas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CdgUsuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CdgPais = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CdgMarca = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NombreMarca = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CdgLaboratorio = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NombreLaboratorio = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Edicion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FechaHoraProc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RawData = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditMarketMarcas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "auditMercados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CdgUsuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CdgPais = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CdgMercado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Closeup = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    Audit = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    Feedback = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    Recetario = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    Generado = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    Controlado = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    Abreviatura = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CdgLabora = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Edicion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FechaHoraProc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditMercados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "auditPeriod",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CdgUsuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CdgPais = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CdgPeriodo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Edicion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FechaHoraProc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RawData = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditPeriod", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "audotProductClass",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CdgUsuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CdgPais = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CdgClaseProducto = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Abreviatura = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Edicion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FechaHoraProc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RawData = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audotProductClass", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoClienteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EntidadDinamicaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CodigoCliente = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RazonSocial = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Especialidad = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Segmento = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InstitucionId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DireccionId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Clientes_Clientes_InstitucionId",
                        column: x => x.InstitucionId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Clientes_Direcciones_DireccionId",
                        column: x => x.DireccionId,
                        principalTable: "Direcciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Clientes_EntidadesDinamicas_EntidadDinamicaId",
                        column: x => x.EntidadDinamicaId,
                        principalTable: "EntidadesDinamicas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Clientes_EsquemasPersonalizados_TipoClienteId",
                        column: x => x.TipoClienteId,
                        principalTable: "EsquemasPersonalizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LineasNegocio",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LegacyCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Legajo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Icono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LineasNegocio", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Managers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UsuarioId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Cargo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaIngreso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LegacyCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Legajo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Managers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Managers_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Regiones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LegacyCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Legajo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Icono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regiones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposActividad",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Clasificacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Icono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    EsSistema = table.Column<bool>(type: "bit", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposActividad", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ManagerLineasNegocio",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ManagerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LineaNegocioId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManagerLineasNegocio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ManagerLineasNegocio_LineasNegocio_LineaNegocioId",
                        column: x => x.LineaNegocioId,
                        principalTable: "LineasNegocio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ManagerLineasNegocio_Managers_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Managers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Distritos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RegionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LegacyCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Legajo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Icono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Distritos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Distritos_Regiones_RegionId",
                        column: x => x.RegionId,
                        principalTable: "Regiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ManagerRegiones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ManagerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RegionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManagerRegiones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ManagerRegiones_Managers_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Managers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ManagerRegiones_Regiones_RegionId",
                        column: x => x.RegionId,
                        principalTable: "Regiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TiempoUtilizado",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RepresentanteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoActividadId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    HorasUtilizadas = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MinutosUtilizados = table.Column<int>(type: "int", nullable: false),
                    Turno = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EsRecurrente = table.Column<bool>(type: "bit", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiempoUtilizado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TiempoUtilizado_TiposActividad_TipoActividadId",
                        column: x => x.TipoActividadId,
                        principalTable: "TiposActividad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TiempoUtilizado_Usuarios_RepresentanteId",
                        column: x => x.RepresentanteId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Agentes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoAgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EntidadDinamicaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CodigoAgente = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RegionId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    DistritoId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    LineaNegocioId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    FechaIngreso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Agentes_Distritos_DistritoId",
                        column: x => x.DistritoId,
                        principalTable: "Distritos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agentes_EntidadesDinamicas_EntidadDinamicaId",
                        column: x => x.EntidadDinamicaId,
                        principalTable: "EntidadesDinamicas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agentes_EsquemasPersonalizados_TipoAgenteId",
                        column: x => x.TipoAgenteId,
                        principalTable: "EsquemasPersonalizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Agentes_LineasNegocio_LineaNegocioId",
                        column: x => x.LineaNegocioId,
                        principalTable: "LineasNegocio",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agentes_Managers_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Managers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agentes_Regiones_RegionId",
                        column: x => x.RegionId,
                        principalTable: "Regiones",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ManagerDistritos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ManagerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DistritoId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManagerDistritos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ManagerDistritos_Distritos_DistritoId",
                        column: x => x.DistritoId,
                        principalTable: "Distritos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ManagerDistritos_Managers_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Managers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditoriaAgentes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoOperacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CampoModificado = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ValorAnterior = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorNuevo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaOperacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioOperacion = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DireccionIP = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditoriaAgentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditoriaAgentes_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Relaciones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoRelacionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EntidadDinamicaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CodigoRelacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClientePrincipalId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClienteSecundario1Id = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ClienteSecundario2Id = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TipoRelacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FrecuenciaVisitas = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Prioridad = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Relaciones_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relaciones_Clientes_ClientePrincipalId",
                        column: x => x.ClientePrincipalId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relaciones_Clientes_ClienteSecundario1Id",
                        column: x => x.ClienteSecundario1Id,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relaciones_Clientes_ClienteSecundario2Id",
                        column: x => x.ClienteSecundario2Id,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relaciones_EntidadesDinamicas_EntidadDinamicaId",
                        column: x => x.EntidadDinamicaId,
                        principalTable: "EntidadesDinamicas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Relaciones_EsquemasPersonalizados_TipoRelacionId",
                        column: x => x.TipoRelacionId,
                        principalTable: "EsquemasPersonalizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Interacciones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoInteraccionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CodigoInteraccion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RelacionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClienteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoInteraccion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Turno = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DuracionMinutos = table.Column<int>(type: "int", nullable: true),
                    Resultado = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ObjetivoVisita = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResumenVisita = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ProximaAccion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaProximaAccion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Latitud = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EntidadDinamicaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interacciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Interacciones_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interacciones_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId",
                        column: x => x.EntidadDinamicaId,
                        principalTable: "EntidadesDinamicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interacciones_EsquemasPersonalizados_TipoInteraccionId",
                        column: x => x.TipoInteraccionId,
                        principalTable: "EsquemasPersonalizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interacciones_Relaciones_RelacionId",
                        column: x => x.RelacionId,
                        principalTable: "Relaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_DistritoId",
                table: "Agentes",
                column: "DistritoId");

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_EntidadDinamicaId",
                table: "Agentes",
                column: "EntidadDinamicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_LineaNegocioId",
                table: "Agentes",
                column: "LineaNegocioId");

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_ManagerId",
                table: "Agentes",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_RegionId",
                table: "Agentes",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_TipoAgenteId",
                table: "Agentes",
                column: "TipoAgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaAgentes_AgenteId",
                table: "AuditoriaAgentes",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_DireccionId",
                table: "Clientes",
                column: "DireccionId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_EntidadDinamicaId",
                table: "Clientes",
                column: "EntidadDinamicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_InstitucionId",
                table: "Clientes",
                column: "InstitucionId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_TipoClienteId",
                table: "Clientes",
                column: "TipoClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Distritos_RegionId",
                table: "Distritos",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Interacciones_AgenteId",
                table: "Interacciones",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Interacciones_ClienteId",
                table: "Interacciones",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Interacciones_EntidadDinamicaId",
                table: "Interacciones",
                column: "EntidadDinamicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Interacciones_RelacionId",
                table: "Interacciones",
                column: "RelacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Interacciones_TipoInteraccionId",
                table: "Interacciones",
                column: "TipoInteraccionId");

            migrationBuilder.CreateIndex(
                name: "IX_ManagerDistritos_DistritoId",
                table: "ManagerDistritos",
                column: "DistritoId");

            migrationBuilder.CreateIndex(
                name: "IX_ManagerDistritos_ManagerId",
                table: "ManagerDistritos",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_ManagerLineasNegocio_LineaNegocioId",
                table: "ManagerLineasNegocio",
                column: "LineaNegocioId");

            migrationBuilder.CreateIndex(
                name: "IX_ManagerLineasNegocio_ManagerId",
                table: "ManagerLineasNegocio",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_ManagerRegiones_ManagerId",
                table: "ManagerRegiones",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_ManagerRegiones_RegionId",
                table: "ManagerRegiones",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Managers_UsuarioId",
                table: "Managers",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Relaciones_AgenteId",
                table: "Relaciones",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Relaciones_ClientePrincipalId",
                table: "Relaciones",
                column: "ClientePrincipalId");

            migrationBuilder.CreateIndex(
                name: "IX_Relaciones_ClienteSecundario1Id",
                table: "Relaciones",
                column: "ClienteSecundario1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Relaciones_ClienteSecundario2Id",
                table: "Relaciones",
                column: "ClienteSecundario2Id");

            migrationBuilder.CreateIndex(
                name: "IX_Relaciones_EntidadDinamicaId",
                table: "Relaciones",
                column: "EntidadDinamicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Relaciones_TipoRelacionId",
                table: "Relaciones",
                column: "TipoRelacionId");

            migrationBuilder.CreateIndex(
                name: "IX_TiempoUtilizado_RepresentanteId",
                table: "TiempoUtilizado",
                column: "RepresentanteId");

            migrationBuilder.CreateIndex(
                name: "IX_TiempoUtilizado_TipoActividadId",
                table: "TiempoUtilizado",
                column: "TipoActividadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "auditCategory");

            migrationBuilder.DropTable(
                name: "auditCustomer");

            migrationBuilder.DropTable(
                name: "auditMarketMarcas");

            migrationBuilder.DropTable(
                name: "auditMercados");

            migrationBuilder.DropTable(
                name: "AuditoriaAgentes");

            migrationBuilder.DropTable(
                name: "auditPeriod");

            migrationBuilder.DropTable(
                name: "audotProductClass");

            migrationBuilder.DropTable(
                name: "Interacciones");

            migrationBuilder.DropTable(
                name: "ManagerDistritos");

            migrationBuilder.DropTable(
                name: "ManagerLineasNegocio");

            migrationBuilder.DropTable(
                name: "ManagerRegiones");

            migrationBuilder.DropTable(
                name: "TiempoUtilizado");

            migrationBuilder.DropTable(
                name: "Relaciones");

            migrationBuilder.DropTable(
                name: "TiposActividad");

            migrationBuilder.DropTable(
                name: "Agentes");

            migrationBuilder.DropTable(
                name: "Clientes");

            migrationBuilder.DropTable(
                name: "Distritos");

            migrationBuilder.DropTable(
                name: "LineasNegocio");

            migrationBuilder.DropTable(
                name: "Managers");

            migrationBuilder.DropTable(
                name: "Regiones");
        }
    }
}
