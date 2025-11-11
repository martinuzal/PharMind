using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharMind.API.Migrations
{
    /// <inheritdoc />
    public partial class AddInteraccionProductosTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InteraccionMuestrasEntregadas",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InteraccionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProductoId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteraccionMuestrasEntregadas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InteraccionMuestrasEntregadas_Interacciones_InteraccionId",
                        column: x => x.InteraccionId,
                        principalTable: "Interacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InteraccionMuestrasEntregadas_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InteraccionProductosPromocionados",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InteraccionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProductoId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteraccionProductosPromocionados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InteraccionProductosPromocionados_Interacciones_InteraccionId",
                        column: x => x.InteraccionId,
                        principalTable: "Interacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InteraccionProductosPromocionados_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InteraccionProductosSolicitados",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InteraccionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProductoId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteraccionProductosSolicitados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InteraccionProductosSolicitados_Interacciones_InteraccionId",
                        column: x => x.InteraccionId,
                        principalTable: "Interacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InteraccionProductosSolicitados_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InteraccionMuestrasEntregadas_InteraccionId",
                table: "InteraccionMuestrasEntregadas",
                column: "InteraccionId");

            migrationBuilder.CreateIndex(
                name: "IX_InteraccionMuestrasEntregadas_ProductoId",
                table: "InteraccionMuestrasEntregadas",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_InteraccionProductosPromocionados_InteraccionId",
                table: "InteraccionProductosPromocionados",
                column: "InteraccionId");

            migrationBuilder.CreateIndex(
                name: "IX_InteraccionProductosPromocionados_ProductoId",
                table: "InteraccionProductosPromocionados",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_InteraccionProductosSolicitados_InteraccionId",
                table: "InteraccionProductosSolicitados",
                column: "InteraccionId");

            migrationBuilder.CreateIndex(
                name: "IX_InteraccionProductosSolicitados_ProductoId",
                table: "InteraccionProductosSolicitados",
                column: "ProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InteraccionMuestrasEntregadas");

            migrationBuilder.DropTable(
                name: "InteraccionProductosPromocionados");

            migrationBuilder.DropTable(
                name: "InteraccionProductosSolicitados");
        }
    }
}
