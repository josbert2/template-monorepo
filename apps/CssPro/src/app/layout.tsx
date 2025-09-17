import { Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../providers/theme-provider";
import "@clarity/design-system/styles.css"
import "@clarity/ui/styles.css"
import "./globals.css";
import FontPicker from '../components/FontPicker';


const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FontPicker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}