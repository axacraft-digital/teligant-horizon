import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teligant Horizon — Reference Storefront",
  description:
    "Brand-neutral reference storefront for the Teligant Horizon foundation. Not a customer-facing site.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
