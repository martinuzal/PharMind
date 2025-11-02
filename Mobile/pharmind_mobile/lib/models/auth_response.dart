import 'usuario.dart';

class AuthResponse {
  final String token;
  final Usuario usuario;
  final String message;
  final bool success;

  AuthResponse({
    required this.token,
    required this.usuario,
    required this.message,
    this.success = true,
  });

  // Convertir de JSON a objeto AuthResponse
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] ?? '',
      usuario: Usuario.fromJson(json['usuario'] ?? {}),
      message: json['message'] ?? 'Login exitoso',
      success: json['success'] ?? true,
    );
  }

  // Convertir de objeto AuthResponse a JSON
  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'usuario': usuario.toJson(),
      'message': message,
      'success': success,
    };
  }

  @override
  String toString() {
    return 'AuthResponse{token: ${token.substring(0, 20)}..., usuario: ${usuario.nombre}, success: $success}';
  }
}
