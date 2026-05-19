import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import ClientShell from '../components/ClientShell';
import Floaters from '../components/Floaters';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FI Lite — Nexum Suum Intelligence Portal',
  description: 'Boiler · Chiller · Facility Systems Intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body style={{ background: '#030d14', minHeight: '100vh' }}>
        <Floaters />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
