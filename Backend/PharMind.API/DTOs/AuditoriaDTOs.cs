using System.Collections.Generic;

namespace PharMind.API.DTOs
{
    // DTO para Portfolio BEB (multi-mercado)
    public class PortfolioBEBDTO
    {
        public string CdgMercado { get; set; } = string.Empty;
        public string MercadoNombre { get; set; } = string.Empty;
        public string? MercadoAbrev { get; set; }
        public int ProductosBEB { get; set; }
        public int PrescripcionesBEB { get; set; }
        public int MedicosBEB { get; set; }
        public int PX_BEB { get; set; }
        public int ProductosTotales { get; set; }
        public int PrescripcionesTotales { get; set; }
        public int MedicosTotales { get; set; }
        public int LaboratoriosTotales { get; set; }
        public decimal MarketShareBEB { get; set; }
        public int RankingBEB { get; set; }
    }

    // DTO para Overview de un mercado específico
    public class MercadoOverviewDTO
    {
        public string CdgMercado { get; set; } = string.Empty;
        public string MercadoNombre { get; set; } = string.Empty;
        public string? Abreviatura { get; set; }
        public int TotalPrescripciones { get; set; }
        public int TotalMedicos { get; set; }
        public int TotalProductos { get; set; }
        public int TotalLaboratorios { get; set; }
        public int PrescripcionesBEB { get; set; }
        public int MedicosBEB { get; set; }
        public int ProductosBEB { get; set; }
        public decimal MarketShareBEB { get; set; }
    }

    // DTO para Laboratorios en un mercado
    public class LaboratorioPorMercadoDTO
    {
        public int Ranking { get; set; }
        public string Laboratorio { get; set; } = string.Empty;
        public int EsBEB { get; set; }
        public int Prescripciones { get; set; }
        public int MedicosUnicos { get; set; }
        public int ProductosDelLab { get; set; }
        public int TotalPX { get; set; }
        public decimal MarketShare { get; set; }
    }

    // DTO para Productos en un mercado
    public class ProductoPorMercadoDTO
    {
        public int Ranking { get; set; }
        public string CDG_RAIZ { get; set; } = string.Empty;
        public string CODIGO_PMIX { get; set; } = string.Empty;
        public string ProductoNombre { get; set; } = string.Empty;
        public string Laboratorio { get; set; } = string.Empty;
        public int EsBEB { get; set; }
        public int Prescripciones { get; set; }
        public int MedicosUnicos { get; set; }
        public int TotalPX { get; set; }
        public decimal PromedioPX_MER { get; set; }
        public decimal MarketShare { get; set; }
    }

    // DTO para Médicos en un mercado
    public class MedicoPorMercadoDTO
    {
        public int Ranking { get; set; }
        public string CDGMED_REG { get; set; } = string.Empty;
        public string? MedicoNombre { get; set; }
        public string? Especialidad { get; set; }
        public string? Ciudad { get; set; }
        public string? Barrio { get; set; }
        public int TotalPrescripciones { get; set; }
        public int ProductosDistintos { get; set; }
        public int LaboratoriosDistintos { get; set; }
        public int PrescripcionesBEB { get; set; }
        public int ProductosBEB { get; set; }
        public decimal PorcentajeBEB { get; set; }
        public string CategoriaMedico { get; set; } = string.Empty; // SOLO_BEB, CON_BEB, SIN_BEB
    }

    // DTO para lista de mercados
    public class MercadoDTO
    {
        public string CdgMercado { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? Abreviatura { get; set; }
        public string? CdgUsuario { get; set; }
        public string? Edicion { get; set; }
    }

    // DTO para lista de períodos
    public class PeriodoDTO
    {
        public string Codigo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? BLANK { get; set; }
    }

    // DTO para datos geográficos por CEP
    public class PrescripcionPorCEPDTO
    {
        public string CEP { get; set; } = string.Empty;
        public string? Ciudad { get; set; }
        public string? Barrio { get; set; }
        public int TotalMedicos { get; set; }
        public int TotalPrescripciones { get; set; }
        public int ProductosDistintos { get; set; }
        public int Ranking { get; set; }
    }

    // DTO para ciudades con más actividad
    public class CiudadDTO
    {
        public string Ciudad { get; set; } = string.Empty;
        public int CodigosPostales { get; set; }
        public int Barrios { get; set; }
        public int TotalMedicos { get; set; }
        public int TotalPrescripciones { get; set; }
        public int ProductosDistintos { get; set; }
        public int Ranking { get; set; }
    }
}
