using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

public partial class AuditCustomer
{
    public int Id { get; set; }

    [Column("CDGMED_REG")]
    public string? CdgmedReg { get; set; }

    public string? Crm { get; set; }

    public string? Nome { get; set; }

    public string? Blank { get; set; }

    public string? Cdgesp1 { get; set; }

    public string? Cdgesp2 { get; set; }

    [Column("CDGREG_PMIX")]
    public string? CdgregPmix { get; set; }

    public string? Local { get; set; }

    public string? Bairro { get; set; }

    public string? Cep { get; set; }

    [Column("CDGMED_VIS")]
    public string? CdgmedVis { get; set; }

    public string? RawData { get; set; }
}
