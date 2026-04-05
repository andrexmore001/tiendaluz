"use client";
import React from 'react';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import styles from '../admin.module.css';
import TabHeader from './TabHeader';
import { Supplier } from '@/types/product';

interface TabSuppliersProps {
    suppliers: Supplier[];
    onAdd: () => void;
    onEdit: (s: Supplier) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

const TabSuppliers: React.FC<TabSuppliersProps> = ({ suppliers, onAdd, onEdit, onDelete, onMenuClick }) => {
    return (
        <div className={styles.tabContent}>
            <TabHeader title="Gestión de Proveedores" onMenuClick={onMenuClick}>
                <button className="btn-primary" onClick={onAdd}>
                    <Plus size={20} /> Nuevo Proveedor
                </button>
            </TabHeader>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Icono</span>
                    <span>Nombre</span>
                    <span>Contacto</span>
                    <span>Acciones</span>
                </div>
                {suppliers.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>No hay proveedores configurados.</div>
                ) : (
                    suppliers.map((s) => (
                        <div key={s.id} className={styles.tableRow}>
                            <div className={styles.miniImg} style={{ backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                <Truck size={20} color="#94a3b8" />
                            </div>
                            <span className={styles.pName}>{s.name}</span>
                            <span className={styles.pCat}>{s.contact || 'N/A'}</span>
                            <div className={styles.rowActions}>
                                <button className={styles.iconBtn} onClick={() => onEdit(s)} title="Editar">
                                    <Edit size={16} />
                                </button>
                                <button className={styles.iconBtnDelete} onClick={() => onDelete(s.id)} title="Eliminar">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TabSuppliers;
