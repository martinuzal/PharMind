# Configuración de Variables de Entorno - PharMind API

## 🔐 Seguridad

**IMPORTANTE**: Nunca subas secretos reales al repositorio. Los archivos de configuración deben usar placeholders.

## 📋 Métodos de Configuración

### 1. User Secrets (Desarrollo Local - Recomendado)

Para desarrollo local, usa User Secrets de .NET:

```bash
# Inicializar User Secrets
dotnet user-secrets init

# Configurar JWT Key
dotnet user-secrets set "Jwt:Key" "TU_CLAVE_SECRETA_AQUI_MINIMO_32_CARACTERES"

# Configurar Connection String (opcional si difiere del default)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=PharMind_Dev;..."
```

### 2. Variables de Entorno del Sistema

Para producción, configura variables de entorno en tu servidor:

**Windows:**
```cmd
setx ConnectionStrings__DefaultConnection "Server=prod-server;..."
setx Jwt__Key "PRODUCTION_JWT_SECRET_KEY"
```

**Linux/macOS:**
```bash
export ConnectionStrings__DefaultConnection="Server=prod-server;..."
export Jwt__Key="PRODUCTION_JWT_SECRET_KEY"
```

### 3. Azure App Service (Producción)

En Azure Portal:
1. Ve a tu App Service > Configuration > Application Settings
2. Agrega:
   - `ConnectionStrings__DefaultConnection`
   - `Jwt__Key`
   - `ASPNETCORE_ENVIRONMENT=Production`

### 4. Docker (Opcional)

```yaml
# docker-compose.yml
environment:
  - ConnectionStrings__DefaultConnection=Server=db;Database=PharMind;...
  - Jwt__Key=${JWT_SECRET}
  - ASPNETCORE_ENVIRONMENT=Production
```

## 🎯 Ambientes

### Development
- Base de datos: `PharMind_Dev`
- Logging: `Debug` level
- CORS: Permite localhost:5173, 4200, 3000
- Usa `appsettings.Development.json` + User Secrets

### Staging
- Base de datos: Configurada por variable de entorno
- Logging: `Information` level
- CORS: Solo staging domain
- Usa `appsettings.Staging.json`

### Production
- Base de datos: Configurada por variable de entorno
- Logging: `Warning` level (solo errores)
- CORS: Solo production domain(s)
- JWT expiry: 12 horas (más seguro)
- Usa `appsettings.Production.json`

## 🚀 Inicialización Rápida (Primera vez)

1. **Clonar repositorio**
   ```bash
   git clone <repo>
   cd Backend/PharMind.API
   ```

2. **Configurar User Secrets**
   ```bash
   dotnet user-secrets init
   dotnet user-secrets set "Jwt:Key" "Dev_JWT_Secret_Key_Minimum_32_Characters_Required_Here"
   ```

3. **Verificar configuración**
   ```bash
   dotnet user-secrets list
   ```

4. **Ejecutar**
   ```bash
   dotnet run
   ```

## 📝 Notas

- **User Secrets** se almacenan en:
  - Windows: `%APPDATA%\Microsoft\UserSecrets\<user_secrets_id>\secrets.json`
  - Linux/macOS: `~/.microsoft/usersecrets/<user_secrets_id>/secrets.json`

- La jerarquía de configuración es:
  1. Variables de entorno (más prioritarias)
  2. User Secrets
  3. appsettings.{Environment}.json
  4. appsettings.json (menos prioritarias)

- **NUNCA** comitees archivos con secretos reales:
  - ❌ `appsettings.*.json` con claves reales
  - ❌ Archivos `.env` con valores reales
  - ✅ Solo commitea `.env.example` con placeholders
