using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharMind.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuarioIdToEntidadDinamica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UsuarioId",
                table: "EntidadesDinamicas",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EntidadesDinamicas_UsuarioId",
                table: "EntidadesDinamicas",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_EntidadesDinamicas_Usuarios_UsuarioId",
                table: "EntidadesDinamicas",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EntidadesDinamicas_Usuarios_UsuarioId",
                table: "EntidadesDinamicas");

            migrationBuilder.DropIndex(
                name: "IX_EntidadesDinamicas_UsuarioId",
                table: "EntidadesDinamicas");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "EntidadesDinamicas");
        }
    }
}
