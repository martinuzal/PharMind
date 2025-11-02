using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharMind.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEntidadesDinamicas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EntidadesDinamicas",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EsquemaId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmpresaId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Datos = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntidadesDinamicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntidadesDinamicas_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EntidadesDinamicas_EsquemasPersonalizados_EsquemaId",
                        column: x => x.EsquemaId,
                        principalTable: "EsquemasPersonalizados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EntidadesDinamicas_EmpresaId",
                table: "EntidadesDinamicas",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_EntidadesDinamicas_EsquemaId",
                table: "EntidadesDinamicas",
                column: "EsquemaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EntidadesDinamicas");
        }
    }
}
