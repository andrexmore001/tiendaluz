"use client";
import React from 'react';
import {
    Save,
    Palette,
    Plus,
    Trash2,
    MessageCircle,
    Smartphone,
    Mail,
    MapPin,
    Bell
} from 'lucide-react';
import styles from '../admin.module.css';
import { SiteSettings } from '@/lib/data';
import TabHeader from './TabHeader';

interface TabSettingsProps {
    localSettings: SiteSettings;
    isSaving: boolean;
    onSave: () => void;
    onChange: (path: string, value: any) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: any) => void;
    onRemoveHeroImage: (idx: number) => void;
    onResetColors: () => void;
    onMenuClick: () => void;
    setLocalSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}

const TabSettings: React.FC<TabSettingsProps> = ({
    localSettings,
    isSaving,
    onSave,
    onChange,
    onFileUpload,
    onRemoveHeroImage,
    onResetColors,
    onMenuClick,
    setLocalSettings
}) => {
    return (
        <div className={styles.tabContent}>
            <TabHeader title="Configuración del Sitio" onMenuClick={onMenuClick}>
                <button
                    className="btn-primary"
                    style={{ background: '#25D366', borderColor: '#25D366' }}
                    onClick={onSave}
                    disabled={isSaving}
                >
                    <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </TabHeader>

            <div className={styles.settingsGrid}>
                {/* Colors */}
                <section className={styles.settingsSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0 }}><Palette size={20} /> Identidad Visual (Colores)</h3>
                        <button
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                            onClick={onResetColors}
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
                                    onChange={(e) => onChange('colors.primary', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.primary}
                                    onChange={(e) => onChange('colors.primary', e.target.value)}
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
                                    onChange={(e) => onChange('colors.secondary', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.secondary}
                                    onChange={(e) => onChange('colors.secondary', e.target.value)}
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
                                    onChange={(e) => onChange('colors.accent', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.accent || '#D4AF37'}
                                    onChange={(e) => onChange('colors.accent', e.target.value)}
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
                                    onChange={(e) => onChange('colors.background', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={localSettings.colors.background || '#FFFFFF'}
                                    onChange={(e) => onChange('colors.background', e.target.value)}
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
                                onChange={(e) => onChange('heroTitle', e.target.value)}
                                placeholder="Ej: Creamos cajas que cuentan historias"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Subtítulo de la Portada</label>
                            <textarea
                                value={localSettings.heroSubtitle || ''}
                                onChange={(e) => onChange('heroSubtitle', e.target.value)}
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
                                            onClick={() => onRemoveHeroImage(idx)}
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
                                        onChange={(e) => onFileUpload(e, 'heroImages')}
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
                                    onChange={(e) => onChange('title', e.target.value)}
                                    placeholder="Ej: Artesana"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Slug (URL personalizada)</label>
                                <input
                                    type="text"
                                    value={localSettings.slug}
                                    onChange={(e) => onChange('slug', e.target.value)}
                                    placeholder="artesana"
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Logo de la Marca</label>
                            <div className={styles.formRow} style={{ marginTop: '0.5rem', gap: '2rem' }}>
                                <div className={styles.uploadBox} style={{ flex: '0 0 150px' }}>
                                    {localSettings.logo ? (
                                        <>
                                            <img src={localSettings.logo} alt="Logo preview" className={styles.previewImg} />
                                            <button
                                                className={styles.deleteFileBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLocalSettings(prev => ({ ...prev, logo: '' }));
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className={styles.emptyUpload}>
                                            <Plus size={24} />
                                            <span>Subir</span>
                                            <input type="file" accept="image/*" onChange={(e) => onFileUpload(e, 'logo')} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className={styles.inputGroup} style={{ margin: 0 }}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>O pega una URL de Cloudinary:</label>
                                        <input
                                            type="text"
                                            value={localSettings.logo || ''}
                                            onChange={(e) => onChange('logo', e.target.value)}
                                            placeholder="https://res.cloudinary.com/..."
                                            style={{ fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        <p style={{ margin: 0 }}>PNG o SVG transparente recomendado.</p>
                                        <p style={{ margin: '0.2rem 0 0 0' }}>Tamaño sugerido: 400x120px.</p>
                                    </div>
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
                                        onChange={(e) => onChange('contact.phone', e.target.value)}
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
                                        onChange={(e) => onChange('contact.email', e.target.value)}
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
                                    onChange={(e) => onChange('contact.address', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Instagram (Usuario)</label>
                                <div className={styles.inputWithIcon}>
                                    <span style={{ position: 'absolute', left: '1rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>@</span>
                                    <input
                                        style={{ paddingLeft: '2rem' }}
                                        type="text"
                                        value={localSettings.contact.instagram}
                                        onChange={(e) => onChange('contact.instagram', e.target.value)}
                                        placeholder="artesana.detalles"
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Facebook (Página)</label>
                                <div className={styles.inputWithIcon}>
                                    <span style={{ position: 'absolute', left: '1rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>/</span>
                                    <input
                                        style={{ paddingLeft: '2rem' }}
                                        type="text"
                                        value={localSettings.contact.facebook}
                                        onChange={(e) => onChange('contact.facebook', e.target.value)}
                                        placeholder="artesana.detalles"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
 
                {/* Chat Bot Configuration */}
                <section className={styles.settingsSection}>
                    <h3><MessageCircle size={20} /> Configuración del Chat Bot</h3>
                    <div className={styles.formStack}>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Business ID (Identificador del Bot)</label>
                                <input
                                    type="text"
                                    value={localSettings.chatBusinessId || ''}
                                    onChange={(e) => onChange('chatBusinessId', e.target.value)}
                                    placeholder="Ej: mvp-test-123"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.chatApiKey || ''}
                                    onChange={(e) => onChange('chatApiKey', e.target.value)}
                                    placeholder="Ej: key_test_123"
                                />
                            </div>
                        </div>
                    </div>
                </section>
 
                <section className={styles.settingsSection}>
                    <h3><Bell size={20} /> Barra de Noticias (Ticker)</h3>
                    <div className={styles.formStack}>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label>Mensaje de la Barra</label>
                                <input
                                    type="text"
                                    value={localSettings.tickerMessage || ''}
                                    onChange={(e) => onChange('tickerMessage', e.target.value)}
                                    placeholder="Ej: ¡Nuevas colecciones disponibles! Envío gratis"
                                />
                            </div>
                            <div className={styles.inputGroup} style={{ flex: '0 0 120px' }}>
                                <label>Estado</label>
                                <div className={styles.toggleWrapper} style={{ marginTop: '0.8rem' }}>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={localSettings.tickerVisible || false}
                                            onChange={(e) => onChange('tickerVisible', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {localSettings.tickerVisible ? 'On' : 'Off'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow} style={{ marginTop: '1rem', gap: '2rem' }}>
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label>Velocidad de Desplazamiento (Menos es más rápido)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="range"
                                        min="5"
                                        max="60"
                                        step="5"
                                        value={localSettings.tickerSpeed || 30}
                                        onChange={(e) => onChange('tickerSpeed', parseInt(e.target.value))}
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ minWidth: '35px', fontWeight: '600', color: 'var(--primary)' }}>
                                        {localSettings.tickerSpeed || 30}s
                                    </span>
                                </div>
                            </div>
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label>Color de la Barra</label>
                                <div className={styles.colorWrapper}>
                                    <input
                                        type="color"
                                        value={localSettings.tickerColor || '#E8A2A2'}
                                        onChange={(e) => onChange('tickerColor', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={localSettings.tickerColor || '#E8A2A2'}
                                        onChange={(e) => onChange('tickerColor', e.target.value)}
                                        placeholder="#E8A2A2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.colorSuggestions} style={{ marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                                Colores sugeridos para resaltar:
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[
                                    { name: 'Mora Vivo', hex: '#FF6B6B' },
                                    { name: 'Dorado Artesana', hex: '#D4AF37' },
                                    { name: 'Negro Elegante', hex: '#1e293b' },
                                    { name: 'Rojo Alerta', hex: '#FF4B2B' }
                                ].map((color) => (
                                    <button
                                        key={color.hex}
                                        title={color.name}
                                        onClick={() => onChange('tickerColor', color.hex)}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '4px',
                                            backgroundColor: color.hex,
                                            border: '1px solid #e2e8f0',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
                            Tip: Colores como el **Dorado** o el **Rojo Alerta** harán que la barra destaque mucho más sobre el resto de la página.
                        </p>
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
};

export default TabSettings;
