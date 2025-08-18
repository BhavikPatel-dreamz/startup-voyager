"use client";
import React from "react";
import AppLayout from "../../components/AppLayout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
