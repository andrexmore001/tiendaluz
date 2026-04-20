"use client";
import React from 'react';
import { Plus, Edit, Trash2, Package, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../admin.module.css';
import { Product } from '@/types/product';
import TabHeader from './TabHeader';
import { formatPrice } from '@/lib/format';

interface TabProductsProps {
    products: Product[];
    onAdd: () => void;
    onEdit: (p: Product) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
    collections: any[];
}

const TabProducts: React.FC<TabProductsProps> = ({ products, onAdd, onEdit, onDelete, onMenuClick, collections }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isBulkLoading, setIsBulkLoading] = React.useState(false);

    // Filtration
    const filteredProducts = products.filter(p => {
        const catName = collections.find((c: any) => c.id === p.collectionId)?.name || '';
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catName.toLowerCase().includes(searchQuery.toLowerCase());
    });

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

    // Handle multiselect
    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === paginatedProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
        }
    };

    const handleBulkAction = async (action: 'hide' | 'show' | 'delete' | 'addRibbon' | 'removeRibbon') => {
        if (selectedIds.size === 0) return;
        if (action === 'delete' && !confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.size} productos?`)) return;

        let payload: any = { productIds: Array.from(selectedIds), action };

        if (action === 'addRibbon') {
             const ribbonText = prompt('Texto de la cinta (Ej: Oferta, Especial Madres):', 'Especial');
             if (ribbonText === null) return; // user cancelled
             payload.ribbonText = ribbonText;
        }

        setIsBulkLoading(true);
        try {
            const res = await fetch('/api/products/bulk-actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Acción completada: ${data.message}`);
                setSelectedIds(new Set());
                window.location.reload();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error during bulk action:', error);
            alert('Ocurrió un error al procesar la acción.');
        } finally {
            setIsBulkLoading(false);
        }
    };

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

    const handleSyncToVentiq = async () => {
        if (!confirm('¿Deseas sincronizar TODO el catálogo con el chatbot? Esto reemplazará los productos actuales en Ventiq por los de Artesana. ¿Continuar?')) return;
        
        setIsBulkLoading(true);
        try {
            const res = await fetch('/api/products/sync', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                alert(`Sincronización masiva exitosa. Productos sincronizados: ${data.synced}`);
            } else {
                alert(`Error al sincronizar: ${data.error}`);
            }
        } catch (error) {
            console.error('Error syncing:', error);
            alert('Error de conexión al sincronizar con el chatbot.');
        } finally {
            setIsBulkLoading(false);
        }
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
                    <button
                        className={styles.secondaryBtn}
                        onClick={handleSyncToVentiq}
                        disabled={isBulkLoading}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isBulkLoading ? styles.animateSpin : ''}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
                        <span>{isBulkLoading ? 'Sincronizando...' : 'Sincronizar a Chatbot'}</span>
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
                        placeholder="Buscar producto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' }}
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {selectedIds.size > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedIds.size} seleccionados</span>
                            <button onClick={() => handleBulkAction('show')} disabled={isBulkLoading} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#dcfce7', color: '#166534' }}>Mostrar</button>
                            <button onClick={() => handleBulkAction('hide')} disabled={isBulkLoading} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#fef9c3', color: '#854d0e' }}>Ocultar</button>
                            <button onClick={() => handleBulkAction('addRibbon')} disabled={isBulkLoading} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#fce7f3', color: '#9d174d' }}>+ Cinta</button>
                            <button onClick={() => handleBulkAction('removeRibbon')} disabled={isBulkLoading} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#f1f5f9', color: '#334155' }}>- Cinta</button>
                            <button onClick={() => handleBulkAction('delete')} disabled={isBulkLoading} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#fee2e2', color: '#991b1b' }}>Eliminar</button>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Mostrar:</span>
                        <select 
                            value={itemsPerPage} 
                            onChange={handleItemsPerPageChange}
                            style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#334155', cursor: 'pointer', outline: 'none' }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.productTable}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '40px 60px 2fr 1.5fr 1fr 100px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" onChange={toggleAll} checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length} style={{ cursor: 'pointer', width: '1rem', height: '1rem' }} />
                    </div>
                    <span>Imagen</span>
                    <span>Nombre</span>
                    <span>ID</span>
                    <span>Precio</span>
                    <span>Acciones</span>
                </div>
                {paginatedProducts.length > 0 ? paginatedProducts.map((p: Product) => (
                    <div key={p.id} className={styles.tableRow} style={{ gridTemplateColumns: '40px 60px 2fr 1.5fr 1fr 100px', backgroundColor: selectedIds.has(p.id) ? '#f0f9ff' : 'transparent', opacity: p.isVisible === false ? 0.6 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelection(p.id)} style={{ cursor: 'pointer', width: '1rem', height: '1rem' }} />
                        </div>
                        <img src={p.image || '/placeholder.png'} alt={p.name} className={styles.miniImg} />
                        <span className={styles.pName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {p.name}
                            {p.isVisible === false && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontWeight: 'bold' }}>OCULTO</span>}
                        </span>
                        <code className={styles.pCat} style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7 }}>{p.id}</code>
                        <span className={styles.pPrice}>${formatPrice(p.price || 0)}</span>
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
