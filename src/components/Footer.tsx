"use client";
import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';
import { useSettings } from '@/context/SettingsContext';

export default function Footer() {
    const { settings } = useSettings();

    return (
        <footer className={styles.footer}>
            <div className={`${styles.container} container`}>
                <div className={styles.info}>
                    <h2 className={styles.logo}>{settings.title.toUpperCase()}</h2>
                    <p className={styles.description}>Creamos cajas que cuentan historias. Detalles artesanales hechos con el alma.</p>
                    <div className={styles.social}>
                        <a href={`https://instagram.com/${settings.contact.instagram}`}><Instagram size={20} /></a>
                        <a href={`https://facebook.com/${settings.contact.facebook}`}><Facebook size={20} /></a>
                    </div>
                </div>

                <div className={styles.linksSide}>
                    <div className={styles.linkColumn}>
                        <h4>Explorar</h4>
                        <Link href="/productos">Colecciones</Link>
                        <Link href="/nosotros">Nosotros</Link>
                        <Link href="/contacto">Contacto</Link>
                    </div>
                    <div className={styles.linkColumn}>
                        <h4>Contacto</h4>
                        <ul>
                            <li><Phone size={16} /> {settings.contact.phone}</li>
                            <li><Mail size={16} /> {settings.contact.email}</li>
                            <li><MapPin size={16} /> {settings.contact.address}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className={styles.bottomBar}>
                <p>&copy; 2024 Artesana. Hecho con amor en Colombia.</p>
            </div>
        </footer>
    );
}
