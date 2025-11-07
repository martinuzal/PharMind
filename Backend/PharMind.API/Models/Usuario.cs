using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Usuarios")]
public class Usuario
{
    [Key]
    [Column("Id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [Column("EmpresaId")]
    public string EmpresaId { get; set; } = string.Empty;

    [Required]
    [Column("Email")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Column("PasswordHash")]
    [MaxLength(255)]
    public string? PasswordHash { get; set; }

    [Required]
    [Column("NombreCompleto")]
    [MaxLength(200)]
    public string NombreCompleto { get; set; } = string.Empty;

    [Column("Telefono")]
    [MaxLength(50)]
    public string? Telefono { get; set; }

    [Column("Avatar")]
    public string? Avatar { get; set; }

    [Column("Cargo")]
    [MaxLength(100)]
    public string? Cargo { get; set; }

    [Column("Departamento")]
    [MaxLength(100)]
    public string? Departamento { get; set; }

    [Column("EmailVerificado")]
    public bool EmailVerificado { get; set; } = false;

    [Column("TokenVerificacion")]
    public string? TokenVerificacion { get; set; }

    [Column("TokenRecuperacion")]
    public string? TokenRecuperacion { get; set; }

    [Column("TokenRecuperacionExpira")]
    public DateTime? TokenRecuperacionExpira { get; set; }

    [Column("ProveedorSSO")]
    [MaxLength(50)]
    public string? ProveedorSSO { get; set; }

    [Column("SSOId")]
    public string? SSOId { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("UltimoAcceso")]
    public DateTime? UltimoAcceso { get; set; }

    [Column("FechaCreacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    [Column("Status")]
    public bool? Status { get; set; } = false;

    [Column("RolId")]
    public string? RolId { get; set; }

    [Column("AgenteId")]
    public string? AgenteId { get; set; }

    [Column("ManagerId")]
    public string? ManagerId { get; set; }

    [Column("EsAdministrador")]
    public bool EsAdministrador { get; set; } = false;

    // Navigation properties
    [ForeignKey("EmpresaId")]
    public virtual Empresa? Empresa { get; set; }

    [ForeignKey("RolId")]
    public virtual Rol? Rol { get; set; }

    [ForeignKey("AgenteId")]
    public virtual Agente? Agente { get; set; }

    [ForeignKey("ManagerId")]
    public virtual Manager? Manager { get; set; }

    public virtual ICollection<UsuarioRol> UsuarioRoles { get; set; } = new List<UsuarioRol>();
}
