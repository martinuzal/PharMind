export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  empresaId: string;
  empresaNombre: string;
  activo: boolean;
  emailVerificado: boolean;
  proveedorSSO?: string;
  fechaCreacion: string;
  roles: string[];
}
