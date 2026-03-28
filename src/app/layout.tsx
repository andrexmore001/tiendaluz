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
  title: "Artesana | Cajas, Insumos y Regalos Personalizados",
  description: "Explora nuestra variedad de cajas (madera, cartón, cartulina), insumos para regalo (dulces, vinos, cervezas) y regalos 100% personalizados hechos a tu medida.",
  verification: {
    google: "NpuVXyBJdaV5XfhkdN1tWyR78GAykD7SI1m5Bcr4I4Y",
  },
  openGraph: {
    title: "Artesana | Empaques, Insumos y Regalos Únicos",
    description: "Cajas de madera y cartón (personalizadas o sin personalizar), dulces, licores y regalos hechos a tu medida. ¡Arma el detalle perfecto!",
    url: "https://artessana.vercel.app",
    siteName: "Artesana",
    images: [
      {
        url: "https://artessana.vercel.app/hero-banner.png",
        width: 1200,
        height: 630,
        alt: "Cajas personalizadas, insumos y regalos Artesana",
      },
    ],
    locale: "es_CO",
    type: "website",
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
