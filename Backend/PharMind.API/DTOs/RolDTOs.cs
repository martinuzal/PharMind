namespace PharMind.API.DTOs;

public class RolDto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string EmpresaId { get; set; } = string.Empty;
    public bool EsSistema { get; set; }
    public bool Activo { get; set; }
    public int UsuariosCount { get; set; }
    public List<PermisoModuloDto> Permisos { get; set; } = new();
}

public class PermisoModuloDto
{
    public string ModuloId { get; set; } = string.Empty;
    public string ModuloNombre { get; set; } = string.Empty;
    public string NivelAcceso { get; set; } = string.Empty;
    public bool PuedeVer { get; set; }
    public bool PuedeCrear { get; set; }
    public bool PuedeEditar { get; set; }
    public bool PuedeEliminar { get; set; }
    public bool PuedeExportar { get; set; }
    public bool PuedeImportar { get; set; }
    public bool PuedeAprobar { get; set; }
}

public class CreateRolDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string EmpresaId { get; set; } = string.Empty;
    public List<CreatePermisoModuloDto> Permisos { get; set; } = new();
}

public class CreatePermisoModuloDto
{
    public string ModuloId { get; set; } = string.Empty;
    public string NivelAcceso { get; set; } = "Lectura";
    public bool PuedeVer { get; set; }
    public bool PuedeCrear { get; set; }
    public bool PuedeEditar { get; set; }
    public bool PuedeEliminar { get; set; }
    public bool PuedeExportar { get; set; }
    public bool PuedeImportar { get; set; }
    public bool PuedeAprobar { get; set; }
}

public class UpdateRolDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
    public List<CreatePermisoModuloDto> Permisos { get; set; } = new();
}
