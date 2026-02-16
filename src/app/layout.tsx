import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export const metadata = {
  title: "EDUCA Dashboard",
  description: "Plateforme EDUCA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-gray-100 antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
