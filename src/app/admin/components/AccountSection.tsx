
import { Save, Lock, RefreshCw } from 'lucide-react';
import styles from '../admin.module.css';

interface AccountSectionProps {
    session: any;
    isSaving: boolean;
    setIsSaving: (saving: boolean) => void;
    setNotification: (notif: string | null) => void;
}

export default function AccountSection({
    session,
    isSaving,
    setIsSaving,
    setNotification
}: AccountSectionProps) {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const confirmStr = (form.elements.namedItem('confirm') as HTMLInputElement).value;

        if (password && password !== confirmStr) {
            setNotification('Las contraseñas no coinciden');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                setNotification('Perfil actualizado con éxito');
                form.reset();
            } else {
                setNotification('Error al actualizar perfil');
            }
        } catch (err) {
            setNotification('Error de conexión');
        } finally {
            setIsSaving(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className={styles.tabContent}>
            <header className={styles.header}>
                <h1>Administración de Cuenta</h1>
            </header>

            <div className={styles.settingsGrid}>
                <section className={styles.settingsSection}>
                    <h3><Lock size={20} /> Seguridad y Acceso</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                        Mantén tus credenciales de acceso actualizadas para proteger tu panel.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.formStack}>
                        <div className={styles.inputGroup}>
                            <label>Email de Usuario</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={session?.user?.email || ''}
                                required
                            />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Nueva Contraseña (opcional)</label>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Dejar vacío para no cambiar"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Confirmar Contraseña</label>
                                <input
                                    name="confirm"
                                    type="password"
                                    placeholder="Confirmar nueva contraseña"
                                />
                            </div>
                        </div>

                        <div className={styles.settingsActions} style={{ marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={isSaving}>
                                {isSaving ? <RefreshCw size={20} className={styles.spin} /> : <Save size={20} />}
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
