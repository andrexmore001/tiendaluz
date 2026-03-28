"use client";
import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import styles from '../admin.module.css';

interface TabAttributesProps {
    attributes: any[];
    onAdd: () => void;
    onEdit: (attribute: any) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

export default function TabAttributes({ attributes, onAdd, onEdit, onDelete, onMenuClick }: TabAttributesProps) {
    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className={styles.mobileMenuBtn} onClick={onMenuClick}>☰</button>
                    <h2>Atributos Globales (Tallas, Colores)</h2>
                </div>
                <button className="btn-primary" onClick={onAdd}>
                    <Plus size={18} /> Nuevo Atributo
                </button>
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
