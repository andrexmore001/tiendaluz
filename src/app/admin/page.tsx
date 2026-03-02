"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    Settings,
    Layers,
    Plus,
    Box,
    Trash2,
    Edit,
    Save,
    Smartphone,
    LogOut,
    Palette,
    MessageCircle,
    Mail,
    MapPin
} from 'lucide-react';
import { } from '@/lib/data';
import { useSettings } from '@/context/SettingsContext';
import Box3D from '@/components/Three/Box3D';
import styles from './admin.module.css';

export default function AdminPage() {
    const router = useRouter();
    const {
        settings,
        updateSettings,
        products,
        collections,
        addProduct,
        updateProduct,
        deleteProduct,
        addCollection,
        deleteCollection,
        materials,
        storageError,
        clearAllData,
        isAuthenticated,
        logout
    } = useSettings();

    const [activeTab, setActiveTab] = useState('products');
    const [localSettings, setLocalSettings] = useState(settings);

    // Route Protection
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Local form state
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        category: collections[0] || 'Todas',
        description: '',
        image: '',
        boxTexture: '',
        width: 4,
        height: 2,
        depth: 4,
        boxType: 'standard',
        materialId: 'carton-kraft',
        baseColor: '#F9F1E7',
        materialTexture: '' // New field for uploaded texture
    });

    const showToast = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = () => {
        setIsSaving(true);
        updateSettings(localSettings);
        setTimeout(() => {
            setIsSaving(false);
            showToast("¡Configuración guardada correctamente!");
        }, 800);
    };

    const handleSettingChange = (path: string, value: string) => {
        const [section, field] = path.split('.');
        setLocalSettings((prev: SiteSettings) => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(id);
            showToast("Producto eliminado");
        }
    };

    const handleEditProduct = (p: Product) => {
        setEditingProduct(p);
        setFormData({
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description,
            image: p.image || '',
            boxTexture: p.boxTexture || '',
            width: p.dimensions?.width || 4,
            height: p.dimensions?.height || 2,
            depth: p.dimensions?.depth || 4,
            boxType: p.boxType || 'standard',
            materialId: p.materialId || 'carton-kraft',
            baseColor: p.baseColor || '#F9F1E7',
            materialTexture: p.customMaterialTexture || ''
        });
        setShowProductForm(true);
    };

    const handleSubmitProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const newP = {
            id: editingProduct ? editingProduct.id : Date.now().toString(),
            ...formData,
            dimensions: {
                width: Number(formData.width),
                height: Number(formData.height),
                depth: Number(formData.depth)
            },
            boxType: formData.boxType,
            materialId: formData.materialId,
            baseColor: formData.baseColor,
            customMaterialTexture: formData.materialTexture
        };

        if (editingProduct) {
            updateProduct(newP as any);
            showToast("Producto actualizado");
        } else {
            addProduct(newP as any);
            showToast("Producto añadido");
        }

        setShowProductForm(false);
        setEditingProduct(null);
    };

    const handleDeleteCollection = (name: string) => {
        if (confirm(`¿Estás seguro de eliminar la colección "${name}"?`)) {
            deleteCollection(name);
            showToast("Colección eliminada");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'boxTexture') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddCollection = () => {
        const name = prompt('Nombre de la nueva colección:');
        if (name) {
            addCollection(name);
            showToast("Colección añadida");
        }
    };

    return (
        <div className={styles.adminWrapper}>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    background: '#1e293b',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease'
                }}>
                    {notification}
                </div>
            )}
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.adminTitle}>Artesana Admin</h2>
                    <p className={styles.adminUser}>Dispositivo Vinculado</p>
                </div>

                <nav className={styles.nav}>
                    <button
                        className={activeTab === 'products' ? styles.navItemActive : styles.navItem}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={20} />
                        <span>Productos</span>
                    </button>
                    <button
                        className={activeTab === 'collections' ? styles.navItemActive : styles.navItem}
                        onClick={() => setActiveTab('collections')}
                    >
                        <Layers size={20} />
                        <span>Colecciones</span>
                    </button>
                    <button
                        className={activeTab === 'settings' ? styles.navItemActive : styles.navItem}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} />
                        <span>Configuración</span>
                    </button>
                </nav>

                <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/admin/login'); }}>
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                {storageError && (
                    <div className={styles.storageWarning}>
                        <p>⚠️ {storageError}</p>
                        <button onClick={clearAllData} className={styles.resetLink}>Reiniciar Datos</button>
                    </div>
                )}
                {/* TAB: PRODUCTS */}
                {activeTab === 'products' && (
                    <div className={styles.tabContent}>
                        <header className={styles.header}>
                            <h1>Gestión de Productos</h1>
                            <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                                <Plus size={20} /> Agregar Producto
                            </button>
                        </header>

                        <div className={styles.productTable}>
                            <div className={styles.tableHeader}>
                                <span>Imagen</span>
                                <span>Nombre</span>
                                <span>Categoría</span>
                                <span>Precio</span>
                                <span>Acciones</span>
                            </div>
                            {products.length > 0 ? products.map((p: Product) => (
                                <div key={p.id} className={styles.tableRow}>
                                    <img src={p.image} alt={p.name} className={styles.miniImg} />
                                    <span className={styles.pName}>{p.name}</span>
                                    <span className={styles.pCat}>{p.category}</span>
                                    <span className={styles.pPrice}>${p.price.toLocaleString()}</span>
                                    <div className={styles.rowActions}>
                                        <button className={styles.iconBtn} onClick={() => handleEditProduct(p)}><Edit size={16} /></button>
                                        <button className={styles.iconBtnDelete} onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16} /></button>
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
                )}

                {/* TAB: COLLECTIONS */}
                {activeTab === 'collections' && (
                    <div className={styles.tabContent}>
                        <header className={styles.header}>
                            <h1>Colecciones / Categorías</h1>
                            <button className="btn-primary" onClick={handleAddCollection}>
                                <Plus size={20} /> Nueva Colección
                            </button>
                        </header>

                        <div className={styles.collectionsList}>
                            {collections.length > 0 ? collections.map((col: string) => (
                                <div key={col} className={styles.collectionItem}>
                                    <span>{col}</span>
                                    <div className={styles.rowActions}>
                                        {col !== "Todas" && <button className={styles.iconBtnDelete} onClick={() => handleDeleteCollection(col)}><Trash2 size={16} /></button>}
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
                )}

                {/* TAB: SETTINGS */}
                {activeTab === 'settings' && (
                    <div className={styles.tabContent}>
                        <header className={styles.header}>
                            <h1>Configuración del Sitio</h1>
                            <button
                                className="btn-primary"
                                style={{ background: '#25D366', borderColor: '#25D366' }}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </header>

                        <div className={styles.settingsGrid}>
                            {/* Colors */}
                            <section className={styles.settingsSection}>
                                <h3><Palette size={20} /> Identidad Visual (Colores)</h3>
                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Color Primario (Mora)</label>
                                        <div className={styles.colorWrapper}>
                                            <input
                                                type="color"
                                                value={localSettings.colors.primary}
                                                onChange={(e) => handleSettingChange('colors.primary', e.target.value)}
                                            />
                                            <input type="text" value={localSettings.colors.primary} readOnly />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Color Secundario (Beige)</label>
                                        <div className={styles.colorWrapper}>
                                            <input
                                                type="color"
                                                value={localSettings.colors.secondary}
                                                onChange={(e) => handleSettingChange('colors.secondary', e.target.value)}
                                            />
                                            <input type="text" value={localSettings.colors.secondary} readOnly />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Contact */}
                            <section className={styles.settingsSection}>
                                <h3><MessageCircle size={20} /> Información de Contacto</h3>
                                <div className={styles.formStack}>
                                    <div className={styles.inputGroup}>
                                        <label>WhatsApp de Ventas</label>
                                        <div className={styles.inputWithIcon}>
                                            <Smartphone size={18} />
                                            <input
                                                type="text"
                                                value={localSettings.contact.phone}
                                                onChange={(e) => handleSettingChange('contact.phone', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Email de Soporte</label>
                                        <div className={styles.inputWithIcon}>
                                            <Mail size={18} />
                                            <input
                                                type="email"
                                                value={localSettings.contact.email}
                                                onChange={(e) => handleSettingChange('contact.email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Dirección / Showroom</label>
                                        <div className={styles.inputWithIcon}>
                                            <MapPin size={18} />
                                            <input
                                                type="text"
                                                value={localSettings.contact.address}
                                                onChange={(e) => handleSettingChange('contact.address', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* MODAL FOR PRODUCTS */}
                {showProductForm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                <button onClick={() => setShowProductForm(false)}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.previewSection}>
                                    <div className={styles.adminBoxPreview}>
                                        <Box3D
                                            width={Number(formData.width)}
                                            height={Number(formData.height)}
                                            depth={Number(formData.depth)}
                                            boxType={formData.boxType as any}
                                            materialTexture={formData.materialTexture || materials.find((m: any) => m.id === formData.materialId)?.textureUrl}
                                            baseColor={formData.baseColor}
                                            topTexture={formData.boxTexture}
                                        />
                                    </div>
                                    <div className={styles.typeSelector}>
                                        <label>Forma de la Caja</label>
                                        <div className={styles.typeGrid}>
                                            <button
                                                type="button"
                                                className={formData.boxType === 'standard' ? styles.typeBtnActive : styles.typeBtn}
                                                onClick={() => setFormData({ ...formData, boxType: 'standard' })}
                                            >Estandar</button>
                                            <button
                                                type="button"
                                                className={formData.boxType === 'lid-base' ? styles.typeBtnActive : styles.typeBtn}
                                                onClick={() => setFormData({ ...formData, boxType: 'lid-base' })}
                                            >Tapa y Base</button>
                                            <button
                                                type="button"
                                                className={formData.boxType === 'drawer' ? styles.typeBtnActive : styles.typeBtn}
                                                onClick={() => setFormData({ ...formData, boxType: 'drawer' })}
                                            >Cajon</button>
                                        </div>
                                    </div>
                                </div>

                                <form className={styles.form} onSubmit={handleSubmitProduct}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.inputGroup}>
                                            <label>Nombre</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Material</label>
                                            <select
                                                value={formData.materialId}
                                                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                                            >
                                                {materials.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Color Base</label>
                                            <div className={styles.colorWrapper}>
                                                <input
                                                    type="color"
                                                    value={formData.baseColor}
                                                    onChange={(e) => setFormData({ ...formData, baseColor: e.target.value })}
                                                />
                                                <input type="text" value={formData.baseColor} readOnly />
                                            </div>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Precio</label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Categoría</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {collections.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Descripción</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={2}
                                        />
                                    </div>

                                    <div className={styles.dimensionsRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Ancho (cm)</label>
                                            <input
                                                type="number"
                                                value={formData.width}
                                                onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Alto (cm)</label>
                                            <input
                                                type="number"
                                                value={formData.height}
                                                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Largo (cm)</label>
                                            <input
                                                type="number"
                                                value={formData.depth}
                                                onChange={(e) => setFormData({ ...formData, depth: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.fileRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Textura Material (Madera/Cartón)</label>
                                            <div className={styles.uploadBox}>
                                                {formData.materialTexture ? (
                                                    <img src={formData.materialTexture} alt="Preview" className={styles.previewImg} />
                                                ) : (
                                                    <div className={styles.emptyUpload}>
                                                        <Box size={20} />
                                                        <span>Subir Textura</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'materialTexture' as any)}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Foto Catálogo</label>
                                            <div className={styles.uploadBox}>
                                                {formData.image ? (
                                                    <img src={formData.image} alt="Preview" className={styles.previewImg} />
                                                ) : (
                                                    <div className={styles.emptyUpload}>
                                                        <Plus size={20} />
                                                        <span>Subir Foto</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'image')}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Diseño 3D</label>
                                            <div className={styles.uploadBox}>
                                                {formData.boxTexture ? (
                                                    <img src={formData.boxTexture} alt="Preview" className={styles.previewImg} />
                                                ) : (
                                                    <div className={styles.emptyUpload}>
                                                        <Layers size={20} />
                                                        <span>Subir Arte</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'boxTexture')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.formActions}>
                                        <button type="button" onClick={() => setShowProductForm(false)}>Cancelar</button>
                                        <button type="submit" className="btn-primary">
                                            {editingProduct ? 'Guardar' : 'Añadir'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className={styles.dangerZone}>
                                <h3>ZONA DE PELIGRO</h3>
                                <button onClick={clearAllData} className={styles.deleteBtn}>
                                    <Trash2 size={16} /> Resetear Todo el Sitio
                                </button>
                                <p className={styles.dangerText}>Usa esto solo si tienes problemas graves con las fotos o productos que no se guardan.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
