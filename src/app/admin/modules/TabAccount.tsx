"use client";
import React from 'react';
import { Lock, RefreshCw, Save } from 'lucide-react';
import styles from '../admin.module.css';
import TabHeader from './TabHeader';

interface TabAccountProps {
    session: any;
    isSaving: boolean;
    onSave: (e: React.FormEvent) => Promise<void>;
    onMenuClick: () => void;
}

const TabAccount: React.FC<TabAccountProps> = ({ session, isSaving, onSave, onMenuClick }) => {
    return (
        <div className={styles.tabContent}>
            <TabHeader title="Administración de Cuenta" onMenuClick={onMenuClick} />

            <div className={styles.settingsGrid}>
                <section className={styles.settingsSection}>
                    <h3><Lock size={20} /> Seguridad y Acceso</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                        Mantén tus credenciales de acceso actualizadas para proteger tu panel.
                    </p>

                    <form onSubmit={onSave} className={styles.formStack}>
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
};

export default TabAccount;
