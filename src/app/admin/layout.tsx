import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Administration — Al Manhaj',
  robots: { index: false, follow: false },
};

/** Enveloppe commune à toutes les pages du panneau d'administration. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
