import type { Metadata } from "next";
import { AdminNav } from "@/features/admin/AdminNav";

export const metadata: Metadata = {
  title: "Админ-панель — Вкусный Уголок",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
