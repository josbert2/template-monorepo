import "./globals.css";

export const metadata = {
  title: "Nueva Landing",
  description: "Landing generada desde monorepo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
