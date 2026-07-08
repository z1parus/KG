import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/features/cart/cart-context";
import { Header } from "@/features/menu/components/Header";

export const metadata: Metadata = {
  title: "Вкусный Уголок — заказ еды",
  description: "Заказ еды из локального ресторана: меню, корзина, доставка и самовывоз.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
