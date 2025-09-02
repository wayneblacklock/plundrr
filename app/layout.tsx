import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Plundrr' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui' }}>
        <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ marginRight: 12 }}>Plundrr</a>
          <a href="/login" style={{ marginRight: 12 }}>Login</a>
          <a href="/searches" style={{ marginRight: 12 }}>Searches</a>
          <a href="/blocklist" style={{ marginRight: 12 }}>Blocklist</a>
          <a href="/account">Account</a>
        </header>
        {children}
      </body>
    </html>
  );
}