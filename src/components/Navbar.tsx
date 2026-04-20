"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import SearchBar from './SearchBar/SearchBar';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const pathname = usePathname();
    const { settings } = useSettings();
    const { cartCount, toggleCart } = useCart();

    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        let lastY = 0;
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 10);
            setHidden(y > lastY && y > 80 && !isOpen);
            lastY = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isOpen]);

    // Actualiza --nav-height basado en la altura real del componente
    useEffect(() => {
        const el = navRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
                document.documentElement.style.setProperty('--nav-height', `${h}px`);
            }
        });

        observer.observe(el);
        // Set inicial
        document.documentElement.style.setProperty('--nav-height', `${el.offsetHeight}px`);

        return () => observer.disconnect();
    }, []);

    return (
        <nav ref={navRef} className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${hidden ? styles.hidden : ''}`}>
            <div className={`${styles.container} container`}>
                <button
                    className={styles.menuIcon}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <Link href="/" className={styles.logo}>
                    {settings.logo ? (
                        <img src={settings.logo} alt={settings.title} className={styles.logoImg} />
                    ) : (
                        settings.title.toUpperCase()
                    )}
                </Link>

                <div className={`${styles.links} ${isOpen ? styles.linksOpen : ''}`}>
                    <Link href="/" className={pathname === '/' ? styles.active : ''} onClick={() => setIsOpen(false)}>Inicio</Link>
                    <Link href="/productos" className={pathname.startsWith('/productos') ? styles.active : ''} onClick={() => setIsOpen(false)}>Productos</Link>
                    <Link href="/nosotros" className={pathname === '/nosotros' ? styles.active : ''} onClick={() => setIsOpen(false)}>Nosotros</Link>
                    <Link href="/contacto" className={pathname === '/contacto' ? styles.active : ''} onClick={() => setIsOpen(false)}>Contacto</Link>
                </div>

                <div className={styles.navRight}>
                    <div className={styles.searchContainer}>
                        <SearchBar />
                    </div>
                    <div className={styles.actions}>
                        {settings?.contact?.phone && (
                            <a
                                href={getWhatsAppLink(settings.contact.phone, "Hola Artesana, quiero más información.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappBtn}
                                aria-label="Contactar por WhatsApp"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="22" height="22" fill="currentColor">
                                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                                </svg>
                            </a>
                        )}
                        <button className={styles.actionBtn} onClick={toggleCart} aria-label="Abrir carrito">
                            <ShoppingCart className={styles.cartIcon} />
                            {cartCount > 0 && (
                                <span className={styles.cartCount}>{cartCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
