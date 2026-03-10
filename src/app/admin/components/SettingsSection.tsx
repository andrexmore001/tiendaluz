
import {
    Save,
    Palette,
    Plus,
    Trash2,
    MessageCircle,
    Smartphone,
    Mail,
    MapPin
} from 'lucide-react';
import { SiteSettings } from '@/lib/data';
import styles from '../admin.module.css';

interface SettingsSectionProps {
    localSettings: SiteSettings;
    setLocalSettings: (settings: any) => void;
    isSaving: boolean;
    handleSave: () => void;
    handleSettingChange: (path: string, value: any) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: any) => void;
    showToast: (msg: string) => void;
}

export default function SettingsSection({
    localSettings,
    setLocalSettings,
    isSaving,
    handleSave,
    handleSettingChange,
    handleFileUpload,
    showToast
}: SettingsSectionProps) {
    return (
        <div className={styles.tabContent}>
            <header className={styles.header}>
                <h1>Configuración del Sitio</h1>
                <button
                    className="btn-primary"
                    style={{ background: '#25D366', borderColor: '#25D366' }}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </header>

            <div className={styles.settingsGrid}>
                {/* Colors */}
                <section className={styles.settingsSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0 }}><Palette size={20} /> Identidad Visual (Colores)</h3>
                        <button
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => {
                                if (confirm('¿Restablecer los colores a la paleta original de Artesana?')) {
                                    setLocalSettings((prev: SiteSettings) => ({
                                        ...prev,
                                        colors: {
                                            primary: '#E8A2A2',
                                            secondary: '#F9F1E7',
                                            accent: '#D4AF37',
                                            background: '#FFFFFF'
                                        }
                                    }));
                                    showToast("Colores restablecidos");
                                }
                            }}
                        >
                            Restablecer Artesana
                        </button>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                            <label>Color Primario (Mora)</label>
                            <div className={styles.colorWrapper}>
                                <input
                                    type="color"
                                    value={localSettings.colors.primary}
                                    onChange={(e) => handleSettingChange('colors.primary', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.primary}
                                    onChange={(e) => handleSettingChange('colors.primary', e.target.value)}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Color Secundario (Beige)</label>
                            <div className={styles.colorWrapper}>
                                <input
                                    type="color"
                                    value={localSettings.colors.secondary}
                                    onChange={(e) => handleSettingChange('colors.secondary', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.secondary}
                                    onChange={(e) => handleSettingChange('colors.secondary', e.target.value)}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.formRow} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.inputGroup}>
                            <label>Color de Acento (Dorado)</label>
                            <div className={styles.colorWrapper}>
                                <input
                                    type="color"
                                    value={localSettings.colors.accent || '#D4AF37'}
                                    onChange={(e) => handleSettingChange('colors.accent', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.accent || '#D4AF37'}
                                    onChange={(e) => handleSettingChange('colors.accent', e.target.value)}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Color de Fondo</label>
                            <div className={styles.colorWrapper}>
                                <input
                                    type="color"
                                    value={localSettings.colors.background || '#FFFFFF'}
                                    onChange={(e) => handleSettingChange('colors.background', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.background || '#FFFFFF'}
                                    onChange={(e) => handleSettingChange('colors.background', e.target.value)}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hero Configuration */}
                <section className={styles.settingsSection}>
                    <h3><Plus size={20} /> Portada Principal (Hero)</h3>
                    <div className={styles.formStack}>
                        <div className={styles.inputGroup}>
                            <label>Título de la Portada</label>
                            <input
                                type="text"
                                value={localSettings.heroTitle || ''}
                                onChange={(e) => handleSettingChange('heroTitle', e.target.value)}
                                placeholder="Ej: Creamos cajas que cuentan historias"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Subtítulo de la Portada</label>
                            <textarea
                                value={localSettings.heroSubtitle || ''}
                                onChange={(e) => handleSettingChange('heroSubtitle', e.target.value)}
                                placeholder="Ej: Regalos personalizados hechos con amor..."
                                rows={2}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Imágenes de Fondo (Carrusel)</label>
                            <div className={styles.heroImageGrid}>
                                {(localSettings.heroImages || []).map((img, idx) => (
                                    <div key={idx} className={styles.heroImageItem}>
                                        <img src={img || '/placeholder.png'} alt={`Hero ${idx + 1}`} />
                                        <button
                                            type="button"
                                            className={styles.removeHeroBtn}
                                            onClick={() => {
                                                const newImages = [...(localSettings.heroImages || [])];
                                                newImages.splice(idx, 1);
                                                setLocalSettings((prev: any) => ({ ...prev, heroImages: newImages }));
                                            }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <div className={styles.uploadBox} style={{ height: '100px', minWidth: '100px' }}>
                                    <div className={styles.emptyUpload}>
                                        <Plus size={20} />
                                        <span>Añadir</span>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'heroImages')}
                                    />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Sube una o varias imágenes. Si subes varias, se activará un carrusel automáticamente.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Identity */}
                <section className={styles.settingsSection}>
                    <h3><Plus size={20} /> Identidad del Sitio</h3>
                    <div className={styles.formStack}>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Título del Sitio</label>
                                <input
                                    type="text"
                                    value={localSettings.title}
                                    onChange={(e) => handleSettingChange('title', e.target.value)}
                                    placeholder="Ej: Artesana"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Slug (URL personalizada)</label>
                                <input
                                    type="text"
                                    value={localSettings.slug}
                                    onChange={(e) => handleSettingChange('slug', e.target.value)}
                                    placeholder="artesana"
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Logo de la Marca</label>
                            <div className={styles.fileRow} style={{ marginTop: 0 }}>
                                <div className={styles.uploadBox}>
                                    {localSettings.logo ? (
                                        <>
                                            <img src={localSettings.logo} alt="Logo preview" className={styles.previewImg} />
                                            <button
                                                className={styles.deleteFileBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLocalSettings((prev: any) => ({ ...prev, logo: '' }));
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className={styles.emptyUpload}>
                                            <Plus size={24} />
                                            <span>Subir Logo</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                        Se recomienda un archivo PNG o SVG transparente.
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                                        Tamaño sugerido: 400x120px.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className={styles.settingsSection}>
                    <h3><MessageCircle size={20} /> Información de Contacto</h3>
                    <div className={styles.formStack}>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>WhatsApp de Ventas</label>
                                <div className={styles.inputWithIcon}>
                                    <Smartphone size={18} />
                                    <input
                                        type="text"
                                        value={localSettings.contact.phone}
                                        onChange={(e) => handleSettingChange('contact.phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email de Soporte</label>
                                <div className={styles.inputWithIcon}>
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        value={localSettings.contact.email}
                                        onChange={(e) => handleSettingChange('contact.email', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Dirección / Showroom</label>
                            <div className={styles.inputWithIcon}>
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    value={localSettings.contact.address}
                                    onChange={(e) => handleSettingChange('contact.address', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Instagram (Usuario)</label>
                                <div className={styles.inputWithIcon}>
                                    <span style={{ position: 'absolute', left: '1rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>@</span>
                                    <input
                                        style={{ paddingLeft: '2rem !important' }}
                                        type="text"
                                        value={localSettings.contact.instagram}
                                        onChange={(e) => handleSettingChange('contact.instagram', e.target.value)}
                                        placeholder="artesana.detalles"
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Facebook (Página)</label>
                                <div className={styles.inputWithIcon}>
                                    <span style={{ position: 'absolute', left: '1rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>/</span>
                                    <input
                                        style={{ paddingLeft: '2rem !important' }}
                                        type="text"
                                        value={localSettings.contact.facebook}
                                        onChange={(e) => handleSettingChange('contact.facebook', e.target.value)}
                                        placeholder="artesana.detalles"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Info */}
                <section className={styles.settingsSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ color: '#64748b', fontSize: '1.2rem' }}>🕒</span>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>Estado del Sistema</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                    Última actualización: {localSettings.updatedAt ? new Date(localSettings.updatedAt).toLocaleString('es-CO') : 'Nunca'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
