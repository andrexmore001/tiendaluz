"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import styles from './contacto.module.css';

export default function ContactoPage() {
    const { settings } = useSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Ocurrió un error inesperado.');
            }
        } catch (error) {
            setStatus('error');
            setErrorMsg('Error de conexión. Intenta de nuevo.');
        }
    };

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
                                    <p>{settings.contact.phone}</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.iconBox}><Mail size={20} /></div>
                                <div>
                                    <p className={styles.label}>Email</p>
                                    <p>{settings.contact.email}</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.iconBox}><MapPin size={20} /></div>
                                <div>
                                    <p className={styles.label}>Showroom</p>
                                    <p>{settings.contact.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSide}>
                        {status === 'success' ? (
                            <div className={styles.successState}>
                                <CheckCircle size={60} color="#25D366" />
                                <h2>¡Mensaje Enviado!</h2>
                                <p>Gracias por contactarnos. Te responderemos lo más pronto posible.</p>
                                <button className="btn-primary" onClick={() => setStatus('idle')}>
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <div className={styles.inputGroup}>
                                    <label>Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Tu nombre..."
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Mensaje</label>
                                    <textarea
                                        name="message"
                                        rows={5}
                                        placeholder="¿Cómo podemos ayudarte?"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>

                                {status === 'error' && <p className={styles.errorText}>{errorMsg}</p>}

                                <button type="submit" className={styles.submitBtn} disabled={status === 'submitting'}>
                                    {status === 'submitting' ? (
                                        <>Enviando... <Loader2 size={18} className={styles.animateSpin} /></>
                                    ) : (
                                        <>Enviar Mensaje <Send size={18} /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
