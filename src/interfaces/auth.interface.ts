// Auth-related interfaces
export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  role?: "CUSTOMER" | "ORGANIZER" | "ADMIN";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    points?: number;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}
