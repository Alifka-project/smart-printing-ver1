import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>

    <div className="w-full flex">
        <Sidebar />
        <div className="w-full bg-[#F3F4F6]">
        <Header />
        {children}
        </div>
    </div>
    </ProtectedRoute>
  );
}
