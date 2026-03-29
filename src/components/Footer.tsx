"use client";
import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
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
                    <p className={styles.description}>El empaque perfecto existe. Diseñamos y fabricamos cajas a medida y accesorios únicos para que tus detalles y tu marca destaquen desde el primer instante.</p>
                    <div className={styles.social}>
                        <a href={`https://instagram.com/${settings.contact.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.instagram}>
                            <Instagram size={20} />
                        </a>
                        <a href={`https://facebook.com/${settings.contact.facebook}`} target="_blank" rel="noopener noreferrer" className={styles.facebook}>
                            <Facebook size={20} />
                        </a>
                    </div>
                </div>

                <div className={styles.linksSide}>
                    <div className={styles.linkColumn}>
                        <h4>Explorar</h4>
                        <div className={styles.exploreList}>
                            <Link href="/productos" className={styles.exploreLink}>
                                <ChevronRight size={14} className={styles.exploreIcon} /> Productos
                            </Link>
                            <Link href="/nosotros" className={styles.exploreLink}>
                                <ChevronRight size={14} className={styles.exploreIcon} /> Nosotros
                            </Link>
                            <Link href="/contacto" className={styles.exploreLink}>
                                <ChevronRight size={14} className={styles.exploreIcon} /> Contacto
                            </Link>
                        </div>
                    </div>
                    <div className={styles.linkColumn}>
                        <h4>Contacto</h4>
                        <div className={styles.contactList}>
                            <a href={`tel:${settings.contact.phone.replace(/\s+/g, '')}`} className={styles.contactItem}>
                                <div className={styles.iconCircle}><Phone size={16} /></div>
                                <span>{settings.contact.phone}</span>
                            </a>
                            <a href={`mailto:${settings.contact.email}`} className={styles.contactItem}>
                                <div className={styles.iconCircle}><Mail size={16} /></div>
                                <span>{settings.contact.email}</span>
                            </a>
                            <div className={styles.contactItem} style={{ cursor: 'default' }}>
                                <div className={styles.iconCircle}><MapPin size={16} /></div>
                                <span>{settings.contact.address}</span>
                            </div>
                        </div>
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
