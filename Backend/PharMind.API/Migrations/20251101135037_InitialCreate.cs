using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PharMind.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RazonSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CUIT = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Direccion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Modulos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Icono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Ruta = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    ModuloPadreId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modulos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Modulos_Modulos_ModuloPadreId",
                        column: x => x.ModuloPadreId,
                        principalTable: "Modulos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmpresaId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EsSistema = table.Column<bool>(type: "bit", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roles_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmpresaId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    NombreCompleto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Cargo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Departamento = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EmailVerificado = table.Column<bool>(type: "bit", nullable: false),
                    TokenVerificacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TokenRecuperacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TokenRecuperacionExpira = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProveedorSSO = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SSOId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    UltimoAcceso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolModulos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RolId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ModuloId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    NivelAcceso = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PuedeVer = table.Column<bool>(type: "bit", nullable: false),
                    PuedeCrear = table.Column<bool>(type: "bit", nullable: false),
                    PuedeEditar = table.Column<bool>(type: "bit", nullable: false),
                    PuedeEliminar = table.Column<bool>(type: "bit", nullable: false),
                    PuedeExportar = table.Column<bool>(type: "bit", nullable: false),
                    PuedeImportar = table.Column<bool>(type: "bit", nullable: false),
                    PuedeAprobar = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolModulos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolModulos_Modulos_ModuloId",
                        column: x => x.ModuloId,
                        principalTable: "Modulos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolModulos_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UsuarioId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RolId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AsignadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuarioRoles_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UsuarioRoles_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Empresas",
                columns: new[] { "Id", "Activo", "CUIT", "CreadoPor", "Direccion", "Email", "FechaCreacion", "FechaModificacion", "Logo", "ModificadoPor", "Nombre", "RazonSocial", "Status", "Telefono" },
                values: new object[] { "EMP-DEFAULT-001", true, "20-12345678-9", null, null, "info@pharmind.com", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "PharMind", "PharMind S.A.", false, null });

            migrationBuilder.InsertData(
                table: "Modulos",
                columns: new[] { "Id", "Activo", "CreadoPor", "Descripcion", "FechaCreacion", "FechaModificacion", "Icono", "ModificadoPor", "ModuloPadreId", "Nombre", "Orden", "Ruta", "Status" },
                values: new object[,]
                {
                    { "MOD-EMPRESAS-001", true, null, "Gestión de empresas", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "business", null, null, "Empresas", 3, "/empresas", false },
                    { "MOD-ROLES-001", true, null, "Gestión de roles y permisos", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "admin_panel_settings", null, null, "Roles", 2, "/roles", false },
                    { "MOD-USUARIOS-001", true, null, "Gestión de usuarios del sistema", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "people", null, null, "Usuarios", 1, "/usuarios", false }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Activo", "CreadoPor", "Descripcion", "EmpresaId", "EsSistema", "FechaCreacion", "FechaModificacion", "ModificadoPor", "Nombre", "Status" },
                values: new object[] { "ROL-ADMIN-001", true, null, "Acceso total al sistema", "EMP-DEFAULT-001", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Administrador", false });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Activo", "Avatar", "Cargo", "Departamento", "Email", "EmailVerificado", "EmpresaId", "FechaCreacion", "NombreCompleto", "PasswordHash", "ProveedorSSO", "SSOId", "Status", "Telefono", "TokenRecuperacion", "TokenRecuperacionExpira", "TokenVerificacion", "UltimoAcceso" },
                values: new object[] { "USR-ADMIN-001", true, null, null, null, "admin@pharmind.com", true, "EMP-DEFAULT-001", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Administrador del Sistema", "$2a$11$Xw3qYvF5qJKkGZZ2ZQXZ0OqK5qKHJxZHJK5qKHJxZHJK5qKHJxZHJ", null, null, false, null, null, null, null, null });

            migrationBuilder.InsertData(
                table: "RolModulos",
                columns: new[] { "Id", "CreadoPor", "FechaCreacion", "FechaModificacion", "ModificadoPor", "ModuloId", "NivelAcceso", "PuedeAprobar", "PuedeCrear", "PuedeEditar", "PuedeEliminar", "PuedeExportar", "PuedeImportar", "PuedeVer", "RolId", "Status" },
                values: new object[,]
                {
                    { "ROLMOD-ADMIN-EMP-001", null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "MOD-EMPRESAS-001", "Administracion", true, true, true, true, true, true, true, "ROL-ADMIN-001", false },
                    { "ROLMOD-ADMIN-ROL-001", null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "MOD-ROLES-001", "Administracion", true, true, true, true, true, true, true, "ROL-ADMIN-001", false },
                    { "ROLMOD-ADMIN-USR-001", null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "MOD-USUARIOS-001", "Administracion", true, true, true, true, true, true, true, "ROL-ADMIN-001", false }
                });

            migrationBuilder.InsertData(
                table: "UsuarioRoles",
                columns: new[] { "Id", "AsignadoPor", "CreadoPor", "FechaAsignacion", "FechaCreacion", "FechaModificacion", "ModificadoPor", "RolId", "Status", "UsuarioId" },
                values: new object[] { "USRROL-ADMIN-001", null, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "ROL-ADMIN-001", false, "USR-ADMIN-001" });

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_CUIT",
                table: "Empresas",
                column: "CUIT",
                unique: true,
                filter: "[CUIT] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Modulos_ModuloPadreId",
                table: "Modulos",
                column: "ModuloPadreId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_EmpresaId",
                table: "Roles",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_RolModulos_ModuloId",
                table: "RolModulos",
                column: "ModuloId");

            migrationBuilder.CreateIndex(
                name: "IX_RolModulos_RolId",
                table: "RolModulos",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioRoles_RolId",
                table: "UsuarioRoles",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioRoles_UsuarioId",
                table: "UsuarioRoles",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_EmpresaId",
                table: "Usuarios",
                column: "EmpresaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RolModulos");

            migrationBuilder.DropTable(
                name: "UsuarioRoles");

            migrationBuilder.DropTable(
                name: "Modulos");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Empresas");
        }
    }
}
