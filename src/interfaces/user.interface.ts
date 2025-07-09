import { UserRole, UserGender } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string | null;
  role: UserRole;
  points: number;
  profilePicture?: string | null;
  gender?: UserGender | null;
  birthDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for backward compatibility
export interface IUser extends User {}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  points: number;
  profilePicture?: string | null;
  gender?: UserGender | null;
  birthDate?: Date | null;
  createdAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  profilePicture?: string;
  gender?: UserGender;
  birthDate?: Date;
}

export interface UpdateUserDTO {
  fullName?: string;
  profilePicture?: string;
  gender?: UserGender;
  birthDate?: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// AuthResponse moved to auth.interface.ts to avoid conflicts
