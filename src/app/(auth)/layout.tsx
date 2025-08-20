"use client";
import React from "react";
import AppLayout from "../../components/AppLayout";
import AdminRoute from "@/components/AdminRoute";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout><AdminRoute>{children}</AdminRoute></AppLayout>;
}
