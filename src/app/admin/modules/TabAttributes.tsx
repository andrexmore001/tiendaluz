"use client";
import React from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import styles from '../admin.module.css';

interface TabAttributesProps {
    attributes: any[];
    onAdd: () => void;
    onEdit: (attribute: any) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

export default function TabAttributes({ attributes, onAdd, onEdit, onDelete, onMenuClick }: TabAttributesProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvText = event.target?.result as string;
            try {
                const res = await fetch('/api/attributes/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ csv: csvText })
                });

                const data = await res.json();
                if (res.ok) {
                    alert(`Éxito: ${data.message}`);
                    window.location.reload(); 
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error during attributes bulk upload:', error);
                alert('Ocurrió un error al subir el archivo masivo.');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className={styles.mobileMenuBtn} onClick={onMenuClick}>☰</button>
                    <h2>Atributos Globales (Tallas, Colores)</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleBulkUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Upload style={{ animation: 'spin 1s linear infinite' }} size={18} /> : <Upload size={18} />}
                        <span>{isUploading ? 'Subiendo...' : 'Carga Masiva (CSV)'}</span>
                    </button>
                    <button className="btn-primary" onClick={onAdd}>
                        <Plus size={18} /> Nuevo Atributo
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {attributes.map((attr) => (
                    <div key={attr.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>{attr.name}</h3>
                            <div className={styles.cardActions}>
                                <button onClick={() => onEdit(attr)} className={styles.iconBtn} title="Editar"><Edit size={16} /></button>
                                <button onClick={() => onDelete(attr.id)} className={`${styles.iconBtn} ${styles.danger}`} title="Eliminar"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Valores: {attr.values?.map((v: any) => v.value).join(', ') || 'Ninguno'}
                            </p>
                        </div>
                    </div>
                ))}
                {attributes.length === 0 && (
                    <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                        <p>No hay atributos configurados. Añade uno para empezar a crear variantes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
