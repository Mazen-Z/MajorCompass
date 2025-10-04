import './globals.css';
import type { ReactNode } from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'MajorCompass',
  description: 'Find your best-fit major and career path through a personality quiz.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="container flex items-center gap-3 py-4">
            <Image src="/logo.svg" alt="MajorCompass" width={28} height={28} />
            <h1 className="text-xl font-semibold">MajorCompass</h1>
          </div>
        </header>
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
