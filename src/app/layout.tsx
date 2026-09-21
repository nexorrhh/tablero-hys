import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tablero H&S | Cimomet",
  description: "Plataforma modular de gestión de Seguridad e Higiene",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased text-slate-900">{children}</body>
    </html>
  );
}
