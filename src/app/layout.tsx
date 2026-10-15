import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paz Instruments | Registro de instrumentos",
  description: "Registro centralizado de instrumentos y equipos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}