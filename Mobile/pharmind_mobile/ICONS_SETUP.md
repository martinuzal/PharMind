# Configuración de Iconos de PharMind Mobile

## Resumen

Se han configurado exitosamente los iconos de la aplicación PharMind Mobile para Android e iOS usando los iconos personalizados proporcionados.

## Estructura de Iconos

### Carpeta Icons/
La carpeta `Icons/` en la raíz del proyecto contiene los siguientes iconos en diferentes resoluciones:

#### Android
- `android_36x36.png` - LDPI
- `android_48x48.png` - MDPI
- `android_72x72.png` - HDPI
- `android_96x96.png` - XHDPI
- `android_144x144.png` - XXHDPI
- `android_192x192.png` - XXXHDPI
- `android_512x512.png` - Icono para Google Play Store y adaptativo

#### iOS
- `ios_20x20.png`
- `ios_29x29.png`
- `ios_40x40.png`
- `ios_60x60.png`
- `ios_76x76.png`
- `ios_83x83.png`
- `ios_120x120.png`
- `ios_152x152.png`
- `ios_167x167.png`
- `ios_180x180.png`
- `ios_1024x1024.png` - Icono para App Store

## Configuración Implementada

### 1. Carpeta de Assets
Se creó la carpeta `assets/icons/` y se copió el icono principal:
```
assets/
└── icons/
    └── app_icon.png (192x192)
```

### 2. pubspec.yaml
Se agregaron las siguientes configuraciones:

```yaml
flutter:
  uses-material-design: true

  # Assets
  assets:
    - assets/icons/

dev_dependencies:
  flutter_launcher_icons: ^0.13.1

# Flutter Launcher Icons configuration
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "Icons/android_512x512.png"
  adaptive_icon_background: "#1976D2"
  adaptive_icon_foreground: "Icons/android_512x512.png"
```

### 3. Generación de Iconos
Se ejecutó el comando:
```bash
flutter pub run flutter_launcher_icons
```

Este comando genera automáticamente:
- **Android**: Iconos en todas las resoluciones (mipmap)
- **Android**: Iconos adaptativos (foreground + background)
- **iOS**: Iconos en Assets.xcassets
- **colors.xml**: Archivo de colores para Android

## Resultado

✅ **Iconos de Android** generados en:
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

✅ **Iconos adaptativos de Android** generados en:
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png`
- etc.

✅ **Iconos de iOS** generados en:
- `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

✅ **colors.xml** creado en:
- `android/app/src/main/res/values/colors.xml`

## Características

### Android
- **Iconos estándar**: Usados en dispositivos más antiguos
- **Iconos adaptativos**: Usados en Android 8.0+ (API 26+)
  - Foreground: El icono principal
  - Background: Color azul #1976D2 (color del tema)
- **Formato**: PNG
- **Compatibilidad**: API 21+ (Android 5.0+)

### iOS
- **Formato**: PNG sin canal alpha (requerido por App Store)
- **Compatibilidad**: iOS 9.0+
- **Resoluciones**: Desde 20x20 hasta 1024x1024 para App Store

## Advertencias

⚠️ **iOS Alpha Channel**
Se mostró una advertencia sobre el canal alpha en iOS:
```
WARNING: Icons with alpha channel are not allowed in the Apple App Store.
Set "remove_alpha_ios: true" to remove it.
```

**Solución (si es necesario):**
Agregar al `pubspec.yaml`:
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "Icons/android_512x512.png"
  adaptive_icon_background: "#1976D2"
  adaptive_icon_foreground: "Icons/android_512x512.png"
  remove_alpha_ios: true  # <- Agregar esta línea
```

## Uso de Iconos en la App

### En Splash Screen
```dart
// lib/screens/splash_screen.dart
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Colors.blue.shade700,
        Colors.blue.shade900,
      ],
    ),
  ),
  child: Center(
    child: Image.asset(
      'assets/icons/app_icon.png',
      width: 150,
      height: 150,
    ),
  ),
)
```

### Como Widget
```dart
Image.asset(
  'assets/icons/app_icon.png',
  width: 64,
  height: 64,
)
```

## Regenerar Iconos

Si necesitas actualizar los iconos en el futuro:

1. Reemplaza los archivos en la carpeta `Icons/`
2. Ejecuta:
   ```bash
   flutter pub run flutter_launcher_icons
   ```
3. Limpia y reconstruye la app:
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

## Personalización Adicional

### Cambiar Color de Fondo (Android Adaptativo)
Edita en `pubspec.yaml`:
```yaml
adaptive_icon_background: "#RRGGBB"  # Tu color hex
```

### Diferentes Iconos para Android e iOS
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path_android: "Icons/android_512x512.png"
  image_path_ios: "Icons/ios_1024x1024.png"
  adaptive_icon_background: "#1976D2"
  adaptive_icon_foreground: "Icons/android_512x512.png"
```

## Verificación

Para verificar que los iconos se aplicaron correctamente:

1. **Android**:
   - Compilar: `flutter build apk`
   - Instalar en dispositivo/emulador
   - Verificar el icono en el launcher

2. **iOS**:
   - Abrir proyecto en Xcode: `open ios/Runner.xcworkspace`
   - Verificar Assets.xcassets/AppIcon.appiconset
   - Compilar y verificar en simulador

## Troubleshooting

### Los iconos no aparecen
1. Ejecuta `flutter clean`
2. Ejecuta `flutter pub get`
3. Recompila la app completamente

### Error en iOS sobre alpha channel
Agrega `remove_alpha_ios: true` en la configuración

### Iconos adaptativos no funcionan en Android
- Verifica que el dispositivo tenga Android 8.0+ (API 26+)
- En versiones anteriores se usarán los iconos estándar

## Referencias

- [flutter_launcher_icons](https://pub.dev/packages/flutter_launcher_icons)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [iOS App Icon](https://developer.apple.com/design/human-interface-guidelines/app-icons)

---

**Última actualización**: Noviembre 2024
**Versión**: 1.0.0
