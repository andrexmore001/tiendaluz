import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from '@/context/SettingsContext';
import DynamicStyles from '@/components/DynamicStyles';
import DynamicFavicon from '@/components/Branding/DynamicFavicon';
import NextAuthConfig from '@/components/NextAuthConfig';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import Ticker from '@/components/Ticker';

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artesana | Cajas que cuentan historias.",
  description: "Marca femenina dedicada a la venta de cajas personalizadas y regalos especiales. Detalles hechos con amor.",
  verification: {
    google: "NpuVXyBJdaV5XfhkdN1tWyR78GAykD7SI1m5Bcr4I4Y",
  },
};


import ChatWidget from '@/components/ChatWidget';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <NextAuthConfig>
          <SettingsProvider>
            <CartProvider>
              <DynamicStyles />
              <DynamicFavicon />
              <Ticker />
              {children}
              <CartDrawer />
              <ChatWidget />
            </CartProvider>
          </SettingsProvider>
        </NextAuthConfig>
      </body>
    </html>
  );
}
