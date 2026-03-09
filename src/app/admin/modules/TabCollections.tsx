"use client";
import React from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import styles from '../admin.module.css';
import TabHeader from './TabHeader';

interface TabCollectionsProps {
    collections: any[];
    onAdd: () => void;
    onEdit: (col: any) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

const TabCollections: React.FC<TabCollectionsProps> = ({ collections, onAdd, onEdit, onDelete, onMenuClick }) => {
    return (
        <div className={styles.tabContent}>
            <TabHeader title="Colecciones / Categorías" onMenuClick={onMenuClick}>
                <button className="btn-primary" onClick={onAdd}>
                    <Plus size={20} /> Nueva Colección
                </button>
            </TabHeader>

            <div className={styles.collectionsList}>
                {collections.length > 0 ? collections.map((col: any) => (
                    <div key={col.id} className={styles.collectionItem}>
                        <div className={styles.colInfo}>
                            <span className={styles.colName}>{col.name}</span>
                            <p className={styles.colDesc}>{col.description}</p>
                        </div>
                        <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => onEdit(col)} title="Editar">
                                <Edit size={16} />
                            </button>
                            {col.name !== "Todas" && (
                                <button className={styles.iconBtnDelete} onClick={() => onDelete(col.id)} title="Eliminar">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className={styles.emptyState}>
                        <Layers size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No hay colecciones creadas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabCollections;
