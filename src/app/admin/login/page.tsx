"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Lock, User, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import styles from './login.module.css';

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        try {
            const result = await signIn('credentials', {
                email: username,
                password: password,
                redirect: false,
            });

            if (result?.error) {
                setError(true);
                setIsLoading(false);
            } else {
                window.location.href = '/admin';
            }
        } catch (err) {
            setError(true);
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginCard}>
                <div className={styles.brandSide}>
                    <h1 className={styles.logo}>ARTESANA</h1>
                    <p className={styles.tagline}>Panel de Gestión Artesanal</p>
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
                                placeholder="user"
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
