import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aroyb PromoStudio",
  description: "Promotions, Vouchers & Gift Cards Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
