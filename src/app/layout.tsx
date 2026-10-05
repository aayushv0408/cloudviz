import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'CloudStore | Personal Cloud Media Vault & Platform',
  description: 'Ultra-fast cloud object storage & media streaming platform with direct S3/R2 integration, rich preview players, and instant file sharing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#040711] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
