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
    MapPin,
    Type,
    Menu,
    X,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useSession, signOut } from 'next-auth/react';
import Box3D from '@/components/Three/Box3D';
import { Product } from '@/types/product';
import { SiteSettings } from '@/lib/data';
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
        updateCollection,
        deleteCollection,
        materials,
        storageError,
        clearAllData,
        boxShapes,
        addBoxShape,
        updateBoxShape,
        deleteBoxShape,
        addMaterial,
        updateMaterial,
        deleteMaterial
    } = useSettings();

    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState('products');
    const [localSettings, setLocalSettings] = useState(settings);

    // Initial redirect handled by middleware, but we can keep a safety check or loading state
    if (status === "loading") return <div className={styles.loading}>Cargando...</div>;
    if (!session) return null;

    // PREVENT STALE SETTINGS: Update localSettings when global settings load from localStorage
    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);


    const [showProductForm, setShowProductForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false); // Global open state for previews
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Box Shape Form State
    const [showShapeForm, setShowShapeForm] = useState(false);
    const [editingShape, setEditingShape] = useState<any>(null);
    const [shapeFormData, setShapeFormData] = useState({
        name: '',
        type: 'standard',
        width: 4,
        height: 2,
        depth: 4,
        hingeEdge: 'long',
        flapsLocation: 'base',
        flapHeightPercent: 0.25,
        flapWidthOffset: -0.2,
        flapType: 'rectangular',
        tuckFlapHeightPercent: 0.15
    });

    // Material Form State
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [materialFormData, setMaterialFormData] = useState({
        name: '',
        textureUrl: '',
        baseColor: '#e3c5a8'
    });

    // Collection Form State
    const [showCollectionForm, setShowCollectionForm] = useState(false);
    const [editingCollection, setEditingCollection] = useState<any>(null);
    const [collectionFormData, setCollectionFormData] = useState({
        name: '',
        description: ''
    });

    // Local form state
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        category: collections[0]?.name || 'Todas',
        description: '',
        image: '',
        boxTexture: '',
        displayMode: '3d' as '3d' | 'photos' | 'both',
        images: [] as { url: string; isCustomizable?: boolean; textConfig?: { x: number; y: number; rotation: number; scale: number; } }[],
        width: 4,
        height: 2,
        depth: 4,
        boxType: 'standard',
        materialId: 'carton-kraft',
        baseColor: '#F9F1E7',
        materialTexture: '',
        shapeId: '',
        hingeEdge: 'long',
        flapsLocation: 'base',
        flapHeightPercent: 0.25,
        flapWidthOffset: -0.2,
        flapType: 'rectangular',
        tuckFlapHeightPercent: 0.15,
        priceTiers: [] as { id?: string; minQty: number; maxQty?: number | null; unitPrice: number; }[]
    });

    const [editingImageConfig, setEditingImageConfig] = useState<number | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
        if (!path.includes('.')) {
            setLocalSettings((prev: SiteSettings) => ({
                ...prev,
                [path]: value
            }));
            return;
        }

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
            displayMode: p.displayMode || '3d',
            images: Array.isArray(p.images)
                ? p.images.map(img => typeof img === 'string' ? { url: img, textConfig: { x: 50, y: 50, rotation: 0, scale: 1 } } : img)
                : [],
            width: p.dimensions?.width || 4,
            height: p.dimensions?.height || 2,
            depth: p.dimensions?.depth || 4,
            boxType: p.boxType || 'standard',
            materialId: p.materialId || 'carton-kraft',
            baseColor: p.baseColor || '#F9F1E7',
            materialTexture: p.customMaterialTexture || '',
            shapeId: p.shapeId || '',
            hingeEdge: p.hingeEdge || 'long',
            flapsLocation: p.flapsLocation || 'base',
            flapHeightPercent: p.flapHeightPercent || 0.25,
            flapWidthOffset: p.flapWidthOffset || -0.2,
            flapType: p.flapType || 'rectangular',
            tuckFlapHeightPercent: p.tuckFlapHeightPercent || 0.15,
            priceTiers: p.priceTiers || []
        });
        setShowProductForm(true);
    };

    const handleShapeChange = (shapeId: string) => {
        const shape = boxShapes.find(s => s.id === shapeId);
        if (shape) {
            setFormData({
                ...formData,
                shapeId: shape.id,
                boxType: shape.type,
                width: shape.defaultDimensions.width,
                height: shape.defaultDimensions.height,
                depth: shape.defaultDimensions.depth,
                hingeEdge: shape.hingeEdge || 'long',
                flapsLocation: shape.flapsLocation || 'base',
                flapHeightPercent: shape.flapHeightPercent || 0.25,
                flapWidthOffset: shape.flapWidthOffset || -0.2,
                flapType: shape.flapType || 'rectangular',
                tuckFlapHeightPercent: shape.tuckFlapHeightPercent || 0.15
            });
        } else {
            setFormData({ ...formData, shapeId: '' });
        }
    };

    const handleSubmitProduct = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for photos mode
        if ((formData.displayMode === 'photos' || formData.displayMode === 'both') && formData.images.length < 2) {
            showToast("El modo fotos requiere al menos 2 imágenes en la galería");
            return;
        }

        const selectedMaterial = materials.find(m => m.id === formData.materialId);
        const newP = {
            id: editingProduct ? editingProduct.id : Date.now().toString(),
            ...formData,
            displayMode: formData.displayMode,
            images: formData.images,
            dimensions: {
                width: Number(formData.width),
                height: Number(formData.height),
                depth: Number(formData.depth)
            },
            boxType: formData.boxType,
            materialId: formData.materialId,
            baseColor: formData.baseColor || selectedMaterial?.baseColor || '#F9F1E7',
            customMaterialTexture: formData.materialTexture,
            hingeEdge: formData.hingeEdge,
            flapsLocation: formData.flapsLocation,
            flapHeightPercent: Number(formData.flapHeightPercent),
            flapWidthOffset: Number(formData.flapWidthOffset),
            flapType: formData.flapType,
            tuckFlapHeightPercent: Number(formData.tuckFlapHeightPercent),
            priceTiers: formData.priceTiers
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

    const handleAddTier = () => {
        const lastTier = formData.priceTiers[formData.priceTiers.length - 1];
        const nextMin = lastTier ? (lastTier.maxQty ? lastTier.maxQty + 1 : lastTier.minQty + 1) : 1;

        // Default to 10% discount from base price for new tier
        const defaultDiscount = 10;
        const newPrice = Math.round(formData.price * (1 - defaultDiscount / 100));

        setFormData(prev => ({
            ...prev,
            priceTiers: [
                ...prev.priceTiers,
                { minQty: nextMin, maxQty: null, unitPrice: newPrice }
            ]
        }));
    };

    const handleRemoveTier = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            priceTiers: prev.priceTiers.filter((_: any, i: number) => i !== idx)
        }));
    };

    const handleTierChange = (idx: number, field: string, value: any) => {
        const newTiers = [...formData.priceTiers];
        const tier = { ...newTiers[idx], [field]: value };

        // If discount % changed, update unitPrice
        if (field === 'discount') {
            tier.unitPrice = Math.round(formData.price * (1 - (value / 100)));
        }
        // If unitPrice changed, update discount (calculated field)
        else if (field === 'unitPrice') {
            // Internal use only if needed, but we mostly use field to detect intent
        }

        newTiers[idx] = tier;
        setFormData({ ...formData, priceTiers: newTiers });
    };

    const handleDeleteCollection = (id: string) => {
        const col = collections.find(c => c.id === id);
        if (col && confirm(`¿Estás seguro de eliminar la colección "${col.name}"?`)) {
            deleteCollection(id);
            showToast("Colección eliminada");
        }
    };

    const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG with 0.7 quality
            };
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'boxTexture' | 'gallery' | 'materialTexture' | 'logo' | 'heroImages') => {
        const files = e.target.files;
        if (!files) return;

        if (field === 'heroImages') {
            const readers = Array.from(files).map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });

            const results = await Promise.all(readers);
            setLocalSettings(prev => ({
                ...prev,
                heroImages: [...(prev.heroImages || []), ...results]
            }));
            return;
        }

        if (field === 'gallery') {
            const newImages: any[] = [...formData.images];
            for (const file of Array.from(files)) {
                await new Promise<void>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const compressed = await compressImage(reader.result as string);
                        newImages.push({
                            url: compressed,
                            isCustomizable: false
                        });
                        setFormData(prev => ({ ...prev, images: [...newImages] }));
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
        } else {
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const compressed = await compressImage(reader.result as string);
                    if (field === 'logo') {
                        setLocalSettings(prev => ({ ...prev, logo: compressed }));
                    } else {
                        setFormData(prev => ({ ...prev, [field]: compressed }));
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        if (editingImageConfig === index) {
            setEditingImageConfig(null);
        } else if (editingImageConfig !== null && editingImageConfig > index) {
            setEditingImageConfig(editingImageConfig - 1);
        }
    };

    const toggleImageCustomization = (index: number) => {
        const newImages = [...formData.images];
        const current = newImages[index];
        const isCustomizable = !current.isCustomizable;

        newImages[index] = {
            ...current,
            isCustomizable,
            // If enabling, ensure textConfig exists
            textConfig: isCustomizable ? (current.textConfig || { x: 50, y: 50, rotation: 0, scale: 1 }) : current.textConfig
        };

        setFormData({ ...formData, images: newImages });
        if (isCustomizable) {
            setEditingImageConfig(index);
        } else if (editingImageConfig === index) {
            setEditingImageConfig(null);
        }
    };

    const handleAddCollection = () => {
        setEditingCollection(null);
        setCollectionFormData({ name: '', description: '' });
        setShowCollectionForm(true);
    };

    const handleEditCollection = (col: any) => {
        setEditingCollection(col);
        setCollectionFormData({
            name: col.name,
            description: col.description || ''
        });
        setShowCollectionForm(true);
    };

    const handleSubmitCollection = (e: React.FormEvent) => {
        e.preventDefault();
        const newCol = {
            id: editingCollection ? editingCollection.id : `col_${Date.now()}`,
            name: collectionFormData.name,
            description: collectionFormData.description
        };

        if (editingCollection) {
            updateCollection(newCol);
            showToast("Colección actualizada");
        } else {
            addCollection(newCol);
            showToast("Colección añadida");
        }
        setShowCollectionForm(false);
        setEditingCollection(null);
    };

    const handleEditShape = (s: any) => {
        setEditingShape(s);
        setShapeFormData({
            name: s.name,
            type: s.type,
            width: s.defaultDimensions.width,
            height: s.defaultDimensions.height,
            depth: s.defaultDimensions.depth,
            hingeEdge: s.hingeEdge || 'long',
            flapsLocation: s.flapsLocation || 'base',
            flapHeightPercent: s.flapHeightPercent || 0.25,
            flapWidthOffset: s.flapWidthOffset || -0.2,
            flapType: s.flapType || 'rectangular',
            tuckFlapHeightPercent: s.tuckFlapHeightPercent || 0.15
        });
        setShowShapeForm(true);
    };

    const handleSubmitShape = (e: React.FormEvent) => {
        e.preventDefault();
        const newS = {
            id: editingShape ? editingShape.id : `shape_${Date.now()}`,
            name: shapeFormData.name,
            type: shapeFormData.type as any,
            defaultDimensions: {
                width: Number(shapeFormData.width),
                height: Number(shapeFormData.height),
                depth: Number(shapeFormData.depth)
            },
            hingeEdge: shapeFormData.hingeEdge as any,
            flapsLocation: shapeFormData.flapsLocation as any,
            flapHeightPercent: Number(shapeFormData.flapHeightPercent),
            flapWidthOffset: Number(shapeFormData.flapWidthOffset),
            flapType: shapeFormData.flapType as any,
            tuckFlapHeightPercent: Number(shapeFormData.tuckFlapHeightPercent)
        };

        if (editingShape) {
            updateBoxShape(newS as any);
            showToast("Forma actualizada");
        } else {
            addBoxShape(newS as any);
            showToast("Forma añadida");
        }
        setShowShapeForm(false);
        setEditingShape(null);
    };

    const handleDeleteShape = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta forma? Los productos que la usan podrían verse afectados.')) {
            deleteBoxShape(id);
            showToast("Forma eliminada");
        }
    };

    const handleEditMaterial = (m: any) => {
        setEditingMaterial(m);
        setMaterialFormData({
            name: m.name,
            textureUrl: m.textureUrl,
            baseColor: m.baseColor || '#FFFFFF'
        });
        setShowMaterialForm(true);
    };

    const handleSubmitMaterial = (e: React.FormEvent) => {
        e.preventDefault();
        const newM = {
            id: editingMaterial ? editingMaterial.id : `mat_${Date.now()}`,
            name: materialFormData.name,
            textureUrl: materialFormData.textureUrl,
            baseColor: materialFormData.baseColor
        };

        if (editingMaterial) {
            updateMaterial(newM as any);
            showToast("Material actualizado");
        } else {
            addMaterial(newM as any);
            showToast("Material añadido");
        }
        setShowMaterialForm(false);
        setEditingMaterial(null);
    };

    const handleConfigChange = (field: string, value: number) => {
        if (editingImageConfig === null) return;
        const newImages = [...formData.images];
        const currentImg = newImages[editingImageConfig];
        newImages[editingImageConfig] = {
            ...currentImg,
            textConfig: {
                ...(currentImg.textConfig || { x: 50, y: 50, rotation: 0, scale: 1 }),
                [field]: value
            }
        } as any;
        setFormData({ ...formData, images: newImages });
    };

    const handleDeleteMaterial = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este material?')) {
            deleteMaterial(id);
            showToast("Material eliminado");
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
            {/* Sidebar Overlay (Mobile) */}
            {mobileMenuOpen && (
                <div
                    className={styles.sidebarOverlay}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.mobileClose}>
                    <button onClick={() => setMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.adminTitle}>{settings.title} Admin</h2>
                    <p className={styles.adminUser}>Dispositivo Vinculado</p>
                </div>

                <nav className={styles.nav}>
                    <button
                        className={activeTab === 'products' ? styles.navItemActive : styles.navItem}
                        onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                    >
                        <Package size={20} />
                        <span>Productos</span>
                    </button>
                    <button
                        className={activeTab === 'collections' ? styles.navItemActive : styles.navItem}
                        onClick={() => { setActiveTab('collections'); setMobileMenuOpen(false); }}
                    >
                        <Layers size={20} />
                        <span>Colecciones</span>
                    </button>
                    <button
                        className={activeTab === 'settings' ? styles.navItemActive : styles.navItem}
                        onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                    >
                        <Settings size={20} />
                        <span>Configuración</span>
                    </button>
                    <button
                        className={activeTab === 'materials' ? styles.navItemActive : styles.navItem}
                        onClick={() => { setActiveTab('materials'); setMobileMenuOpen(false); }}
                    >
                        <Palette size={20} />
                        <span>Materiales</span>
                    </button>
                    <button
                        className={activeTab === 'shapes' ? styles.navItemActive : styles.navItem}
                        onClick={() => { setActiveTab('shapes'); setMobileMenuOpen(false); }}
                    >
                        <Box size={20} />
                        <span>Formas de Caja</span>
                    </button>
                </nav>

                <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/admin/login' })}>
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
                            <div className={styles.headerTitleGroup}>
                                <button
                                    className={styles.mobileMenuToggle}
                                    onClick={() => setMobileMenuOpen(true)}
                                >
                                    <Menu size={24} />
                                </button>
                                <h1>Gestión de Productos</h1>
                            </div>
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
                            {collections.length > 0 ? collections.map((col: any) => (
                                <div key={col.id} className={styles.collectionItem}>
                                    <div className={styles.colInfo}>
                                        <span className={styles.colName}>{col.name}</span>
                                        <p className={styles.colDesc}>{col.description}</p>
                                    </div>
                                    <div className={styles.rowActions}>
                                        <button className={styles.iconBtn} onClick={() => handleEditCollection(col)}><Edit size={16} /></button>
                                        {col.name !== "Todas" && <button className={styles.iconBtnDelete} onClick={() => handleDeleteCollection(col.id)}><Trash2 size={16} /></button>}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}><Palette size={20} /> Identidad Visual (Colores)</h3>
                                    <button
                                        className="btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                        onClick={() => {
                                            if (confirm('¿Restablecer los colores a la paleta original de Artesana?')) {
                                                setLocalSettings((prev: SiteSettings) => ({
                                                    ...prev,
                                                    colors: {
                                                        primary: '#E8A2A2',
                                                        secondary: '#F9F1E7',
                                                        accent: '#D4AF37',
                                                        background: '#FFFFFF'
                                                    }
                                                }));
                                                showToast("Colores restablecidos");
                                            }
                                        }}
                                    >
                                        Restablecer Artesana
                                    </button>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Color Primario (Mora)</label>
                                        <div className={styles.colorWrapper}>
                                            <input
                                                type="color"
                                                value={localSettings.colors.primary}
                                                onChange={(e) => handleSettingChange('colors.primary', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                value={localSettings.colors.primary}
                                                onChange={(e) => handleSettingChange('colors.primary', e.target.value)}
                                                placeholder="#000000"
                                            />
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
                                            <input
                                                type="text"
                                                value={localSettings.colors.secondary}
                                                onChange={(e) => handleSettingChange('colors.secondary', e.target.value)}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.formRow} style={{ marginTop: '1.5rem' }}>
                                    <div className={styles.inputGroup}>
                                        <label>Color de Acento (Dorado)</label>
                                        <div className={styles.colorWrapper}>
                                            <input
                                                type="color"
                                                value={localSettings.colors.accent || '#D4AF37'}
                                                onChange={(e) => handleSettingChange('colors.accent', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                value={localSettings.colors.accent || '#D4AF37'}
                                                onChange={(e) => handleSettingChange('colors.accent', e.target.value)}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Color de Fondo</label>
                                        <div className={styles.colorWrapper}>
                                            <input
                                                type="color"
                                                value={localSettings.colors.background || '#FFFFFF'}
                                                onChange={(e) => handleSettingChange('colors.background', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                value={localSettings.colors.background || '#FFFFFF'}
                                                onChange={(e) => handleSettingChange('colors.background', e.target.value)}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Hero Configuration */}
                            <section className={styles.settingsSection}>
                                <h3><Plus size={20} /> Portada Principal (Hero)</h3>
                                <div className={styles.formStack}>
                                    <div className={styles.inputGroup}>
                                        <label>Título de la Portada</label>
                                        <input
                                            type="text"
                                            value={localSettings.heroTitle || ''}
                                            onChange={(e) => handleSettingChange('heroTitle', e.target.value)}
                                            placeholder="Ej: Creamos cajas que cuentan historias"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Subtítulo de la Portada</label>
                                        <textarea
                                            value={localSettings.heroSubtitle || ''}
                                            onChange={(e) => handleSettingChange('heroSubtitle', e.target.value)}
                                            placeholder="Ej: Regalos personalizados hechos con amor..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Imágenes de Fondo (Carrusel)</label>
                                        <div className={styles.heroImageGrid}>
                                            {(localSettings.heroImages || []).map((img, idx) => (
                                                <div key={idx} className={styles.heroImageItem}>
                                                    <img src={img} alt={`Hero ${idx + 1}`} />
                                                    <button
                                                        type="button"
                                                        className={styles.removeHeroBtn}
                                                        onClick={() => {
                                                            const newImages = [...(localSettings.heroImages || [])];
                                                            newImages.splice(idx, 1);
                                                            setLocalSettings(prev => ({ ...prev, heroImages: newImages }));
                                                        }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className={styles.uploadBox} style={{ height: '100px', minWidth: '100px' }}>
                                                <div className={styles.emptyUpload}>
                                                    <Plus size={20} />
                                                    <span>Añadir</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'heroImages' as any)}
                                                />
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                                            Sube una o varias imágenes. Si subes varias, se activará un carrusel automáticamente.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Identity */}
                            <section className={styles.settingsSection}>
                                <h3><Plus size={20} /> Identidad del Sitio</h3>
                                <div className={styles.formStack}>
                                    <div className={styles.formRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Título del Sitio</label>
                                            <input
                                                type="text"
                                                value={localSettings.title}
                                                onChange={(e) => handleSettingChange('title', e.target.value)}
                                                placeholder="Ej: Artesana"
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Slug (URL personalizada)</label>
                                            <input
                                                type="text"
                                                value={localSettings.slug}
                                                onChange={(e) => handleSettingChange('slug', e.target.value)}
                                                placeholder="artesana"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Logo de la Marca</label>
                                        <div className={styles.fileRow} style={{ marginTop: 0 }}>
                                            <div className={styles.uploadBox}>
                                                {localSettings.logo ? (
                                                    <>
                                                        <img src={localSettings.logo} alt="Logo preview" className={styles.previewImg} />
                                                        <button
                                                            className={styles.deleteFileBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLocalSettings(prev => ({ ...prev, logo: '' }));
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className={styles.emptyUpload}>
                                                        <Plus size={24} />
                                                        <span>Subir Logo</span>
                                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                                    Se recomienda un archivo PNG o SVG transparente.
                                                </p>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                                                    Tamaño sugerido: 400x120px.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Contact */}
                            <section className={styles.settingsSection}>
                                <h3><MessageCircle size={20} /> Información de Contacto</h3>
                                <div className={styles.formStack}>
                                    <div className={styles.formRow}>
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
                                    <div className={styles.formRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Instagram (Usuario)</label>
                                            <div className={styles.inputWithIcon}>
                                                <span style={{ position: 'absolute', left: '1rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>@</span>
                                                <input
                                                    style={{ paddingLeft: '2rem !important' }}
                                                    type="text"
                                                    value={localSettings.contact.instagram}
                                                    onChange={(e) => handleSettingChange('contact.instagram', e.target.value)}
                                                    placeholder="artesana.detalles"
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Facebook (Página)</label>
                                            <div className={styles.inputWithIcon}>
                                                <span style={{ position: 'absolute', left: '1rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>/</span>
                                                <input
                                                    style={{ paddingLeft: '2rem !important' }}
                                                    type="text"
                                                    value={localSettings.contact.facebook}
                                                    onChange={(e) => handleSettingChange('contact.facebook', e.target.value)}
                                                    placeholder="artesana.detalles"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Info */}
                            <section className={styles.settingsSection}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <span style={{ color: '#64748b', fontSize: '1.2rem' }}>🕒</span>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>Estado del Sistema</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                                Última actualización: {localSettings.updatedAt ? new Date(localSettings.updatedAt).toLocaleString('es-CO') : 'Nunca'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-secondary"
                                        style={{ fontSize: '0.8rem', color: '#ef4444', borderColor: '#fee2e2' }}
                                        onClick={clearAllData}
                                    >
                                        Borrar Caché Local
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* TAB: MATERIALS */}
                {activeTab === 'materials' && (
                    <div className={styles.tabContent}>
                        <header className={styles.header}>
                            <h1>Gestión de Materiales</h1>
                            <button className="btn-primary" onClick={() => { setEditingMaterial(null); setMaterialFormData({ name: '', textureUrl: '', baseColor: '#e3c5a8' }); setShowMaterialForm(true); }}>
                                <Plus size={20} /> Nuevo Material
                            </button>
                        </header>

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
                                        <button className={styles.iconBtn} onClick={() => handleEditMaterial(m)}><Edit size={16} /></button>
                                        <button className={styles.iconBtnDelete} onClick={() => handleDeleteMaterial(m.id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: SHAPES */}
                {activeTab === 'shapes' && (
                    <div className={styles.tabContent}>
                        <header className={styles.header}>
                            <h1>Formas de Caja Corporativas</h1>
                            <button className="btn-primary" onClick={() => {
                                setEditingShape(null);
                                setShapeFormData({
                                    name: '',
                                    type: 'standard',
                                    width: 4,
                                    height: 2,
                                    depth: 4,
                                    hingeEdge: 'long',
                                    flapsLocation: 'base',
                                    flapHeightPercent: 0.25,
                                    flapWidthOffset: -0.2,
                                    flapType: 'rectangular',
                                    tuckFlapHeightPercent: 0.15
                                });
                                setShowShapeForm(true);
                            }}>
                                <Plus size={20} /> Nueva Forma
                            </button>
                        </header>

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
                                        <button className={styles.iconBtn} onClick={() => handleEditShape(s)}><Edit size={16} /></button>
                                        <button className={styles.iconBtnDelete} onClick={() => handleDeleteShape(s.id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )) : (
                                <EmptyState Icon={Box} text="No hay formas de caja definidas." />
                            )}
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
                                    <div className={styles.typeSelector}>
                                        <label>Modo de Visualización</label>
                                        <div className={styles.typeToggle} style={{ marginBottom: '1.5rem' }}>
                                            <button
                                                type="button"
                                                className={formData.displayMode === 'photos' ? styles.typeBtnActive : styles.typeBtn}
                                                onClick={() => setFormData({ ...formData, displayMode: 'photos' })}
                                            >Solo Fotos</button>
                                            <button
                                                type="button"
                                                className={formData.displayMode === '3d' ? styles.typeBtnActive : styles.typeBtn}
                                                onClick={() => setFormData({ ...formData, displayMode: '3d' })}
                                            >Solo 3D</button>
                                            <button
                                                type="button"
                                                className={formData.displayMode === 'both' ? styles.typeBtnActive : styles.typeBtn}
                                                onClick={() => setFormData({ ...formData, displayMode: 'both' })}
                                            >Ambos</button>
                                        </div>

                                        {(formData.displayMode === '3d' || formData.displayMode === 'both') && (
                                            <>
                                                <div className={styles.adminBoxPreview}>
                                                    {(() => {
                                                        const selectedMaterial = materials.find(
                                                            (m: any) => m.id === formData.materialId
                                                        );

                                                        return (
                                                            <Box3D
                                                                width={Number(formData.width)}
                                                                height={Number(formData.height)}
                                                                depth={Number(formData.depth)}
                                                                materialData={selectedMaterial}
                                                                customMaterialTexture={formData.materialTexture}
                                                                baseColor={formData.baseColor}
                                                                isOpen={isOpen}
                                                                hingeEdge={formData.hingeEdge as "long" | "short"}
                                                                flapsLocation={formData.flapsLocation as "base" | "lid"}
                                                                flapHeightPercent={Number(formData.flapHeightPercent)}
                                                                flapWidthOffset={Number(formData.flapWidthOffset)}
                                                                flapType={formData.flapType as "rectangular" | "trapezoidal"}
                                                                tuckFlapHeightPercent={Number(formData.tuckFlapHeightPercent)}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                                <div className={styles.previewControls}>
                                                    <button
                                                        type="button"
                                                        className={styles.pBtn}
                                                        onClick={() => setIsOpen(!isOpen)}
                                                    >
                                                        {isOpen ? 'Cerrar Caja' : 'Abrir Caja'}
                                                    </button>
                                                </div>

                                                <label style={{ marginTop: '1.5rem', display: 'block' }}>Forma de la Caja (Modelo)</label>
                                                <select
                                                    className={styles.pSelect}
                                                    value={formData.shapeId || ''}
                                                    onChange={(e) => handleShapeChange(e.target.value)}
                                                    style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                >
                                                    <option value="">-- Personalizado / Ninguna --</option>
                                                    {boxShapes.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                                                </select>

                                                <label>Mecánica Manual</label>
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
                                                    >Tapa/Base</button>
                                                    <button
                                                        type="button"
                                                        className={formData.boxType === 'drawer' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => setFormData({ ...formData, boxType: 'drawer' })}
                                                    >Cajón</button>
                                                </div>
                                            </>
                                        )}
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
                                            {collections.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
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

                                    {(formData.displayMode === '3d' || formData.displayMode === 'both') && (
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
                                    )}

                                    {(formData.displayMode === '3d' || formData.displayMode === 'both') && formData.boxType === 'standard' && (
                                        <>
                                            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                                                <label>Ubicación de la Bisagra</label>
                                                <div className={styles.typeToggle}>
                                                    <button
                                                        type="button"
                                                        className={formData.hingeEdge === 'long' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => setFormData({ ...formData, hingeEdge: 'long' })}
                                                    >Lado Largo</button>
                                                    <button
                                                        type="button"
                                                        className={formData.hingeEdge === 'short' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => setFormData({ ...formData, hingeEdge: 'short' })}
                                                    >Lado Corto</button>
                                                </div>
                                            </div>

                                            <div className={styles.inputGroup} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                                <label>Ubicación de Aletas de Cierre (Aristas)</label>
                                                <div className={styles.typeToggle}>
                                                    <button
                                                        type="button"
                                                        className={formData.flapsLocation === 'base' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => {
                                                            setFormData({ ...formData, flapsLocation: 'base' });
                                                            setIsOpen(true);
                                                        }}
                                                    >En la Caja</button>
                                                    <button
                                                        type="button"
                                                        className={formData.flapsLocation === 'lid' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => {
                                                            setFormData({ ...formData, flapsLocation: 'lid' });
                                                            setIsOpen(true);
                                                        }}
                                                    >En la Tapa</button>
                                                </div>
                                            </div>

                                            <div className={styles.dimensionsRow} style={{ marginTop: '1rem' }}>
                                                <div className={styles.inputGroup}>
                                                    <label>Alto Aleta (% 0-1)</label>
                                                    <input
                                                        type="number"
                                                        step="0.05"
                                                        min="0"
                                                        max="1"
                                                        value={formData.flapHeightPercent}
                                                        onChange={(e) => setFormData({ ...formData, flapHeightPercent: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Ajuste Ancho (cm)</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.flapWidthOffset}
                                                        onChange={(e) => setFormData({ ...formData, flapWidthOffset: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Alto Cierre (Tuck %)</label>
                                                    <input
                                                        type="number"
                                                        step="0.05"
                                                        min="0"
                                                        max="1"
                                                        value={formData.tuckFlapHeightPercent}
                                                        onChange={(e) => setFormData({ ...formData, tuckFlapHeightPercent: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.inputGroup} style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                                                <label>Forma de la Aleta</label>
                                                <div className={styles.typeToggle}>
                                                    <button
                                                        type="button"
                                                        className={formData.flapType === 'rectangular' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => setFormData({ ...formData, flapType: 'rectangular' })}
                                                    >Rectangular</button>
                                                    <button
                                                        type="button"
                                                        className={formData.flapType === 'trapezoidal' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => setFormData({ ...formData, flapType: 'trapezoidal' })}
                                                    >Trapecio</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className={styles.fileRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Foto Catálogo (Principal)</label>
                                            <div className={styles.uploadBox}>
                                                {formData.image ? (
                                                    <>
                                                        <img src={formData.image} alt="Preview" className={styles.previewImg} />
                                                        <button
                                                            type="button"
                                                            className={styles.deleteFileBtn}
                                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
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

                                        {(formData.displayMode === '3d' || formData.displayMode === 'both') && (
                                            <>
                                                <div className={styles.inputGroup}>
                                                    <label>Textura Material</label>
                                                    <div className={styles.uploadBox}>
                                                        {formData.materialTexture ? (
                                                            <>
                                                                <img src={formData.materialTexture} alt="Preview" className={styles.previewImg} />
                                                                <button
                                                                    type="button"
                                                                    className={styles.deleteFileBtn}
                                                                    onClick={() => setFormData(prev => ({ ...prev, materialTexture: '' }))}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
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
                                                    <label>Diseño 3D (Arte)</label>
                                                    <div className={styles.uploadBox}>
                                                        {formData.boxTexture ? (
                                                            <>
                                                                <img src={formData.boxTexture} alt="Preview" className={styles.previewImg} />
                                                                <button
                                                                    type="button"
                                                                    className={styles.deleteFileBtn}
                                                                    onClick={() => setFormData(prev => ({ ...prev, boxTexture: '' }))}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
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
                                            </>
                                        )}
                                    </div>

                                    {(formData.displayMode === 'photos' || formData.displayMode === 'both') && (
                                        <div className={styles.gallerySection} style={{ marginTop: '2rem' }}>
                                            <label>Galería de Imágenes (Mínimo 2 para modo fotos)</label>
                                            <div className={styles.galleryGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                                {formData.images.map((img: any, idx: number) => (
                                                    <div key={idx} className={styles.galleryItem} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        <img src={img.url || img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        {img.textConfig && (
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: `${img.textConfig.y}%`,
                                                                    left: `${img.textConfig.x}%`,
                                                                    width: '4px',
                                                                    height: '4px',
                                                                    background: '#ff4d4f',
                                                                    borderRadius: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    boxShadow: '0 0 0 1px white',
                                                                    pointerEvents: 'none'
                                                                }}
                                                            />
                                                        )}
                                                        <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '4px' }}>
                                                            {img.isCustomizable && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditingImageConfig(idx)}
                                                                    style={{
                                                                        background: 'rgba(59, 130, 246, 0.95)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        padding: '6px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    title="Configurar Texto"
                                                                >
                                                                    <Settings size={16} />
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => toggleImageCustomization(idx)}
                                                                style={{
                                                                    background: img.isCustomizable ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
                                                                    color: img.isCustomizable ? 'white' : '#666',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    padding: '6px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                }}
                                                                title={img.isCustomizable ? "Desactivar Personalización" : "Activar Personalización"}
                                                            >
                                                                <Type size={16} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryImage(idx)}
                                                                style={{ background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className={styles.uploadBox} style={{ height: '100px' }}>
                                                    <div className={styles.emptyUpload}>
                                                        <Plus size={20} />
                                                        <span>Añadir</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'gallery')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* SECTION: PRECIOS POR VOLUMEN */}
                                    <div className={styles.sectionDivider} style={{ margin: '2rem 0', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Precios por Volumen (Escalas)</h3>
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={handleAddTier}
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                <Plus size={14} /> Añadir Escala
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                                            Define rangos de cantidad y el precio unitario correspondiente. El precio base se usará si no hay escalas.
                                        </p>

                                        {formData.priceTiers.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {formData.priceTiers.map((tier: any, idx: number) => {
                                                    const discount = formData.price > 0
                                                        ? Math.round(((formData.price - tier.unitPrice) / formData.price) * 100)
                                                        : 0;
                                                    return (
                                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 40px', gap: '1rem', alignItems: 'end', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                                            <div className={styles.inputGroup}>
                                                                <label style={{ fontSize: '0.75rem' }}>Min Cant.</label>
                                                                <input
                                                                    type="number"
                                                                    value={tier.minQty}
                                                                    onChange={(e) => handleTierChange(idx, 'minQty', parseInt(e.target.value) || 0)}
                                                                    placeholder="1"
                                                                />
                                                            </div>
                                                            <div className={styles.inputGroup}>
                                                                <label style={{ fontSize: '0.75rem' }}>Max Cant.</label>
                                                                <input
                                                                    type="number"
                                                                    value={tier.maxQty || ''}
                                                                    onChange={(e) => handleTierChange(idx, 'maxQty', e.target.value ? parseInt(e.target.value) : null)}
                                                                    placeholder="Infinito"
                                                                />
                                                            </div>
                                                            <div className={styles.inputGroup}>
                                                                <label style={{ fontSize: '0.75rem' }}>Descuento %</label>
                                                                <input
                                                                    type="number"
                                                                    value={discount}
                                                                    onChange={(e) => handleTierChange(idx, 'discount', parseInt(e.target.value) || 0)}
                                                                    placeholder="10"
                                                                />
                                                            </div>
                                                            <div className={styles.inputGroup}>
                                                                <label style={{ fontSize: '0.75rem' }}>Precio Unit.</label>
                                                                <input
                                                                    type="number"
                                                                    value={tier.unitPrice}
                                                                    onChange={(e) => handleTierChange(idx, 'unitPrice', parseInt(e.target.value) || 0)}
                                                                    placeholder="85000"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTier(idx)}
                                                                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc' }}>
                                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>No hay escalas de precio definidas para este producto.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.formActions}>
                                        <button type="button" onClick={() => setShowProductForm(false)}>Cancelar</button>
                                        <button type="submit" className="btn-primary">
                                            {editingProduct ? 'Guardar Cambios' : 'Añadir Producto'}
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

                {/* MODAL FOR SHAPES */}
                {showShapeForm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                            <div className={styles.modalHeader}>
                                <h2>{editingShape ? 'Editar Forma' : 'Nueva Forma'}</h2>
                                <button onClick={() => setShowShapeForm(false)}>×</button>
                            </div>
                            <form className={styles.form} onSubmit={handleSubmitShape}>
                                <div className={styles.formStack}>
                                    <div className={styles.inputGroup}>
                                        <label>Nombre de la Forma (Ej: Caja Premium)</label>
                                        <input
                                            type="text"
                                            value={shapeFormData.name}
                                            onChange={(e) => setShapeFormData({ ...shapeFormData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Mecánica 3D</label>
                                        <select
                                            value={shapeFormData.type}
                                            onChange={(e) => setShapeFormData({ ...shapeFormData, type: e.target.value as any })}
                                        >
                                            <option value="standard">Estándar (Bisagra trasera)</option>
                                            <option value="lid-base">Tapa y Base (2 piezas separables)</option>
                                            <option value="drawer">Cajón (Deslizable)</option>
                                        </select>
                                    </div>
                                    {shapeFormData.type === 'standard' && (
                                        <>
                                            <div className={styles.inputGroup}>
                                                <label>Posición Bisagra</label>
                                                <select
                                                    value={shapeFormData.hingeEdge}
                                                    onChange={(e) => setShapeFormData({ ...shapeFormData, hingeEdge: e.target.value as any })}
                                                >
                                                    <option value="long">Lado más largo</option>
                                                    <option value="short">Lado más corto</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Ubicación Aletas (Aristas)</label>
                                                <select
                                                    value={shapeFormData.flapsLocation}
                                                    onChange={(e) => setShapeFormData({ ...shapeFormData, flapsLocation: e.target.value as any })}
                                                >
                                                    <option value="base">En la Caja (Base)</option>
                                                    <option value="lid">En la Tapa</option>
                                                </select>
                                            </div>

                                            <div className={styles.dimensionsRow}>
                                                <div className={styles.inputGroup}>
                                                    <label>Alto Aleta (%)</label>
                                                    <input
                                                        type="number"
                                                        step="0.05"
                                                        value={shapeFormData.flapHeightPercent}
                                                        onChange={(e) => setShapeFormData({ ...shapeFormData, flapHeightPercent: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Offset Ancho (cm)</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={shapeFormData.flapWidthOffset}
                                                        onChange={(e) => setShapeFormData({ ...shapeFormData, flapWidthOffset: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Alto Cierre (Tuck %)</label>
                                                    <input
                                                        type="number"
                                                        step="0.05"
                                                        min="0"
                                                        max="1"
                                                        value={shapeFormData.tuckFlapHeightPercent}
                                                        onChange={(e) => setShapeFormData({ ...shapeFormData, tuckFlapHeightPercent: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                                                <label>Perfil de Aleta</label>
                                                <div className={styles.typeToggle}>
                                                    <button
                                                        type="button"
                                                        className={shapeFormData.flapType === 'rectangular' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => setShapeFormData({ ...shapeFormData, flapType: 'rectangular' })}
                                                    >Rectangular</button>
                                                    <button
                                                        type="button"
                                                        className={shapeFormData.flapType === 'trapezoidal' ? styles.typeBtnActive : styles.typeBtn}
                                                        onClick={() => setShapeFormData({ ...shapeFormData, flapType: 'trapezoidal' })}
                                                    >Trapecio</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className={styles.dimensionsRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Ancho Base</label>
                                            <input
                                                type="number"
                                                value={shapeFormData.width}
                                                onChange={(e) => setShapeFormData({ ...shapeFormData, width: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Alto Base</label>
                                            <input
                                                type="number"
                                                value={shapeFormData.height}
                                                onChange={(e) => setShapeFormData({ ...shapeFormData, height: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Largo Base</label>
                                            <input
                                                type="number"
                                                value={shapeFormData.depth}
                                                onChange={(e) => setShapeFormData({ ...shapeFormData, depth: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.formActions} style={{ marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setShowShapeForm(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">
                                        {editingShape ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL FOR MATERIALS */}
                {showMaterialForm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent} style={{ maxWidth: '450px' }}>
                            <div className={styles.modalHeader}>
                                <h2>{editingMaterial ? 'Editar Material' : 'Nuevo Material'}</h2>
                                <button onClick={() => setShowMaterialForm(false)}>×</button>
                            </div>
                            <form className={styles.form} onSubmit={handleSubmitMaterial}>
                                <div className={styles.formStack}>
                                    <div className={styles.inputGroup}>
                                        <label>Nombre del Material</label>
                                        <input
                                            type="text"
                                            value={materialFormData.name}
                                            onChange={(e) => setMaterialFormData({ ...materialFormData, name: e.target.value })}
                                            placeholder="Ej: Madera Roja"
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Color Dominante (Para bordes/interior)</label>
                                        <div className={styles.colorWrapper}>
                                            <input
                                                type="color"
                                                value={materialFormData.baseColor || '#FFFFFF'}
                                                onChange={(e) => setMaterialFormData({ ...materialFormData, baseColor: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                value={materialFormData.baseColor || '#FFFFFF'}
                                                onChange={(e) => setMaterialFormData({ ...materialFormData, baseColor: e.target.value })}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Imagen de Textura</label>
                                        <div className={styles.uploadBox}>
                                            {materialFormData.textureUrl ? (
                                                <img src={materialFormData.textureUrl} alt="Preview" className={styles.previewImg} />
                                            ) : (
                                                <div className={styles.emptyUpload}>
                                                    <Box size={20} />
                                                    <span>Subir Textura</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setMaterialFormData(prev => ({ ...prev, textureUrl: reader.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.formActions} style={{ marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setShowMaterialForm(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">
                                        {editingMaterial ? 'Guardar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL FOR COLLECTIONS */}
                {showCollectionForm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                            <div className={styles.modalHeader}>
                                <h2>{editingCollection ? 'Editar Colección' : 'Nueva Colección'}</h2>
                                <button onClick={() => setShowCollectionForm(false)}>×</button>
                            </div>

                            <form className={styles.form} onSubmit={handleSubmitCollection}>
                                <div className={styles.inputGroup}>
                                    <label>Nombre de la Colección</label>
                                    <input
                                        type="text"
                                        value={collectionFormData.name}
                                        onChange={(e) => setCollectionFormData({ ...collectionFormData, name: e.target.value })}
                                        placeholder="Ej: Floral, Aniversario..."
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                                    <label>Descripción</label>
                                    <textarea
                                        value={collectionFormData.description}
                                        onChange={(e) => setCollectionFormData({ ...collectionFormData, description: e.target.value })}
                                        placeholder="Breve descripción de la colección"
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.modalFooter} style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowCollectionForm(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">
                                        {editingCollection ? 'Actualizar' : 'Crear Colección'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Image Config Modal */}
                {editingImageConfig !== null && formData.images[editingImageConfig] && (
                    <div className={styles.modal} style={{ zIndex: 5000 }}>
                        <div className={styles.modalContent} style={{ maxWidth: '800px', width: '90%' }}>
                            <div className={styles.modalHeader}>
                                <h2>Configurar Texto para Imagen</h2>
                                <button onClick={() => setEditingImageConfig(null)}>×</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#f0f0f0', height: '400px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
                                        <img
                                            src={formData.images[editingImageConfig].url}
                                            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                                            alt="Preview"
                                        />
                                        {/* MUESTRA DEL TEXTO EN TIEMPO REAL */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: `${formData.images[editingImageConfig].textConfig?.y ?? 50}%`,
                                                left: `${formData.images[editingImageConfig].textConfig?.x ?? 50}%`,
                                                transform: `translate(-50%, -50%) rotate(${formData.images[editingImageConfig].textConfig?.rotation ?? 0}deg) scale(${formData.images[editingImageConfig].textConfig?.scale ?? 1})`,
                                                color: '#333',
                                                fontWeight: 'bold',
                                                textShadow: '0 0 10px white, 0 0 5px white',
                                                pointerEvents: 'none',
                                                whiteSpace: 'nowrap',
                                                fontSize: '1.5rem',
                                                fontFamily: 'var(--font-display)',
                                                width: '80%',
                                                textAlign: 'center'
                                            }}
                                        >
                                            EJEMPLO TEXTO
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className={styles.inputGroup}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Posición Horizontal (X)</span>
                                            <span style={{ fontWeight: 'bold' }}>{formData.images[editingImageConfig].textConfig?.x ?? 50}%</span>
                                        </label>
                                        <input
                                            type="range" min="0" max="100"
                                            value={formData.images[editingImageConfig].textConfig?.x ?? 50}
                                            onChange={(e) => handleConfigChange('x', parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Posición Vertical (Y)</span>
                                            <span style={{ fontWeight: 'bold' }}>{formData.images[editingImageConfig].textConfig?.y ?? 50}%</span>
                                        </label>
                                        <input
                                            type="range" min="0" max="100"
                                            value={formData.images[editingImageConfig].textConfig?.y ?? 50}
                                            onChange={(e) => handleConfigChange('y', parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Rotación</span>
                                            <span style={{ fontWeight: 'bold' }}>{formData.images[editingImageConfig].textConfig?.rotation ?? 0}°</span>
                                        </label>
                                        <input
                                            type="range" min="-180" max="180"
                                            value={formData.images[editingImageConfig].textConfig?.rotation ?? 0}
                                            onChange={(e) => handleConfigChange('rotation', parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Escala</span>
                                            <span style={{ fontWeight: 'bold' }}>{formData.images[editingImageConfig].textConfig?.scale ?? 1}x</span>
                                        </label>
                                        <input
                                            type="range" min="0.5" max="4" step="0.1"
                                            value={formData.images[editingImageConfig].textConfig?.scale ?? 1}
                                            onChange={(e) => handleConfigChange('scale', parseFloat(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-primary"
                                        style={{ marginTop: 'auto', padding: '1rem' }}
                                        onClick={() => setEditingImageConfig(null)}
                                    >
                                        Guardar Configuración
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function EmptyState({ Icon, text }: { Icon: any, text: string }) {
    return (
        <div className={styles.emptyState}>
            <Icon size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>{text}</p>
        </div>
    );
}
