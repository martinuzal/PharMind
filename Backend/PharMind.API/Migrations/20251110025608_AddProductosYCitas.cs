using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharMind.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProductosYCitas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Distritos_DistritoId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_EsquemasPersonalizados_TipoAgenteId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_LineasNegocio_LineaNegocioId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Managers_ManagerId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Regiones_RegionId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditoriaAgentes_Agentes_AgenteId",
                table: "AuditoriaAgentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Calles_Ciudades_CiudadId",
                table: "Calles");

            migrationBuilder.DropForeignKey(
                name: "FK_Clientes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Clientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Clientes_EsquemasPersonalizados_TipoClienteId",
                table: "Clientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Estados_Paises_PaisId",
                table: "Estados");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_Agentes_AgenteId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_Clientes_ClienteId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_Relaciones_RelacionId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Managers_Usuarios_UsuarioId",
                table: "Managers");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Agentes_AgenteId",
                table: "Relaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Clientes_ClientePrincipalId",
                table: "Relaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario1Id",
                table: "Relaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario2Id",
                table: "Relaciones");

            migrationBuilder.DropIndex(
                name: "IX_Empresas_CUIT",
                table: "Empresas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_auditMercados",
                table: "auditMercados");

            migrationBuilder.DropPrimaryKey(
                name: "PK_auditMarketMarcas",
                table: "auditMarketMarcas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_auditCustomer",
                table: "auditCustomer");

            migrationBuilder.DropPrimaryKey(
                name: "PK_audotProductClass",
                table: "audotProductClass");

            migrationBuilder.DropPrimaryKey(
                name: "PK_auditPeriod",
                table: "auditPeriod");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditoriaAgentes",
                table: "AuditoriaAgentes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_auditCategory",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "CdgLaboratorio",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "CdgMarca",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "CdgPais",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "CdgUsuario",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "Edicion",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "FechaHoraProc",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "NombreLaboratorio",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "NombreMarca",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "auditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "CdgCliente",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "CdgPais",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "CdgUsuario",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "Ciudad",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "Edicion",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "FechaHoraProc",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "NombreCliente",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "Telefono",
                table: "auditCustomer");

            migrationBuilder.DropColumn(
                name: "Abreviatura",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "CdgClaseProducto",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "CdgPais",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "CdgUsuario",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "Edicion",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "FechaHoraProc",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "audotProductClass");

            migrationBuilder.DropColumn(
                name: "CdgPais",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "CdgPeriodo",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "CdgUsuario",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "Edicion",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "FechaFin",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "FechaHoraProc",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "FechaInicio",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "auditPeriod");

            migrationBuilder.DropColumn(
                name: "Abreviatura",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "CdgCategoria",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "CdgPais",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "CdgUsuario",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "Edicion",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "FechaHoraProc",
                table: "auditCategory");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "auditCategory");

            migrationBuilder.RenameTable(
                name: "auditMercados",
                newName: "AuditMercados");

            migrationBuilder.RenameTable(
                name: "auditMarketMarcas",
                newName: "AuditMarketMarcas");

            migrationBuilder.RenameTable(
                name: "auditCustomer",
                newName: "AuditCustomer");

            migrationBuilder.RenameTable(
                name: "audotProductClass",
                newName: "AuditProductClasses");

            migrationBuilder.RenameTable(
                name: "auditPeriod",
                newName: "AuditPeriods");

            migrationBuilder.RenameTable(
                name: "AuditoriaAgentes",
                newName: "AuditoriasAgentes");

            migrationBuilder.RenameTable(
                name: "auditCategory",
                newName: "AuditCategories");

            migrationBuilder.RenameColumn(
                name: "SSOId",
                table: "Usuarios",
                newName: "Ssoid");

            migrationBuilder.RenameColumn(
                name: "ProveedorSSO",
                table: "Usuarios",
                newName: "ProveedorSso");

            migrationBuilder.RenameColumn(
                name: "Orden",
                table: "Modulos",
                newName: "OrdenMenu");

            migrationBuilder.RenameColumn(
                name: "ConfiguracionUI",
                table: "EsquemasPersonalizados",
                newName: "ConfiguracionUi");

            migrationBuilder.RenameColumn(
                name: "CUIT",
                table: "Empresas",
                newName: "Cuit");

            migrationBuilder.RenameColumn(
                name: "DireccionIP",
                table: "AuditoriasAgentes",
                newName: "DireccionIp");

            migrationBuilder.RenameIndex(
                name: "IX_AuditoriaAgentes_AgenteId",
                table: "AuditoriasAgentes",
                newName: "IX_AuditoriasAgentes_AgenteId");

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProveedorSso",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NombreCompleto",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Usuarios",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Departamento",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cargo",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AgenteId",
                table: "Usuarios",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EsAdministrador",
                table: "Usuarios",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ManagerId",
                table: "Usuarios",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RolId",
                table: "Usuarios",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Turno",
                table: "TiempoUtilizado",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "TiempoUtilizado",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "TiempoUtilizado",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "TiempoUtilizado",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "TiempoUtilizado",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NivelAcceso",
                table: "RolModulos",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "RolModulos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "RolModulos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "Roles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoriaId",
                table: "Relaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EspecialidadId",
                table: "Relaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Segment1Id",
                table: "Relaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Segment2Id",
                table: "Relaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Segment3Id",
                table: "Relaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Segment4Id",
                table: "Relaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Segment5Id",
                table: "Relaciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Regiones",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Regiones",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Ruta",
                table: "Modulos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Modulos",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Modulos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "Modulos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Modulos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Modulos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "Modulos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioId",
                table: "Managers",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Managers",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Cargo",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Apellido",
                table: "Managers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "ManagerRegiones",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "ManagerRegiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "ManagerRegiones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "ManagerLineasNegocio",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "ManagerLineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "ManagerLineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "ManagerDistritos",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "ManagerDistritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "ManagerDistritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "LineasNegocio",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "LineasNegocio",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Estados",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Estados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Estados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Estados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SubTipo",
                table: "EsquemasPersonalizados",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "EsquemasPersonalizados",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "EsquemasPersonalizados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "EsquemasPersonalizados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EntidadTipo",
                table: "EsquemasPersonalizados",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "EsquemasPersonalizados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "EsquemasPersonalizados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "EsquemasPersonalizados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CruceAudit",
                table: "EsquemasPersonalizados",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "EntidadesDinamicas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FullDescription",
                table: "EntidadesDinamicas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "EntidadesDinamicas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "EntidadesDinamicas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Empresas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Empresas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Empresas",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Empresas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Empresas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Direccion",
                table: "Empresas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Empresas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cuit",
                table: "Empresas",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Distritos",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Distritos",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "TipoDireccion",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Referencia",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Pais",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Numero",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Colonia",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoPostal",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Ciudad",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Calle",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Apartamento",
                table: "Direcciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Clientes",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Segmento",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(300)",
                oldMaxLength: 300);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Especialidad",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoCliente",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Categoria",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Apellido",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodigoAudit",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Calles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Calles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Calles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Colonia",
                table: "Calles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoPostal",
                table: "Calles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Recetario",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1)",
                oldMaxLength: 1,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Path",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Generado",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1)",
                oldMaxLength: 1,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Feedback",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1)",
                oldMaxLength: 1,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FechaHoraProc",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Edicion",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Controlado",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1)",
                oldMaxLength: 1,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Closeup",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1)",
                oldMaxLength: 1,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgUsuario",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgPais",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgMercado",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgLabora",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Audit",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1)",
                oldMaxLength: 1,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Abreviatura",
                table: "AuditMercados",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "AuditMarketMarcas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "AuditMarketMarcas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodigoPmix",
                table: "AuditMarketMarcas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "AuditMarketMarcas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Siglalab",
                table: "AuditMarketMarcas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bairro",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Blank",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CDGMED_REG",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CDGMED_VIS",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CDGREG_PMIX",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cdgesp1",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cdgesp2",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cep",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Crm",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Local",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "AuditCustomer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Agentes",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "FechaIngreso",
                table: "Agentes",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoAgente",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Apellido",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodigoDistrito",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodigoLineaNegocio",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistritoNombre",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LineaNegocioNombre",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupervisorId",
                table: "Agentes",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TimelineId",
                table: "Agentes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ZonaGeografica",
                table: "Agentes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "AuditProductClasses",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgMercado",
                table: "AuditProductClasses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodigoPmix",
                table: "AuditProductClasses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "AuditPeriods",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Blank",
                table: "AuditPeriods",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPeruser",
                table: "AuditPeriods",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Desc",
                table: "AuditPeriods",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioOperacion",
                table: "AuditoriasAgentes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "TipoOperacion",
                table: "AuditoriasAgentes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "DireccionIp",
                table: "AuditoriasAgentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "AuditoriasAgentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CampoModificado",
                table: "AuditoriasAgentes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cat",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgMercado",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPeruser",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgRaiz",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgmedReg",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgregPmix",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MerMs",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Px",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PxLab",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PxMer",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PxMs",
                table: "AuditCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditMercados",
                table: "AuditMercados",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditMarketMarcas",
                table: "AuditMarketMarcas",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditCustomer",
                table: "AuditCustomer",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditProductClasses",
                table: "AuditProductClasses",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditPeriods",
                table: "AuditPeriods",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditoriasAgentes",
                table: "AuditoriasAgentes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditCategories",
                table: "AuditCategories",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Citas",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CodigoCita = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RelacionId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ClienteId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    InteraccionId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TodoElDia = table.Column<bool>(type: "bit", nullable: false),
                    TipoCita = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Prioridad = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Ubicacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Latitud = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Recordatorio = table.Column<bool>(type: "bit", nullable: false),
                    MinutosAntes = table.Column<int>(type: "int", nullable: false),
                    Notas = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Orden = table.Column<int>(type: "int", nullable: true),
                    DistanciaKm = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TiempoEstimadoMinutos = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Citas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Citas_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Citas_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Citas_Interacciones_InteraccionId",
                        column: x => x.InteraccionId,
                        principalTable: "Interacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Citas_Relaciones_RelacionId",
                        column: x => x.RelacionId,
                        principalTable: "Relaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Ciudade",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstadoId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CodigoPostal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ciudade", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ciudade_Estados_EstadoId",
                        column: x => x.EstadoId,
                        principalTable: "Estados",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Paise",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Paise", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CodigoProducto = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NombreComercial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Presentacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Laboratorio = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PrincipioActivo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Concentracion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ViaAdministracion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Indicaciones = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Contraindicaciones = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PrecioReferencia = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ImagenUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    EsMuestra = table.Column<bool>(type: "bit", nullable: false),
                    RequiereReceta = table.Column<bool>(type: "bit", nullable: false),
                    LineaNegocioId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Productos_LineasNegocio_LineaNegocioId",
                        column: x => x.LineaNegocioId,
                        principalTable: "LineasNegocio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Relacione",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CodigoRelacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClientePrincipalId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClienteSecundario1Id = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ClienteSecundario2Id = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TipoRelacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaFin = table.Column<DateOnly>(type: "date", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FrecuenciaVisitas = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Prioridad = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    TipoRelacionId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntidadDinamicaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    EspecialidadId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CategoriaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Segment1Id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Segment2Id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Segment3Id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Segment4Id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Segment5Id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoRelacionNavigationId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relacione", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Relacione_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relacione_Clientes_ClientePrincipalId",
                        column: x => x.ClientePrincipalId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relacione_Clientes_ClienteSecundario1Id",
                        column: x => x.ClienteSecundario1Id,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relacione_Clientes_ClienteSecundario2Id",
                        column: x => x.ClienteSecundario2Id,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Relacione_EntidadesDinamicas_EntidadDinamicaId",
                        column: x => x.EntidadDinamicaId,
                        principalTable: "EntidadesDinamicas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Relacione_EsquemasPersonalizados_TipoRelacionNavigationId",
                        column: x => x.TipoRelacionNavigationId,
                        principalTable: "EsquemasPersonalizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolesModulo",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RolId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModuloId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PuedeVer = table.Column<bool>(type: "bit", nullable: false),
                    PuedeCrear = table.Column<bool>(type: "bit", nullable: false),
                    PuedeEditar = table.Column<bool>(type: "bit", nullable: false),
                    PuedeEliminar = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true),
                    PuedeExportar = table.Column<bool>(type: "bit", nullable: false),
                    PuedeImportar = table.Column<bool>(type: "bit", nullable: false),
                    PuedeAprobar = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolesModulo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolesModulo_Modulos_ModuloId",
                        column: x => x.ModuloId,
                        principalTable: "Modulos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Timelines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Anio = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    EsDefault = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Timelines", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventariosAgente",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProductoId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CantidadDisponible = table.Column<int>(type: "int", nullable: false),
                    CantidadInicial = table.Column<int>(type: "int", nullable: true),
                    CantidadEntregada = table.Column<int>(type: "int", nullable: false),
                    FechaUltimaRecarga = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LoteActual = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventariosAgente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventariosAgente_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventariosAgente_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MuestrasMedicas",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InteraccionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProductoId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClienteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    Lote = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaEntrega = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FirmaDigital = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FotoComprobante = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MuestrasMedicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MuestrasMedicas_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MuestrasMedicas_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MuestrasMedicas_Interacciones_InteraccionId",
                        column: x => x.InteraccionId,
                        principalTable: "Interacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MuestrasMedicas_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Interaccione",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CodigoInteraccion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RelacionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClienteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoInteraccion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Turno = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DuracionMinutos = table.Column<int>(type: "int", nullable: true),
                    Resultado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ObjetivoVisita = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResumenVisita = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProximaAccion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaProximaAccion = table.Column<DateOnly>(type: "date", nullable: true),
                    Latitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    EntidadDinamicaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TipoInteraccionId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipoInteraccionNavigationId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EntidadesDinamicaId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interaccione", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Interaccione_Agentes_AgenteId",
                        column: x => x.AgenteId,
                        principalTable: "Agentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interaccione_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interaccione_EntidadesDinamicas_EntidadDinamicaId",
                        column: x => x.EntidadDinamicaId,
                        principalTable: "EntidadesDinamicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interaccione_EntidadesDinamicas_EntidadesDinamicaId",
                        column: x => x.EntidadesDinamicaId,
                        principalTable: "EntidadesDinamicas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Interaccione_EsquemasPersonalizados_TipoInteraccionNavigationId",
                        column: x => x.TipoInteraccionNavigationId,
                        principalTable: "EsquemasPersonalizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interaccione_Relacione_RelacionId",
                        column: x => x.RelacionId,
                        principalTable: "Relacione",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Periods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TimelineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Periods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Periods_Timelines_TimelineId",
                        column: x => x.TimelineId,
                        principalTable: "Timelines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosInventario",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InventarioAgenteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TipoMovimiento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    CantidadAnterior = table.Column<int>(type: "int", nullable: false),
                    CantidadNueva = table.Column<int>(type: "int", nullable: false),
                    MuestraMedicaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Motivo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaMovimiento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosInventario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosInventario_InventariosAgente_InventarioAgenteId",
                        column: x => x.InventarioAgenteId,
                        principalTable: "InventariosAgente",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosInventario_MuestrasMedicas_MuestraMedicaId",
                        column: x => x.MuestraMedicaId,
                        principalTable: "MuestrasMedicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Modulos",
                keyColumn: "Id",
                keyValue: "MOD-EMPRESAS-001",
                column: "Codigo",
                value: "EMPRESAS");

            migrationBuilder.UpdateData(
                table: "Modulos",
                keyColumn: "Id",
                keyValue: "MOD-ROLES-001",
                column: "Codigo",
                value: "ROLES");

            migrationBuilder.UpdateData(
                table: "Modulos",
                keyColumn: "Id",
                keyValue: "MOD-USUARIOS-001",
                column: "Codigo",
                value: "USUARIOS");

            migrationBuilder.UpdateData(
                table: "RolModulos",
                keyColumn: "Id",
                keyValue: "ROLMOD-ADMIN-EMP-001",
                columns: new[] { "NivelAcceso", "PuedeAprobar", "PuedeExportar", "PuedeImportar" },
                values: new object[] { "Completo", false, false, false });

            migrationBuilder.UpdateData(
                table: "RolModulos",
                keyColumn: "Id",
                keyValue: "ROLMOD-ADMIN-ROL-001",
                columns: new[] { "NivelAcceso", "PuedeAprobar", "PuedeExportar", "PuedeImportar" },
                values: new object[] { "Completo", false, false, false });

            migrationBuilder.UpdateData(
                table: "RolModulos",
                keyColumn: "Id",
                keyValue: "ROLMOD-ADMIN-USR-001",
                columns: new[] { "NivelAcceso", "PuedeAprobar", "PuedeExportar", "PuedeImportar" },
                values: new object[] { "Completo", false, false, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "ROL-ADMIN-001",
                column: "Codigo",
                value: "");

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: "USR-ADMIN-001",
                columns: new[] { "AgenteId", "EsAdministrador", "ManagerId", "RolId" },
                values: new object[] { null, false, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_AgenteId",
                table: "Usuarios",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_ManagerId",
                table: "Usuarios",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_RolId",
                table: "Usuarios",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Cuit",
                table: "Empresas",
                column: "Cuit",
                unique: true,
                filter: "[Cuit] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_SupervisorId",
                table: "Agentes",
                column: "SupervisorId");

            migrationBuilder.CreateIndex(
                name: "IX_Agentes_TimelineId",
                table: "Agentes",
                column: "TimelineId");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_AgenteId",
                table: "Citas",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_ClienteId",
                table: "Citas",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_CodigoCita",
                table: "Citas",
                column: "CodigoCita",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Citas_InteraccionId",
                table: "Citas",
                column: "InteraccionId");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_RelacionId",
                table: "Citas",
                column: "RelacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Ciudade_EstadoId",
                table: "Ciudade",
                column: "EstadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Interaccione_AgenteId",
                table: "Interaccione",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Interaccione_ClienteId",
                table: "Interaccione",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Interaccione_EntidadDinamicaId",
                table: "Interaccione",
                column: "EntidadDinamicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Interaccione_EntidadesDinamicaId",
                table: "Interaccione",
                column: "EntidadesDinamicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Interaccione_RelacionId",
                table: "Interaccione",
                column: "RelacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Interaccione_TipoInteraccionNavigationId",
                table: "Interaccione",
                column: "TipoInteraccionNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosAgente_AgenteId_ProductoId",
                table: "InventariosAgente",
                columns: new[] { "AgenteId", "ProductoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventariosAgente_ProductoId",
                table: "InventariosAgente",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventario_InventarioAgenteId",
                table: "MovimientosInventario",
                column: "InventarioAgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventario_MuestraMedicaId",
                table: "MovimientosInventario",
                column: "MuestraMedicaId");

            migrationBuilder.CreateIndex(
                name: "IX_MuestrasMedicas_AgenteId",
                table: "MuestrasMedicas",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_MuestrasMedicas_ClienteId",
                table: "MuestrasMedicas",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_MuestrasMedicas_InteraccionId",
                table: "MuestrasMedicas",
                column: "InteraccionId");

            migrationBuilder.CreateIndex(
                name: "IX_MuestrasMedicas_ProductoId",
                table: "MuestrasMedicas",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_Periods_TimelineId",
                table: "Periods",
                column: "TimelineId");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_CodigoProducto",
                table: "Productos",
                column: "CodigoProducto",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Productos_LineaNegocioId",
                table: "Productos",
                column: "LineaNegocioId");

            migrationBuilder.CreateIndex(
                name: "IX_Relacione_AgenteId",
                table: "Relacione",
                column: "AgenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Relacione_ClientePrincipalId",
                table: "Relacione",
                column: "ClientePrincipalId");

            migrationBuilder.CreateIndex(
                name: "IX_Relacione_ClienteSecundario1Id",
                table: "Relacione",
                column: "ClienteSecundario1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Relacione_ClienteSecundario2Id",
                table: "Relacione",
                column: "ClienteSecundario2Id");

            migrationBuilder.CreateIndex(
                name: "IX_Relacione_EntidadDinamicaId",
                table: "Relacione",
                column: "EntidadDinamicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Relacione_TipoRelacionNavigationId",
                table: "Relacione",
                column: "TipoRelacionNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_RolesModulo_ModuloId",
                table: "RolesModulo",
                column: "ModuloId");

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Distritos_DistritoId",
                table: "Agentes",
                column: "DistritoId",
                principalTable: "Distritos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Agentes",
                column: "EntidadDinamicaId",
                principalTable: "EntidadesDinamicas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_EsquemasPersonalizados_TipoAgenteId",
                table: "Agentes",
                column: "TipoAgenteId",
                principalTable: "EsquemasPersonalizados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_LineasNegocio_LineaNegocioId",
                table: "Agentes",
                column: "LineaNegocioId",
                principalTable: "LineasNegocio",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Managers_ManagerId",
                table: "Agentes",
                column: "ManagerId",
                principalTable: "Managers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Regiones_RegionId",
                table: "Agentes",
                column: "RegionId",
                principalTable: "Regiones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Timelines_TimelineId",
                table: "Agentes",
                column: "TimelineId",
                principalTable: "Timelines",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Usuarios_SupervisorId",
                table: "Agentes",
                column: "SupervisorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AuditoriasAgentes_Agentes_AgenteId",
                table: "AuditoriasAgentes",
                column: "AgenteId",
                principalTable: "Agentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Calles_Ciudade_CiudadId",
                table: "Calles",
                column: "CiudadId",
                principalTable: "Ciudade",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Clientes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Clientes",
                column: "EntidadDinamicaId",
                principalTable: "EntidadesDinamicas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Clientes_EsquemasPersonalizados_TipoClienteId",
                table: "Clientes",
                column: "TipoClienteId",
                principalTable: "EsquemasPersonalizados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Estados_Paise_PaisId",
                table: "Estados",
                column: "PaisId",
                principalTable: "Paise",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_Agentes_AgenteId",
                table: "Interacciones",
                column: "AgenteId",
                principalTable: "Agentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_Clientes_ClienteId",
                table: "Interacciones",
                column: "ClienteId",
                principalTable: "Clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId",
                table: "Interacciones",
                column: "EntidadDinamicaId",
                principalTable: "EntidadesDinamicas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_Relaciones_RelacionId",
                table: "Interacciones",
                column: "RelacionId",
                principalTable: "Relaciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Managers_Usuarios_UsuarioId",
                table: "Managers",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Agentes_AgenteId",
                table: "Relaciones",
                column: "AgenteId",
                principalTable: "Agentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Clientes_ClientePrincipalId",
                table: "Relaciones",
                column: "ClientePrincipalId",
                principalTable: "Clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario1Id",
                table: "Relaciones",
                column: "ClienteSecundario1Id",
                principalTable: "Clientes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario2Id",
                table: "Relaciones",
                column: "ClienteSecundario2Id",
                principalTable: "Clientes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Agentes_AgenteId",
                table: "Usuarios",
                column: "AgenteId",
                principalTable: "Agentes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Managers_ManagerId",
                table: "Usuarios",
                column: "ManagerId",
                principalTable: "Managers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Roles_RolId",
                table: "Usuarios",
                column: "RolId",
                principalTable: "Roles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Distritos_DistritoId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_EsquemasPersonalizados_TipoAgenteId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_LineasNegocio_LineaNegocioId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Managers_ManagerId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Regiones_RegionId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Timelines_TimelineId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Agentes_Usuarios_SupervisorId",
                table: "Agentes");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditoriasAgentes_Agentes_AgenteId",
                table: "AuditoriasAgentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Calles_Ciudade_CiudadId",
                table: "Calles");

            migrationBuilder.DropForeignKey(
                name: "FK_Clientes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Clientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Clientes_EsquemasPersonalizados_TipoClienteId",
                table: "Clientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Estados_Paise_PaisId",
                table: "Estados");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_Agentes_AgenteId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_Clientes_ClienteId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Interacciones_Relaciones_RelacionId",
                table: "Interacciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Managers_Usuarios_UsuarioId",
                table: "Managers");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Agentes_AgenteId",
                table: "Relaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Clientes_ClientePrincipalId",
                table: "Relaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario1Id",
                table: "Relaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario2Id",
                table: "Relaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Agentes_AgenteId",
                table: "Usuarios");

            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Managers_ManagerId",
                table: "Usuarios");

            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Roles_RolId",
                table: "Usuarios");

            migrationBuilder.DropTable(
                name: "Citas");

            migrationBuilder.DropTable(
                name: "Ciudade");

            migrationBuilder.DropTable(
                name: "Interaccione");

            migrationBuilder.DropTable(
                name: "MovimientosInventario");

            migrationBuilder.DropTable(
                name: "Paise");

            migrationBuilder.DropTable(
                name: "Periods");

            migrationBuilder.DropTable(
                name: "RolesModulo");

            migrationBuilder.DropTable(
                name: "Relacione");

            migrationBuilder.DropTable(
                name: "InventariosAgente");

            migrationBuilder.DropTable(
                name: "MuestrasMedicas");

            migrationBuilder.DropTable(
                name: "Timelines");

            migrationBuilder.DropTable(
                name: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_AgenteId",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_ManagerId",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_RolId",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Empresas_Cuit",
                table: "Empresas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditMercados",
                table: "AuditMercados");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditMarketMarcas",
                table: "AuditMarketMarcas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditCustomer",
                table: "AuditCustomer");

            migrationBuilder.DropIndex(
                name: "IX_Agentes_SupervisorId",
                table: "Agentes");

            migrationBuilder.DropIndex(
                name: "IX_Agentes_TimelineId",
                table: "Agentes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditProductClasses",
                table: "AuditProductClasses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditPeriods",
                table: "AuditPeriods");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditoriasAgentes",
                table: "AuditoriasAgentes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AuditCategories",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "AgenteId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "EsAdministrador",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "ManagerId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "RolId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "CategoriaId",
                table: "Relaciones");

            migrationBuilder.DropColumn(
                name: "EspecialidadId",
                table: "Relaciones");

            migrationBuilder.DropColumn(
                name: "Segment1Id",
                table: "Relaciones");

            migrationBuilder.DropColumn(
                name: "Segment2Id",
                table: "Relaciones");

            migrationBuilder.DropColumn(
                name: "Segment3Id",
                table: "Relaciones");

            migrationBuilder.DropColumn(
                name: "Segment4Id",
                table: "Relaciones");

            migrationBuilder.DropColumn(
                name: "Segment5Id",
                table: "Relaciones");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "Modulos");

            migrationBuilder.DropColumn(
                name: "CruceAudit",
                table: "EsquemasPersonalizados");

            migrationBuilder.DropColumn(
                name: "CodigoAudit",
                table: "Clientes");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "AuditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "CodigoPmix",
                table: "AuditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "Nome",
                table: "AuditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "Siglalab",
                table: "AuditMarketMarcas");

            migrationBuilder.DropColumn(
                name: "Bairro",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "Blank",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "CDGMED_REG",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "CDGMED_VIS",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "CDGREG_PMIX",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "Cdgesp1",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "Cdgesp2",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "Cep",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "Crm",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "Local",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "Nome",
                table: "AuditCustomer");

            migrationBuilder.DropColumn(
                name: "CodigoDistrito",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "CodigoLineaNegocio",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "DistritoNombre",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "LineaNegocioNombre",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "SupervisorId",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "TimelineId",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "ZonaGeografica",
                table: "Agentes");

            migrationBuilder.DropColumn(
                name: "CdgMercado",
                table: "AuditProductClasses");

            migrationBuilder.DropColumn(
                name: "CodigoPmix",
                table: "AuditProductClasses");

            migrationBuilder.DropColumn(
                name: "Blank",
                table: "AuditPeriods");

            migrationBuilder.DropColumn(
                name: "CdgPeruser",
                table: "AuditPeriods");

            migrationBuilder.DropColumn(
                name: "Desc",
                table: "AuditPeriods");

            migrationBuilder.DropColumn(
                name: "Cat",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "CdgMercado",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "CdgPeruser",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "CdgRaiz",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "CdgmedReg",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "CdgregPmix",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "MerMs",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "Px",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "PxLab",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "PxMer",
                table: "AuditCategories");

            migrationBuilder.DropColumn(
                name: "PxMs",
                table: "AuditCategories");

            migrationBuilder.RenameTable(
                name: "AuditMercados",
                newName: "auditMercados");

            migrationBuilder.RenameTable(
                name: "AuditMarketMarcas",
                newName: "auditMarketMarcas");

            migrationBuilder.RenameTable(
                name: "AuditCustomer",
                newName: "auditCustomer");

            migrationBuilder.RenameTable(
                name: "AuditProductClasses",
                newName: "audotProductClass");

            migrationBuilder.RenameTable(
                name: "AuditPeriods",
                newName: "auditPeriod");

            migrationBuilder.RenameTable(
                name: "AuditoriasAgentes",
                newName: "AuditoriaAgentes");

            migrationBuilder.RenameTable(
                name: "AuditCategories",
                newName: "auditCategory");

            migrationBuilder.RenameColumn(
                name: "Ssoid",
                table: "Usuarios",
                newName: "SSOId");

            migrationBuilder.RenameColumn(
                name: "ProveedorSso",
                table: "Usuarios",
                newName: "ProveedorSSO");

            migrationBuilder.RenameColumn(
                name: "OrdenMenu",
                table: "Modulos",
                newName: "Orden");

            migrationBuilder.RenameColumn(
                name: "ConfiguracionUi",
                table: "EsquemasPersonalizados",
                newName: "ConfiguracionUI");

            migrationBuilder.RenameColumn(
                name: "Cuit",
                table: "Empresas",
                newName: "CUIT");

            migrationBuilder.RenameColumn(
                name: "DireccionIp",
                table: "AuditoriaAgentes",
                newName: "DireccionIP");

            migrationBuilder.RenameIndex(
                name: "IX_AuditoriasAgentes_AgenteId",
                table: "AuditoriaAgentes",
                newName: "IX_AuditoriaAgentes_AgenteId");

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Usuarios",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProveedorSSO",
                table: "Usuarios",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Usuarios",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NombreCompleto",
                table: "Usuarios",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Usuarios",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Departamento",
                table: "Usuarios",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cargo",
                table: "Usuarios",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Turno",
                table: "TiempoUtilizado",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "TiempoUtilizado",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "TiempoUtilizado",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "TiempoUtilizado",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "TiempoUtilizado",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NivelAcceso",
                table: "RolModulos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "RolModulos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "RolModulos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Regiones",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Regiones",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Regiones",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "Regiones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "Regiones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "Regiones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Regiones",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Regiones",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "Regiones",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Regiones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Ruta",
                table: "Modulos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Modulos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Modulos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "Modulos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Modulos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Modulos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioId",
                table: "Managers",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Managers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Managers",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "Managers",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Managers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Managers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "Managers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "Managers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Managers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Managers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Managers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Cargo",
                table: "Managers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Apellido",
                table: "Managers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "ManagerRegiones",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "ManagerRegiones",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "ManagerRegiones",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "ManagerLineasNegocio",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "ManagerLineasNegocio",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "ManagerLineasNegocio",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "ManagerDistritos",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "ManagerDistritos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "ManagerDistritos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "LineasNegocio",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "LineasNegocio",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "LineasNegocio",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "LineasNegocio",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "LineasNegocio",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "LineasNegocio",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "LineasNegocio",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "LineasNegocio",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "LineasNegocio",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "LineasNegocio",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Estados",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Estados",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Estados",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Estados",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SubTipo",
                table: "EsquemasPersonalizados",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "EsquemasPersonalizados",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "EsquemasPersonalizados",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "EsquemasPersonalizados",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EntidadTipo",
                table: "EsquemasPersonalizados",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "EsquemasPersonalizados",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "EsquemasPersonalizados",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "EsquemasPersonalizados",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "EntidadesDinamicas",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FullDescription",
                table: "EntidadesDinamicas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "EntidadesDinamicas",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "EntidadesDinamicas",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Empresas",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Empresas",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Empresas",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Empresas",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Empresas",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Direccion",
                table: "Empresas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CUIT",
                table: "Empresas",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Empresas",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Distritos",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Distritos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Distritos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Legajo",
                table: "Distritos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LegacyCode",
                table: "Distritos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Icono",
                table: "Distritos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Distritos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Distritos",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "Distritos",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "Distritos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "TipoDireccion",
                table: "Direcciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Referencia",
                table: "Direcciones",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Pais",
                table: "Direcciones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Numero",
                table: "Direcciones",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Direcciones",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "Direcciones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Direcciones",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Colonia",
                table: "Direcciones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoPostal",
                table: "Direcciones",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Ciudad",
                table: "Direcciones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Calle",
                table: "Direcciones",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Apartamento",
                table: "Direcciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Clientes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Clientes",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Segmento",
                table: "Clientes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Clientes",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Clientes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Clientes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "Clientes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Especialidad",
                table: "Clientes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Clientes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Clientes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoCliente",
                table: "Clientes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Categoria",
                table: "Clientes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Apellido",
                table: "Clientes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Calles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Calles",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Calles",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Colonia",
                table: "Calles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoPostal",
                table: "Calles",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Recetario",
                table: "auditMercados",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Path",
                table: "auditMercados",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Generado",
                table: "auditMercados",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Feedback",
                table: "auditMercados",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FechaHoraProc",
                table: "auditMercados",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Edicion",
                table: "auditMercados",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "auditMercados",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Controlado",
                table: "auditMercados",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Closeup",
                table: "auditMercados",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgUsuario",
                table: "auditMercados",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgPais",
                table: "auditMercados",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgMercado",
                table: "auditMercados",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CdgLabora",
                table: "auditMercados",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Audit",
                table: "auditMercados",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Abreviatura",
                table: "auditMercados",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "auditMarketMarcas",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgLaboratorio",
                table: "auditMarketMarcas",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgMarca",
                table: "auditMarketMarcas",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPais",
                table: "auditMarketMarcas",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgUsuario",
                table: "auditMarketMarcas",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Edicion",
                table: "auditMarketMarcas",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FechaHoraProc",
                table: "auditMarketMarcas",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreLaboratorio",
                table: "auditMarketMarcas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreMarca",
                table: "auditMarketMarcas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "auditMarketMarcas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "auditCustomer",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgCliente",
                table: "auditCustomer",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPais",
                table: "auditCustomer",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgUsuario",
                table: "auditCustomer",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ciudad",
                table: "auditCustomer",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "auditCustomer",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Edicion",
                table: "auditCustomer",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FechaHoraProc",
                table: "auditCustomer",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreCliente",
                table: "auditCustomer",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "auditCustomer",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Telefono",
                table: "auditCustomer",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Agentes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Agentes",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "Agentes",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Agentes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ModificadoPor",
                table: "Agentes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaIngreso",
                table: "Agentes",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Agentes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Agentes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoAgente",
                table: "Agentes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Apellido",
                table: "Agentes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "audotProductClass",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Abreviatura",
                table: "audotProductClass",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgClaseProducto",
                table: "audotProductClass",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPais",
                table: "audotProductClass",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgUsuario",
                table: "audotProductClass",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "audotProductClass",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Edicion",
                table: "audotProductClass",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FechaHoraProc",
                table: "audotProductClass",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "audotProductClass",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "auditPeriod",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPais",
                table: "auditPeriod",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPeriodo",
                table: "auditPeriod",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgUsuario",
                table: "auditPeriod",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "auditPeriod",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Edicion",
                table: "auditPeriod",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaFin",
                table: "auditPeriod",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FechaHoraProc",
                table: "auditPeriod",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaInicio",
                table: "auditPeriod",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "auditPeriod",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioOperacion",
                table: "AuditoriaAgentes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "TipoOperacion",
                table: "AuditoriaAgentes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "DireccionIP",
                table: "AuditoriaAgentes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "AuditoriaAgentes",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CampoModificado",
                table: "AuditoriaAgentes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RawData",
                table: "auditCategory",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Abreviatura",
                table: "auditCategory",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgCategoria",
                table: "auditCategory",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgPais",
                table: "auditCategory",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CdgUsuario",
                table: "auditCategory",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "auditCategory",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Edicion",
                table: "auditCategory",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FechaHoraProc",
                table: "auditCategory",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "auditCategory",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_auditMercados",
                table: "auditMercados",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_auditMarketMarcas",
                table: "auditMarketMarcas",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_auditCustomer",
                table: "auditCustomer",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_audotProductClass",
                table: "audotProductClass",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_auditPeriod",
                table: "auditPeriod",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AuditoriaAgentes",
                table: "AuditoriaAgentes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_auditCategory",
                table: "auditCategory",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "RolModulos",
                keyColumn: "Id",
                keyValue: "ROLMOD-ADMIN-EMP-001",
                columns: new[] { "NivelAcceso", "PuedeAprobar", "PuedeExportar", "PuedeImportar" },
                values: new object[] { "Administracion", true, true, true });

            migrationBuilder.UpdateData(
                table: "RolModulos",
                keyColumn: "Id",
                keyValue: "ROLMOD-ADMIN-ROL-001",
                columns: new[] { "NivelAcceso", "PuedeAprobar", "PuedeExportar", "PuedeImportar" },
                values: new object[] { "Administracion", true, true, true });

            migrationBuilder.UpdateData(
                table: "RolModulos",
                keyColumn: "Id",
                keyValue: "ROLMOD-ADMIN-USR-001",
                columns: new[] { "NivelAcceso", "PuedeAprobar", "PuedeExportar", "PuedeImportar" },
                values: new object[] { "Administracion", true, true, true });

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_CUIT",
                table: "Empresas",
                column: "CUIT",
                unique: true,
                filter: "[CUIT] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Distritos_DistritoId",
                table: "Agentes",
                column: "DistritoId",
                principalTable: "Distritos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Agentes",
                column: "EntidadDinamicaId",
                principalTable: "EntidadesDinamicas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_EsquemasPersonalizados_TipoAgenteId",
                table: "Agentes",
                column: "TipoAgenteId",
                principalTable: "EsquemasPersonalizados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_LineasNegocio_LineaNegocioId",
                table: "Agentes",
                column: "LineaNegocioId",
                principalTable: "LineasNegocio",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Managers_ManagerId",
                table: "Agentes",
                column: "ManagerId",
                principalTable: "Managers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Agentes_Regiones_RegionId",
                table: "Agentes",
                column: "RegionId",
                principalTable: "Regiones",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditoriaAgentes_Agentes_AgenteId",
                table: "AuditoriaAgentes",
                column: "AgenteId",
                principalTable: "Agentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Calles_Ciudades_CiudadId",
                table: "Calles",
                column: "CiudadId",
                principalTable: "Ciudades",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Clientes_EntidadesDinamicas_EntidadDinamicaId",
                table: "Clientes",
                column: "EntidadDinamicaId",
                principalTable: "EntidadesDinamicas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Clientes_EsquemasPersonalizados_TipoClienteId",
                table: "Clientes",
                column: "TipoClienteId",
                principalTable: "EsquemasPersonalizados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Estados_Paises_PaisId",
                table: "Estados",
                column: "PaisId",
                principalTable: "Paises",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_Agentes_AgenteId",
                table: "Interacciones",
                column: "AgenteId",
                principalTable: "Agentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_Clientes_ClienteId",
                table: "Interacciones",
                column: "ClienteId",
                principalTable: "Clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId",
                table: "Interacciones",
                column: "EntidadDinamicaId",
                principalTable: "EntidadesDinamicas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Interacciones_Relaciones_RelacionId",
                table: "Interacciones",
                column: "RelacionId",
                principalTable: "Relaciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Managers_Usuarios_UsuarioId",
                table: "Managers",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Agentes_AgenteId",
                table: "Relaciones",
                column: "AgenteId",
                principalTable: "Agentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Clientes_ClientePrincipalId",
                table: "Relaciones",
                column: "ClientePrincipalId",
                principalTable: "Clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario1Id",
                table: "Relaciones",
                column: "ClienteSecundario1Id",
                principalTable: "Clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Relaciones_Clientes_ClienteSecundario2Id",
                table: "Relaciones",
                column: "ClienteSecundario2Id",
                principalTable: "Clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
