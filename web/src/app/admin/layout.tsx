import type { Metadata } from "next";
import { AdminNav } from "@/features/admin/AdminNav";
import { AdminGate } from "@/features/auth/AdminGate";
import { AuthProvider } from "@/features/auth/auth-context";

export const metadata: Metadata = {
  title: "Админ-панель — Вкусный Уголок",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminNav />
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  );
}
