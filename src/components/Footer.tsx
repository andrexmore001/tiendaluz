"use client";
import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function Footer() {
    const { settings } = useSettings();

    return (
        <footer className={styles.footer}>
            <div className={`${styles.container} container`}>
                <div className={styles.info}>
                    <Link href="/" className={styles.logo}>
                        {settings.logo ? (
                            <img src={settings.logo} alt={settings.title} className={styles.logoImg} />
                        ) : (
                            settings.title.toUpperCase()
                        )}
                    </Link>
                    <p className={styles.description}>Creamos cajas que cuentan historias. Detalles artesanales hechos con el alma.</p>
                    <div className={styles.social}>
                        <a href={`https://instagram.com/${settings.contact.instagram}`} target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                        <a href={`https://facebook.com/${settings.contact.facebook}`} target="_blank" rel="noopener noreferrer"><Facebook size={20} /></a>
                    </div>
                </div>

                <div className={styles.linksSide}>
                    <div className={styles.linkColumn}>
                        <h4>Explorar</h4>
                        <Link href="/productos">Productos</Link>
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
                <p>&copy; 2026 Artesana. Hecho con amor en Colombia.</p>
                <p className={styles.developer}>Desarrollado por <a href={getWhatsAppLink("3215458839", "Hola Andres, vi la página de Artesana y me encantaría que me ayudaras a desarrollar mi propia página web.")} target="_blank" rel="noopener noreferrer">Andres Moreno</a></p>
            </div>
        </footer>
    );
}
