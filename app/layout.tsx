import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chores - Domácí práce",
  description: "Aplikace pro organizaci domácích prací a jejich rozdělení",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
