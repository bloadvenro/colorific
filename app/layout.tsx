import type { Metadata } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';
import '@mantine/core/styles.css';
import './globals.css';
import { Providers } from './providers';

const baloo = Baloo_2({
  variable: '--font-baloo',
  subsets: ['latin'],
});

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Colorific! — Mix some magic',
  description: 'A playful color-mixing canvas for kids.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${baloo.variable} ${nunito.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
