using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PharMind.API.Data;
using PharMind.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// DbContext
builder.Services.AddDbContext<PharMindDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<DynamicTableService>();
builder.Services.AddScoped<EntityFilterService>();
builder.Services.AddSingleton<IChunkedUploadService, ChunkedUploadService>();
builder.Services.AddScoped<IAuditoriaPrescripcionesService, AuditoriaPrescripcionesService>();
builder.Services.AddScoped<IProcessLogService, ProcessLogService>();
builder.Services.AddScoped<IFrecuenciaVisitasService, FrecuenciaVisitasService>();
builder.Services.AddHttpClient();

// SignalR
builder.Services.AddSignalR();

// Configurar límites para archivos grandes - Desde configuración
var maxRequestSizeMB = builder.Configuration.GetValue<int>("ApiSettings:MaxRequestBodySizeMB", 300);
var requestTimeoutMinutes = builder.Configuration.GetValue<int>("ApiSettings:RequestTimeoutMinutes", 5);
var maxRequestSizeBytes = maxRequestSizeMB * 1024 * 1024;

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = maxRequestSizeBytes;
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// Configurar Kestrel para soportar archivos grandes
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = maxRequestSizeBytes;
    serverOptions.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(requestTimeoutMinutes);
    serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(requestTimeoutMinutes);
});

// CORS - Configurado desde appsettings
var allowedOrigins = builder.Configuration["ApiSettings:AllowedOrigins"]?.Split(';')
    ?? new[] { "http://localhost:5173", "http://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Necesario para SignalR
    });
});

// JWT Authentication - Validación de configuración
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT Key no configurado. Por favor configure Jwt:Key en User Secrets o variables de entorno.");

if (jwtKey.Length < 32)
{
    throw new InvalidOperationException(
        "JWT Key debe tener al menos 32 caracteres para ser seguro.");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "PharMind.API";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "PharMind.Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Aplicar migraciones automáticamente y asegurar que la base de datos esté creada
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<PharMindDbContext>();

        // Asegurar que la base de datos existe (sin aplicar migraciones automáticas)
        // Esto permite usar arquitectura híbrida: entidades dinámicas + tablas CRM fijas
        //context.Database.Migrate(); // Comentado para arquitectura híbrida
        if (!context.Database.CanConnect())
        {
            throw new Exception("No se puede conectar a la base de datos. Verifica tu connection string.");
        }

        // Actualizar el hash del password del administrador si es necesario
        var adminEmail = "admin@pharmind.com";
        var admin = context.Usuarios.FirstOrDefault(u => u.Email == adminEmail);
        if (admin != null)
        {
            // Verificar si el hash actual es válido
            try
            {
                if (!BCrypt.Net.BCrypt.Verify("Admin123!", admin.PasswordHash))
                {
                    // Si no es válido, regenerar
                    admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
                    context.SaveChanges();
                    Console.WriteLine("Password del administrador actualizado correctamente.");
                }
            }
            catch
            {
                // Si hay error al verificar, significa que el hash no es válido, regenerar
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
                context.SaveChanges();
                Console.WriteLine("Password del administrador actualizado correctamente.");
            }
        }

        Console.WriteLine("Base de datos inicializada correctamente.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error al inicializar la base de datos.");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// SignalR Hub
app.MapHub<PharMind.API.Hubs.ImportProgressHub>("/hubs/import-progress");

app.Run();
