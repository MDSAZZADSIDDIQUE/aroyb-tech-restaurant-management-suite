import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aroyb KitchenScreen | KDS Demo",
  description: "Kitchen Display System demo for UK restaurants",
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
