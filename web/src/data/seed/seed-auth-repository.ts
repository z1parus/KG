import type { AuthUser } from "@/core/domain/auth";
import type { AuthRepository } from "@/core/domain/repositories/auth-repository";

// Демо-режим (без Supabase): админка доступна без входа. Реальная авторизация —
// в SupabaseAuthRepository (роль admin из app_metadata).
const demoAdmin: AuthUser = {
  id: "demo-admin",
  email: "demo@local",
  isAdmin: true,
};

export class SeedAuthRepository implements AuthRepository {
  async getUser(): Promise<AuthUser | null> {
    return demoAdmin;
  }

  async signIn(): Promise<AuthUser> {
    return demoAdmin;
  }

  async signOut(): Promise<void> {}

  onChange(callback: (user: AuthUser | null) => void): () => void {
    callback(demoAdmin);
    return () => {};
  }
}
