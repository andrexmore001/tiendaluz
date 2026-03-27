"use client";
import { SessionProvider } from 'next-auth/react';

export default function NextAuthConfig({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
