import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Panel - Amedee Erns Baptiste",
  description: "Secure Administrator Console",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#121A1B] font-sans antialiased text-white">
        {children}
      </body>
    </html>
  );
}
