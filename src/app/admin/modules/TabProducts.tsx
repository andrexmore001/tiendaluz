"use client";
import React from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import styles from '../admin.module.css';
import { Product } from '@/types/product';
import TabHeader from './TabHeader';

interface TabProductsProps {
    products: Product[];
    onNew: () => void;
    onEdit: (p: Product) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

const TabProducts: React.FC<TabProductsProps> = ({ products, onNew, onEdit, onDelete, onMenuClick }) => {
    return (
        <div className={styles.tabContent}>
            <TabHeader title="Gestión de Productos" onMenuClick={onMenuClick}>
                <button className="btn-primary" onClick={onNew}>
                    <Plus size={20} /> Agregar Producto
                </button>
            </TabHeader>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Imagen</span>
                    <span>Nombre</span>
                    <span>Precio</span>
                    <span>Acciones</span>
                </div>
                {products.length > 0 ? products.map((p: Product) => (
                    <div key={p.id} className={styles.tableRow}>
                        <img src={p.image || '/placeholder.png'} alt={p.name} className={styles.miniImg} />
                        <span className={styles.pName}>{p.name}</span>
                        <span className={styles.pPrice}>${(p.price || 0).toLocaleString()}</span>
                        <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => onEdit(p)} title="Editar">
                                <Edit size={16} />
                            </button>
                            <button className={styles.iconBtnDelete} onClick={() => onDelete(p.id)} title="Eliminar">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className={styles.emptyState}>
                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No hay productos registrados aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabProducts;
