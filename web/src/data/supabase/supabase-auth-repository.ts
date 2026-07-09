import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@/core/domain/auth";
import type { AuthRepository } from "@/core/domain/repositories/auth-repository";
import { getSupabase } from "./supabase-client";

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  return {
    id: user.id,
    email: user.email ?? null,
    isAdmin: role === "admin",
  };
}

export class SupabaseAuthRepository implements AuthRepository {
  async getUser(): Promise<AuthUser | null> {
    const { data } = await getSupabase().auth.getSession();
    return toAuthUser(data.session?.user);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const user = toAuthUser(data.user);
    if (!user) throw new Error("Не удалось войти");
    return user;
  }

  async signOut(): Promise<void> {
    await getSupabase().auth.signOut();
  }

  onChange(callback: (user: AuthUser | null) => void): () => void {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user));
    });
    return () => data.subscription.unsubscribe();
  }
}
