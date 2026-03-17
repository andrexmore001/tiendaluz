"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import styles from './Navbar.module.css';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import SearchBar from './SearchBar/SearchBar';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
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
                    <Link href="/" onClick={() => setIsOpen(false)}>Inicio</Link>
                    <Link href="/productos" onClick={() => setIsOpen(false)}>Colecciones</Link>
                    <Link href="/nosotros" onClick={() => setIsOpen(false)}>Nosotros</Link>
                    <Link href="/contacto" onClick={() => setIsOpen(false)}>Contacto</Link>
                </div>

                <div className={styles.navRight}>
                    <SearchBar />
                    <div className={styles.actions}>
                        <button className={styles.actionBtn}>
                            <User size={20} />
                        </button>
                        <button className={styles.actionBtn} onClick={toggleCart} aria-label="Abrir carrito">
                            <ShoppingBag size={20} />
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
