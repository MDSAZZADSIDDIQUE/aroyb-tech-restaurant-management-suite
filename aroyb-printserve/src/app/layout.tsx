import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aroyb PrintServe | Printing System Demo",
  description: "Restaurant printing system demo - receipts, labels, dockets",
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
