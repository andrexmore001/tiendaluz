"use client";
import React from 'react';
import styles from '../admin.module.css';

interface ModalTextConfigProps {
    editingImageConfig: number | null;
    formData: any;
    setEditingImageConfig: (idx: number | null) => void;
    handleConfigChange: (field: string, value: number) => void;
}

const ModalTextConfig: React.FC<ModalTextConfigProps> = ({
    editingImageConfig,
    formData,
    setEditingImageConfig,
    handleConfigChange
}) => {
    if (editingImageConfig === null || !formData.images[editingImageConfig]) return null;

    const img = formData.images[editingImageConfig];

    return (
        <div className={styles.modal} style={{ zIndex: 5000 }}>
            <div className={styles.modalContent} style={{ maxWidth: '800px', width: '90%' }}>
                <div className={styles.modalHeader}>
                    <h2>Configurar Texto para Imagen</h2>
                    <button onClick={() => setEditingImageConfig(null)}>×</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', marginTop: '1.5rem' }}>
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#f0f0f0', height: '400px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
                            <img
                                src={img.url}
                                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                                alt="Preview"
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: `${img.textConfig?.y ?? 50}%`,
                                    left: `${img.textConfig?.x ?? 50}%`,
                                    transform: `translate(-50%, -50%) rotate(${img.textConfig?.rotation ?? 0}deg) scale(${img.textConfig?.scale ?? 1})`,
                                    color: '#333',
                                    fontWeight: 'bold',
                                    textShadow: '0 0 10px white, 0 0 5px white',
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                    fontSize: '1.5rem',
                                    fontFamily: 'var(--font-display)',
                                    width: '80%',
                                    textAlign: 'center'
                                }}
                            >
                                EJEMPLO TEXTO
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className={styles.inputGroup}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Posición X</span>
                                <span style={{ fontWeight: 'bold' }}>{img.textConfig?.x ?? 50}%</span>
                            </label>
                            <input
                                type="range" min="0" max="100"
                                value={img.textConfig?.x ?? 50}
                                onChange={(e) => handleConfigChange('x', parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Posición Y</span>
                                <span style={{ fontWeight: 'bold' }}>{img.textConfig?.y ?? 50}%</span>
                            </label>
                            <input
                                type="range" min="0" max="100"
                                value={img.textConfig?.y ?? 50}
                                onChange={(e) => handleConfigChange('y', parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Rotación</span>
                                <span style={{ fontWeight: 'bold' }}>{img.textConfig?.rotation ?? 0}°</span>
                            </label>
                            <input
                                type="range" min="-180" max="180"
                                value={img.textConfig?.rotation ?? 0}
                                onChange={(e) => handleConfigChange('rotation', parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Escala</span>
                                <span style={{ fontWeight: 'bold' }}>{img.textConfig?.scale ?? 1}x</span>
                            </label>
                            <input
                                type="range" min="0.5" max="4" step="0.1"
                                value={img.textConfig?.scale ?? 1}
                                onChange={(e) => handleConfigChange('scale', parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn-primary"
                            style={{ marginTop: 'auto', padding: '1rem' }}
                            onClick={() => setEditingImageConfig(null)}
                        >
                            Listo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalTextConfig;
