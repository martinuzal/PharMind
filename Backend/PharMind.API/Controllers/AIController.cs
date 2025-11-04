using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Globalization;
using System.Text;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly ILogger<AIController> _logger;
    private readonly HttpClient _httpClient;

    public AIController(ILogger<AIController> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    /// <summary>
    /// Genera datos demo usando AI basándose en un esquema de formulario
    /// </summary>
    [HttpPost("generate-demo-data")]
    public async Task<ActionResult> GenerateDemoData([FromBody] GenerateDemoRequest request)
    {
        try
        {
            // Construir el prompt para el LLM
            var prompt = BuildPrompt(request);

            // Para desarrollo, usar una generación simple sin llamar a un LLM externo
            // En producción, aquí podrías llamar a OpenAI, Claude, etc.
            var demoData = GenerateSimpleDemoData(request);

            return Ok(demoData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar datos demo con AI");
            return StatusCode(500, new { message = "Error al generar datos demo" });
        }
    }

    private string BuildPrompt(GenerateDemoRequest request)
    {
        var fieldsDescription = string.Join("\n", request.Fields.Select(f =>
            $"- {f.Name} ({f.Type}): {f.Label ?? f.Name}" +
            (f.Options != null && f.Options.Any() ? $" [Opciones: {string.Join(", ", f.Options)}]" : "")
        ));

        return $@"Genera datos realistas de demostración para un formulario de {request.EntityType} - {request.SubType}.

Contexto: Sistema de gestión farmacéutica en Argentina.

Campos del formulario:
{fieldsDescription}

Genera datos realistas y coherentes en español (Argentina) en formato JSON.
Para campos de tipo select/dropdown, usa solo los valores de las opciones proporcionadas.
Para fechas usa formato ISO (YYYY-MM-DD).
Para teléfonos usa formato argentino: +54 11 XXXX-XXXX.
Para emails usa dominios realistas (.com.ar, .com, etc).

Responde solo con el JSON de datos, sin explicaciones adicionales.";
    }

    private Dictionary<string, object?> GenerateSimpleDemoData(GenerateDemoRequest request)
    {
        var random = new Random();
        var data = new Dictionary<string, object?>();

        // Listas de datos realistas para Argentina
        var nombres = new[] { "Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Diego", "Sofía", "Roberto", "Valentina", "Martín", "Lucía" };
        var apellidos = new[] { "García", "Rodríguez", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez", "Fernández", "Torres" };
        var ciudades = new[] { "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta" };
        var calles = new[] { "Av. Corrientes", "Av. Santa Fe", "Av. Rivadavia", "Av. Libertador", "Calle Florida", "Av. Córdoba", "Av. de Mayo" };
        var especialidades = new[] { "Cardiología", "Pediatría", "Traumatología", "Medicina General", "Neurología", "Dermatología", "Ginecología", "Oftalmología" };
        var empresas = new[] { "Farmacia", "Hospital", "Clínica", "Centro Médico", "Consultorio" };

        foreach (var field in request.Fields)
        {
            switch (field.Type.ToLower())
            {
                case "text":
                    if (field.Name.ToLower().Contains("nombre") && !field.Name.ToLower().Contains("razon"))
                    {
                        data[field.Name] = nombres[random.Next(nombres.Length)];
                    }
                    else if (field.Name.ToLower().Contains("apellido"))
                    {
                        data[field.Name] = apellidos[random.Next(apellidos.Length)];
                    }
                    else if (field.Name.ToLower().Contains("ciudad"))
                    {
                        data[field.Name] = ciudades[random.Next(ciudades.Length)];
                    }
                    else if (field.Name.ToLower().Contains("calle") || field.Name.ToLower().Contains("direccion"))
                    {
                        data[field.Name] = $"{calles[random.Next(calles.Length)]} {random.Next(100, 9999)}";
                    }
                    else if (field.Name.ToLower().Contains("especialidad"))
                    {
                        data[field.Name] = especialidades[random.Next(especialidades.Length)];
                    }
                    else if (field.Name.ToLower().Contains("empresa") || field.Name.ToLower().Contains("razon"))
                    {
                        data[field.Name] = $"{empresas[random.Next(empresas.Length)]} {apellidos[random.Next(apellidos.Length)]}";
                    }
                    else if (field.Name.ToLower().Contains("matricula") || field.Name.ToLower().Contains("legajo"))
                    {
                        data[field.Name] = $"MAT-{random.Next(10000, 99999)}";
                    }
                    else if (field.Name.ToLower().Contains("dni") || field.Name.ToLower().Contains("documento"))
                    {
                        data[field.Name] = $"{random.Next(20000000, 45000000)}";
                    }
                    else
                    {
                        data[field.Name] = $"Demo {field.Label ?? field.Name}";
                    }
                    break;

                case "textarea":
                    data[field.Name] = $"Observaciones de demostración para {field.Label ?? field.Name}. Este es un texto de ejemplo generado automáticamente.";
                    break;

                case "number":
                    if (field.Name.ToLower().Contains("edad"))
                    {
                        data[field.Name] = random.Next(25, 65);
                    }
                    else if (field.Name.ToLower().Contains("cantidad") || field.Name.ToLower().Contains("stock"))
                    {
                        data[field.Name] = random.Next(1, 1000);
                    }
                    else if (field.Name.ToLower().Contains("precio") || field.Name.ToLower().Contains("monto"))
                    {
                        data[field.Name] = Math.Round(random.NextDouble() * 10000 + 100, 2);
                    }
                    else
                    {
                        data[field.Name] = random.Next(1, 100);
                    }
                    break;

                case "email":
                    var nombreEmail = RemoveAccents(nombres[random.Next(nombres.Length)].ToLower());
                    var apellidoEmail = RemoveAccents(apellidos[random.Next(apellidos.Length)].ToLower());
                    var dominios = new[] { "gmail.com", "hotmail.com", "yahoo.com.ar", "outlook.com" };
                    data[field.Name] = $"{nombreEmail}.{apellidoEmail}@{dominios[random.Next(dominios.Length)]}";
                    break;

                case "tel":
                case "phone":
                case "telefono":
                    var codigoArea = new[] { "11", "351", "341", "261", "221", "381" };
                    data[field.Name] = $"+54 {codigoArea[random.Next(codigoArea.Length)]} {random.Next(1000, 9999)}-{random.Next(1000, 9999)}";
                    break;

                case "date":
                    if (field.Name.ToLower().Contains("nacimiento"))
                    {
                        var edad = random.Next(25, 65);
                        data[field.Name] = DateTime.Now.AddYears(-edad).AddDays(random.Next(-180, 180)).ToString("yyyy-MM-dd");
                    }
                    else if (field.Name.ToLower().Contains("ingreso") || field.Name.ToLower().Contains("alta"))
                    {
                        data[field.Name] = DateTime.Now.AddDays(-random.Next(30, 365)).ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        data[field.Name] = DateTime.Now.AddDays(-random.Next(0, 365)).ToString("yyyy-MM-dd");
                    }
                    break;

                case "checkbox":
                case "boolean":
                    data[field.Name] = random.Next(2) == 1;
                    break;

                case "select":
                case "dropdown":
                case "radio":
                    if (field.Options != null && field.Options.Any())
                    {
                        data[field.Name] = field.Options[random.Next(field.Options.Count)];
                    }
                    break;

                case "url":
                    data[field.Name] = $"https://www.ejemplo-{random.Next(100, 999)}.com.ar";
                    break;

                default:
                    data[field.Name] = $"Demo {field.Type}";
                    break;
            }
        }

        return data;
    }

    /// <summary>
    /// Remueve acentos y diacríticos de una cadena de texto
    /// </summary>
    private static string RemoveAccents(string text)
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }
}

public class GenerateDemoRequest
{
    public string EntityType { get; set; } = string.Empty;
    public string SubType { get; set; } = string.Empty;
    public List<FieldDefinition> Fields { get; set; } = new();
}

public class FieldDefinition
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Label { get; set; }
    public bool Required { get; set; }
    public List<string>? Options { get; set; }
}
