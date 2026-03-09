"use client";
import React from 'react';
import { Plus, Edit, Trash2, Box } from 'lucide-react';
import styles from '../admin.module.css';
import TabHeader from './TabHeader';
import EmptyState from './EmptyState';

interface TabShapesProps {
    boxShapes: any[];
    onAdd: () => void;
    onEdit: (s: any) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

const TabShapes: React.FC<TabShapesProps> = ({ boxShapes, onAdd, onEdit, onDelete, onMenuClick }) => {
    return (
        <div className={styles.tabContent}>
            <TabHeader title="Formas de Caja Corporativas" onMenuClick={onMenuClick}>
                <button className="btn-primary" onClick={onAdd}>
                    <Plus size={20} /> Nueva Forma
                </button>
            </TabHeader>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Nombre</span>
                    <span>Tipo</span>
                    <span>Medidas Base (cm)</span>
                    <span>Acciones</span>
                </div>
                {boxShapes.length > 0 ? boxShapes.map((s) => (
                    <div key={s.id} className={styles.tableRow}>
                        <span className={styles.pName}>{s.name}</span>
                        <span className={styles.pCat} style={{ textTransform: 'capitalize' }}>{s.type}</span>
                        <span className={styles.pPrice}>{s.defaultDimensions.width}x{s.defaultDimensions.height}x{s.defaultDimensions.depth}</span>
                        <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => onEdit(s)} title="Editar">
                                <Edit size={16} />
                            </button>
                            <button className={styles.iconBtnDelete} onClick={() => onDelete(s.id)} title="Eliminar">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <EmptyState Icon={Box} text="No hay formas de caja definidas." />
                )}
            </div>
        </div>
    );
};

export default TabShapes;
