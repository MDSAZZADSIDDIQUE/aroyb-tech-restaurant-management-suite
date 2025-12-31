import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aroyb MenuMaster | Menu Management Demo",
  description: "Restaurant menu management system demo - categories, items, modifiers, combos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
