"use client";
import React from 'react';
import { Plus, Edit, Trash2, Package, Upload } from 'lucide-react';
import styles from '../admin.module.css';
import { Product } from '@/types/product';
import TabHeader from './TabHeader';

interface TabProductsProps {
    products: Product[];
    onAdd: () => void;
    onEdit: (p: Product) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

const TabProducts: React.FC<TabProductsProps> = ({ products, onAdd, onEdit, onDelete, onMenuClick }) => {
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
                const res = await fetch('/api/products/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ csv: csvText })
                });

                const data = await res.json();
                if (res.ok) {
                    alert(`Éxito: ${data.message}`);
                    window.location.reload(); // Simple way to refresh products via bootstrap
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error during bulk upload:', error);
                alert('Ocurrió un error al subir el archivo.');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className={styles.tabContent}>
            <TabHeader title="Gestión de Productos" onMenuClick={onMenuClick}>
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
                        {isUploading ? <Upload className={styles.animateSpin} size={18} /> : <Upload size={18} />}
                        <span>{isUploading ? 'Subiendo...' : 'Carga Masiva (CSV)'}</span>
                    </button>
                    <button className="btn-primary" onClick={onAdd}>
                        <Plus size={20} /> Agregar Producto
                    </button>
                </div>
            </TabHeader>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Imagen</span>
                    <span>Nombre</span>
                    <span>ID</span>
                    <span>Precio</span>
                    <span>Acciones</span>
                </div>
                {products.length > 0 ? products.map((p: Product) => (
                    <div key={p.id} className={styles.tableRow}>
                        <img src={p.image || '/placeholder.png'} alt={p.name} className={styles.miniImg} />
                        <span className={styles.pName}>{p.name}</span>
                        <code className={styles.pCat} style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7 }}>{p.id}</code>
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
