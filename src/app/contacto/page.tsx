import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { siteSettings } from '@/lib/data';
import styles from './contacto.module.css';

export default function ContactoPage() {
    return (
        <main>
            <Navbar />

            <section className={styles.contactSection}>
                <div className={`${styles.container} container`}>
                    <div className={styles.infoSide}>
                        <h1 className={styles.title}>Hablemos de tu <br /><span>próximo detalle</span></h1>
                        <p className={styles.subtitle}>Estamos aquí para ayudarte a crear algo inolvidable.</p>

                        <div className={styles.contactList}>
                            <div className={styles.contactItem}>
                                <div className={styles.iconBox}><Phone size={20} /></div>
                                <div>
                                    <p className={styles.label}>WhatsApp</p>
                                    <p>{siteSettings.contact.phone}</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.iconBox}><Mail size={20} /></div>
                                <div>
                                    <p className={styles.label}>Email</p>
                                    <p>{siteSettings.contact.email}</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.iconBox}><MapPin size={20} /></div>
                                <div>
                                    <p className={styles.label}>Showroom</p>
                                    <p>{siteSettings.contact.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSide}>
                        <form className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Nombre Completo</label>
                                <input type="text" placeholder="Tu nombre..." />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email</label>
                                <input type="email" placeholder="tu@email.com" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Mensaje</label>
                                <textarea rows={5} placeholder="¿Cómo podemos ayudarte?"></textarea>
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                Enviar Mensaje <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
