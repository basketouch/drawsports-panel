import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DrawSports PRO - Panel de licencias",
  description: "Gestiona tu licencia DrawSports PRO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
