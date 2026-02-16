"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Suspense } from 'react';

export default function SessionWrapper({ children }: { children: ReactNode }) {
  return <Suspense><SessionProvider>{children}</SessionProvider></Suspense>;
}
