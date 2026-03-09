"use client";
import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import styles from '../admin.module.css';
import TabHeader from './TabHeader';

interface TabMaterialsProps {
    materials: any[];
    onNew: () => void;
    onEdit: (m: any) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

const TabMaterials: React.FC<TabMaterialsProps> = ({ materials, onNew, onEdit, onDelete, onMenuClick }) => {
    return (
        <div className={styles.tabContent}>
            <TabHeader title="Gestión de Materiales" onMenuClick={onMenuClick}>
                <button className="btn-primary" onClick={onNew}>
                    <Plus size={20} /> Nuevo Material
                </button>
            </TabHeader>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Vista Previa</span>
                    <span>Nombre</span>
                    <span>ID</span>
                    <span>Acciones</span>
                </div>
                {materials.map((m) => (
                    <div key={m.id} className={styles.tableRow}>
                        <div className={styles.miniImg} style={{ background: `url(${m.textureUrl})`, backgroundSize: 'cover', borderRadius: '4px' }}></div>
                        <span className={styles.pName}>{m.name}</span>
                        <span className={styles.pCat}>{m.id}</span>
                        <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => onEdit(m)} title="Editar">
                                <Edit size={16} />
                            </button>
                            <button className={styles.iconBtnDelete} onClick={() => onDelete(m.id)} title="Eliminar">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabMaterials;
