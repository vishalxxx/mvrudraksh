import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ivory)" }}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
