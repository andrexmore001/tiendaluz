"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Smartphone, RefreshCw, ChevronRight, Lock, User, AlertCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import styles from './login.module.css';

export default function AdminLogin() {
    const router = useRouter();
    const { login, isAuthenticated } = useSettings();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/admin');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        // Simulated delay for premium feel
        setTimeout(() => {
            const success = login(password);
            if (success) {
                router.push('/admin');
            } else {
                setError(true);
                setIsLoading(false);
            }
        }, 1200);
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginCard}>
                <div className={styles.brandSide}>
                    <h1 className={styles.logo}>ARTESANA</h1>
                    <p className={styles.tagline}>Panel de Gestión Artesanal</p>

                    <div className={styles.premiumBadge}>
                        <Lock size={14} /> Sistema Seguro
                    </div>

                    <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
                        Acceso exclusivo para administradores de la marca.
                        Por favor, ingresa tus credenciales para continuar.
                    </p>
                </div>

                <div className={styles.formSide}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h2>Bienvenido de nuevo</h2>

                        <div className={styles.inputGroup}>
                            <label><User size={16} /> Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="tu_usuario"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label><Lock size={16} /> Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className={styles.errorMsg}>
                                <AlertCircle size={16} /> Credenciales incorrectas
                            </div>
                        )}

                        <button className={styles.loginBtn} disabled={isLoading}>
                            {isLoading ? (
                                <RefreshCw size={20} className={styles.spin} />
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </button>

                        <div className={styles.forgot}>
                            <a href="#">¿Olvidaste tu contraseña?</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
