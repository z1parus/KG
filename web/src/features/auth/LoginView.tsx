"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Field } from "@/ui/Field";
import { TextInput } from "@/ui/TextInput";
import { useAuth } from "./auth-context";

export function LoginView() {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) router.replace("/admin");
  }, [user, router]);

  async function submit() {
    setError(undefined);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/admin");
    } catch {
      setError("Неверный email или пароль");
      setBusy(false);
    }
  }

  return (
    <Container className="max-w-sm space-y-4 py-16">
      <h1 className="text-xl font-bold">Вход в админку</h1>
      <Field label="Email">
        <TextInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Пароль">
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button className="w-full" disabled={busy} onClick={submit}>
        {busy ? "Вход…" : "Войти"}
      </Button>
    </Container>
  );
}
