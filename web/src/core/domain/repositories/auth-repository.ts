import type { AuthUser } from "../auth";

export interface AuthRepository {
  getUser(): Promise<AuthUser | null>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  /** Подписка на изменение сессии. Возвращает функцию отписки. */
  onChange(callback: (user: AuthUser | null) => void): () => void;
}
