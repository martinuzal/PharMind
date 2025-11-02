using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharMind.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEsquemasPersonalizados : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EsquemasPersonalizados",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmpresaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    EntidadTipo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubTipo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Icono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Schema = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReglasValidacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReglasCorrelacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConfiguracionUI = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_EsquemasPersonalizados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EsquemasPersonalizados_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: "USR-ADMIN-001",
                column: "PasswordHash",
                value: "$2a$11$HvE3qX5WzLJKN5/9YJX0x.JYWZXzJK5qKHJxZHJK5qKHJxZHJK5q.");

            migrationBuilder.CreateIndex(
                name: "IX_EsquemasPersonalizados_EmpresaId_EntidadTipo_SubTipo",
                table: "EsquemasPersonalizados",
                columns: new[] { "EmpresaId", "EntidadTipo", "SubTipo" },
                unique: true,
                filter: "[EmpresaId] IS NOT NULL AND [SubTipo] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EsquemasPersonalizados");

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: "USR-ADMIN-001",
                column: "PasswordHash",
                value: "$2a$11$Xw3qYvF5qJKkGZZ2ZQXZ0OqK5qKHJxZHJK5qKHJxZHJK5qKHJxZHJ");
        }
    }
}
