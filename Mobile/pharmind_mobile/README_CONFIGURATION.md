# Configuración de Variables de Entorno - PharMind Mobile

## 🔐 Seguridad

**IMPORTANTE**: Nunca subas archivos con API keys reales o URLs de producción hardcodeadas.

## 📋 Configuración de Ambientes

Flutter usa `--dart-define` para pasar variables de entorno en tiempo de compilación.

### Estructura de Archivos

```
Mobile/pharmind_mobile/
├── env/
│   ├── development.json    # Desarrollo
│   ├── staging.json        # Staging
│   └── production.json     # Producción
├── lib/config/
│   └── env.dart            # Clase de configuración
└── .env.example            # Template de variables
```

## 🚀 Uso

### Opción 1: Comando Directo (Manual)

```bash
# Development (Emulador Android)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5209/api --dart-define=ENVIRONMENT=development

# Development (iOS Simulator)
flutter run --dart-define=API_BASE_URL=http://localhost:5209/api --dart-define=ENVIRONMENT=development

# Development (Dispositivo Físico - usa tu IP local)
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:5209/api --dart-define=ENVIRONMENT=development

# Production
flutter build apk --dart-define=API_BASE_URL=https://api.yourdomain.com/api --dart-define=ENVIRONMENT=production
```

### Opción 2: Script de Build (Recomendado)

Crear scripts en `scripts/` para facilitar builds:

**scripts/run_dev.sh** (Linux/Mac):
```bash
#!/bin/bash
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:5209/api \
  --dart-define=ENVIRONMENT=development \
  --dart-define=ENABLE_DEBUG_MODE=true \
  --dart-define=APP_NAME="PharMind (Dev)"
```

**scripts/run_dev.ps1** (Windows):
```powershell
flutter run `
  --dart-define=API_BASE_URL=http://10.0.2.2:5209/api `
  --dart-define=ENVIRONMENT=development `
  --dart-define=ENABLE_DEBUG_MODE=true `
  --dart-define=APP_NAME="PharMind (Dev)"
```

### Opción 3: Usar archivos JSON (Avanzado)

Crear script que lea `env/*.json` y construya los `--dart-define`:

```bash
#!/bin/bash
# scripts/build_with_env.sh
ENV_FILE=${1:-env/development.json}

# Leer JSON y convertir a --dart-define
DEFINES=$(cat $ENV_FILE | jq -r 'to_entries | map("--dart-define=\(.key)=\(.value)") | join(" ")')

flutter run $DEFINES
```

Uso:
```bash
./scripts/build_with_env.sh env/production.json
```

## 📝 Variables Disponibles

### API Configuration
- `API_BASE_URL` - URL base del backend
  - Emulador Android: `http://10.0.2.2:5209/api`
  - iOS Simulator: `http://localhost:5209/api`
  - Dispositivo físico: `http://TU_IP_LOCAL:5209/api`
  - Producción: `https://api.yourdomain.com/api`

### Application
- `APP_NAME` - Nombre de la app (se muestra en UI)
- `ENVIRONMENT` - Ambiente (development, staging, production)

### Feature Flags
- `ENABLE_DEBUG_MODE` - Habilitar logs debug (true/false)
- `ENABLE_OFFLINE_MODE` - Habilitar modo offline (true/false)

### Timeouts
- `CONNECT_TIMEOUT` - Timeout de conexión (segundos)
- `RECEIVE_TIMEOUT` - Timeout de recepción (segundos)

## 💻 Uso en Código

```dart
import 'package:pharmind_mobile/config/env.dart';

void main() {
  // Validar configuración al iniciar
  AppConfig.validate();

  // Imprimir config (solo en debug)
  AppConfig.printConfig();

  runApp(MyApp());
}

// Usar en servicios
class ApiService {
  final String baseUrl = AppConfig.apiBaseUrl;
  final bool debugMode = AppConfig.enableDebugMode;

  void makeRequest() {
    if (AppConfig.isDevelopment) {
      print('Making request to: ${AppConfig.apiBaseUrl}');
    }
  }
}
```

## 🔧 Configuración por Dispositivo

### Emulador Android
```bash
# El emulador Android usa 10.0.2.2 para acceder al localhost del host
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5209/api
```

### iOS Simulator
```bash
# iOS Simulator puede usar localhost directamente
flutter run --dart-define=API_BASE_URL=http://localhost:5209/api
```

### Dispositivo Físico (Android/iOS)
```bash
# Obtener tu IP local
# Windows: ipconfig
# Mac/Linux: ifconfig

# Usar tu IP local (ejemplo: 192.168.1.100)
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:5209/api
```

**IMPORTANTE**: Asegúrate que el backend esté escuchando en todas las interfaces (`0.0.0.0`) y que el firewall permita conexiones.

## 📦 Build para Producción

### Android APK
```bash
flutter build apk \
  --dart-define=API_BASE_URL=https://api.yourdomain.com/api \
  --dart-define=ENVIRONMENT=production \
  --dart-define=ENABLE_DEBUG_MODE=false \
  --release
```

### Android App Bundle (Google Play)
```bash
flutter build appbundle \
  --dart-define=API_BASE_URL=https://api.yourdomain.com/api \
  --dart-define=ENVIRONMENT=production \
  --release
```

### iOS
```bash
flutter build ios \
  --dart-define=API_BASE_URL=https://api.yourdomain.com/api \
  --dart-define=ENVIRONMENT=production \
  --release
```

## 🎯 Flavors (Avanzado - Opcional)

Para gestión avanzada de ambientes, considera usar [Flutter Flavors](https://docs.flutter.dev/deployment/flavors):

```yaml
# android/app/build.gradle
flavorDimensions "environment"
productFlavors {
    dev {
        dimension "environment"
        applicationIdSuffix ".dev"
        manifestPlaceholders = [appName: "PharMind Dev"]
    }
    prod {
        dimension "environment"
        manifestPlaceholders = [appName: "PharMind"]
    }
}
```

## 🐛 Troubleshooting

### Error: "No se puede conectar al servidor"

1. **Emulador Android**: Verifica que uses `10.0.2.2` no `localhost`
2. **iOS Simulator**: Verifica que uses `localhost` o `127.0.0.1`
3. **Dispositivo físico**:
   - Verifica tu IP local con `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
   - Asegúrate que dispositivo y PC están en la misma red WiFi
   - Verifica que el firewall permita conexiones en el puerto 5209

### Variables no están definidas

```dart
// Verificar si las variables fueron pasadas
void main() {
  AppConfig.printConfig(); // Imprime todas las variables
  AppConfig.validate();    // Lanza error si falta algo crítico
  runApp(MyApp());
}
```

### Build falla en producción

Verifica que todas las variables requeridas estén definidas:
```bash
flutter build apk \
  --dart-define=API_BASE_URL=https://... \  # REQUERIDO
  --dart-define=ENVIRONMENT=production \     # REQUERIDO
  --release
```

## 📚 Referencias

- [Flutter --dart-define](https://dartcode.org/docs/using-dart-define-in-flutter/)
- [Environment Variables in Flutter](https://codewithandrea.com/articles/flutter-api-keys-dart-define-env-files/)
- [Flutter Flavors](https://docs.flutter.dev/deployment/flavors)
