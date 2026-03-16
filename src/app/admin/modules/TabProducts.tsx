"use client";
import React from 'react';
import { Plus, Edit, Trash2, Package, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);

    // Filtration
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Cargar preferencia guardada
    React.useEffect(() => {
        const saved = localStorage.getItem('adminProductsPerPage');
        if (saved) {
            setItemsPerPage(Number(saved));
        }
    }, []);

    // Guardar preferencia
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(e.target.value);
        setItemsPerPage(value);
        setCurrentPage(1); // Reset page when changing limits
        localStorage.setItem('adminProductsPerPage', value.toString());
    };

    // Reset page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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

            <div style={{ padding: '0 2rem 1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre, ID o categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Mostrar:</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={handleItemsPerPageChange}
                        style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#334155', cursor: 'pointer', outline: 'none' }}
                    >
                        <option value={10}>10 productos</option>
                        <option value={20}>20 productos</option>
                        <option value={50}>50 productos</option>
                        <option value={100}>100 productos</option>
                    </select>
                </div>
            </div>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Imagen</span>
                    <span>Nombre</span>
                    <span>ID</span>
                    <span>Precio</span>
                    <span>Acciones</span>
                </div>
                {paginatedProducts.length > 0 ? paginatedProducts.map((p: Product) => (
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
                        <p>{searchQuery ? 'No se encontraron productos coincidentes.' : 'No hay productos registrados aún.'}</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '0.5rem' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TabProducts;
