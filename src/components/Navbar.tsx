"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import styles from './Navbar.module.css';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import SearchBar from './SearchBar/SearchBar';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { settings } = useSettings();
    const { cartCount, toggleCart } = useCart();

    return (
        <nav className={styles.navbar}>
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
                        {/* Ícono de usuario oculto temporalmente por falta de sesiones
                        <button className={styles.actionBtn}>
                            <User size={20} />
                        </button>
                        */}
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
