'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default ClientLayout;
