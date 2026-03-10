"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    Settings as SettingsIcon,
    Layers,
    Box,
    X,
    Palette,
    User,
    LogOut,
    FileText
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useSession, signOut } from 'next-auth/react';
import { Product } from '@/types/product';
import styles from './admin.module.css';

import dynamic from 'next/dynamic';

// Modularized Components (Dynamic for performance)
const TabProducts = dynamic(() => import('./modules/TabProducts'));
const TabCollections = dynamic(() => import('./modules/TabCollections'));
const TabSettings = dynamic(() => import('./modules/TabSettings'));
const TabMaterials = dynamic(() => import('./modules/TabMaterials'));
const TabAccount = dynamic(() => import('./modules/TabAccount'));
const TabQuotes = dynamic(() => import('./modules/TabQuotes'));
const ModalProduct = dynamic(() => import('./modules/ModalProduct'));
const ModalMaterial = dynamic(() => import('./modules/ModalMaterial'));
const ModalCollection = dynamic(() => import('./modules/ModalCollection'));
const ModalTextConfig = dynamic(() => import('./modules/ModalTextConfig'));

export default function AdminPage() {
    const router = useRouter();
    const {
        settings, updateSettings, products, collections,
        addProduct, updateProduct, deleteProduct,
        addCollection, updateCollection, deleteCollection,
        materials,
        addMaterial, updateMaterial, deleteMaterial
    } = useSettings();

    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState('products');
    const [localSettings, setLocalSettings] = useState(settings);
    const [showProductForm, setShowProductForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    // Sync settings
    useEffect(() => { if (settings) setLocalSettings(settings); }, [settings]);

    // Responsive check
    useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth <= 992);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- FORM STATES ---
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [materialFormData, setMaterialFormData] = useState({
        name: '', textureUrl: ''
    });

    const [showCollectionForm, setShowCollectionForm] = useState(false);
    const [editingCollection, setEditingCollection] = useState<any>(null);
    const [collectionFormData, setCollectionFormData] = useState({
        name: '', description: ''
    });

    const [formData, setFormData] = useState({
        name: '', price: 0, category: collections[0]?.name || 'Todas', description: '',
        image: '', displayMode: '3d' as '3d' | 'photos' | 'both',
        images: [] as any[], width: 4, height: 2, depth: 4,
        materialId: 'carton-kraft', baseColor: '#F9F1E7', modelUrl: '',
        priceTiers: [] as any[]
    });

    const [editingImageConfig, setEditingImageConfig] = useState<number | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = formData.displayMode === 'photos' ? 2 : 3;

    // Fix currentStep if it exceeds totalSteps
    useEffect(() => { if (currentStep > totalSteps) setCurrentStep(totalSteps); }, [totalSteps, currentStep]);

    // --- UTILS ---
    const showToast = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    // --- HANDLERS ---
    const handleSettingChange = (path: string, value: any) => {
        if (!path.includes('.')) {
            setLocalSettings((prev: any) => ({ ...prev, [path]: value }));
            return;
        }
        const [section, field] = path.split('.');
        setLocalSettings((prev: any) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleResetColors = () => {
        setLocalSettings(prev => ({
            ...prev,
            colors: {
                primary: '#8B4B62',
                secondary: '#F9F1E7',
                accent: '#D4AF37',
                background: '#FFFFFF'
            }
        }));
    };

    const removeHeroImage = (idx: number) => {
        setLocalSettings(prev => ({
            ...prev,
            heroImages: prev.heroImages?.filter((_, i) => i !== idx)
        }));
    };

    const handleSaveSettings = () => {
        setIsSaving(true);
        updateSettings(localSettings);
        setTimeout(() => { setIsSaving(false); showToast("¡Configuración guardada!"); }, 800);
    };

    const handleNewProduct = () => {
        setEditingProduct(null);
        setFormData({
            ...formData,
            name: '', price: 0, category: collections[0]?.name || 'Todas', description: '',
            image: '', displayMode: '3d', images: [], priceTiers: [], modelUrl: ''
        });
        setCurrentStep(1); setShowProductForm(true);
    };

    const handleEditProduct = (p: Product) => {
        setEditingProduct(p);
        setFormData({
            name: p.name, price: p.price, category: p.category, description: p.description,
            image: p.image || '', displayMode: p.displayMode || '3d',
            images: Array.isArray(p.images) ? p.images.map(img => typeof img === 'string' ? { url: img, textConfig: { x: 50, y: 50, rotation: 0, scale: 1 } } : img) : [],
            width: p.dimensions?.width || 4, height: p.dimensions?.height || 2, depth: p.dimensions?.depth || 4,
            materialId: p.materialId || 'carton-kraft', baseColor: p.baseColor || '#F9F1E7',
            modelUrl: p.modelUrl || '',
            priceTiers: p.priceTiers || []
        });
        setCurrentStep(1); setShowProductForm(true);
    };

    const handleSubmitProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if ((formData.displayMode === 'photos' || formData.displayMode === 'both') && formData.images.length < 2) {
            showToast("El modo fotos requiere al menos 2 imágenes"); return;
        }
        const selectedMaterial = materials.find(m => m.id === formData.materialId);
        const newP = {
            id: editingProduct ? editingProduct.id : Date.now().toString(),
            ...formData,
            dimensions: { width: Number(formData.width), height: Number(formData.height), depth: Number(formData.depth) },
            baseColor: formData.baseColor || '#F9F1E7'
        };
        if (editingProduct) updateProduct(newP as any); else addProduct(newP as any);
        showToast(editingProduct ? "Producto actualizado" : "Producto añadido");
        setShowProductForm(false); setEditingProduct(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        showToast("Subiendo imagen...");

        try {
            if (field === 'heroImages' || field === 'gallery') {
                const uploadPromises = Array.from(files).map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                    const data = await res.json();
                    return data.url;
                });

                const urls = await Promise.all(uploadPromises);
                const validUrls = urls.filter(url => !!url);

                if (field === 'heroImages') {
                    setLocalSettings(prev => ({ ...prev, heroImages: [...(prev.heroImages || []), ...validUrls] }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...validUrls.map(url => ({ url, isCustomizable: false }))]
                    }));
                }
            } else {
                const formData = new FormData();
                formData.append('file', files[0]);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.url) {
                    if (field === 'logo') setLocalSettings(prev => ({ ...prev, logo: data.url }));
                    else if (field === 'textureUrl') setMaterialFormData(prev => ({ ...prev, [field]: data.url }));
                    else setFormData(prev => ({ ...prev, [field]: data.url }));
                }
            }
            showToast("Imagen subida con éxito");
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            showToast("Error al subir imagen");
        }
    };


    const handleTierChange = (idx: number, field: string, value: any) => {
        const tiers = [...formData.priceTiers];
        tiers[idx] = { ...tiers[idx], [field]: value };
        if (field === 'discount') tiers[idx].unitPrice = Math.round(formData.price * (1 - (value / 100)));
        setFormData({ ...formData, priceTiers: tiers });
    };

    const handleConfigChange = (field: string, value: number) => {
        if (editingImageConfig === null) return;
        const imgs = [...formData.images];
        imgs[editingImageConfig] = { ...imgs[editingImageConfig], textConfig: { ...(imgs[editingImageConfig].textConfig || { x: 50, y: 50, rotation: 0, scale: 1 }), [field]: value } };
        setFormData({ ...formData, images: imgs });
    };


    const handleSubmitMaterial = (e: React.FormEvent) => {
        e.preventDefault();
        const newM = { id: editingMaterial ? editingMaterial.id : `mat_${Date.now()}`, ...materialFormData };
        if (editingMaterial) updateMaterial(newM as any); else addMaterial(newM as any);
        showToast("Material guardado"); setShowMaterialForm(false);
    };

    const handleSubmitCollection = (e: React.FormEvent) => {
        e.preventDefault();
        const newC = { id: editingCollection ? editingCollection.id : `col_${Date.now()}`, ...collectionFormData };
        if (editingCollection) updateCollection(newC); else addCollection(newC);
        showToast("Colección guardada"); setShowCollectionForm(false);
    };

    const handleAccountSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;
        if (password && password !== confirm) { showToast("Contraseñas no coinciden"); return; }
        setIsSaving(true);
        try {
            const res = await fetch('/api/auth/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            if (res.ok) { showToast("Perfil actualizado"); form.reset(); } else showToast("Error al actualizar");
        } catch { showToast("Error de conexión"); } finally { setIsSaving(false); }
    };

    if (status === "loading") return <div className={styles.loading}>Cargando...</div>;
    if (!session) return null;

    return (
        <div className={styles.adminWrapper}>
            {notification && (
                <div style={{
                    position: 'fixed', top: '2rem', right: '2rem', background: '#1e293b', color: 'white',
                    padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 9999, animation: 'slideIn 0.3s ease'
                }}>
                    {notification}
                </div>
            )}

            {mobileMenuOpen && <div className={styles.sidebarOverlay} onClick={() => setMobileMenuOpen(false)} />}

            <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.mobileClose}><button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button></div>
                <div className={styles.sidebarHeader}>
                    {settings.logo ? (
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <img src={settings.logo} alt="Logo" style={{ height: '70px', objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <h2 className={styles.adminTitle}>{settings.title} Admin</h2>
                    )}
                    <p className={styles.adminUser}>Dispositivo Vinculado</p>
                </div>
                <nav className={styles.nav}>
                    <button className={activeTab === 'products' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}><Package size={20} /><span>Productos</span></button>
                    <button className={activeTab === 'collections' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('collections'); setMobileMenuOpen(false); }}><Layers size={20} /><span>Colecciones</span></button>
                    <button className={activeTab === 'settings' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}><SettingsIcon size={20} /><span>Configuración</span></button>
                    <button className={activeTab === 'materials' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('materials'); setMobileMenuOpen(false); }}><Palette size={20} /><span>Materiales</span></button>
                    <button className={activeTab === 'quotes' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('quotes'); setMobileMenuOpen(false); }}><FileText size={20} /><span>Cotizaciones</span></button>
                    <button className={activeTab === 'account' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('account'); setMobileMenuOpen(false); }}><User size={20} /><span>Cuenta</span></button>
                    <button className={styles.navItem} onClick={() => signOut()} style={{ marginTop: 'auto', color: '#ef4444' }}><LogOut size={20} /><span>Cerrar Sesión</span></button>
                </nav>
            </aside>

            <main className={styles.content}>
                {activeTab === 'products' && <TabProducts products={products} onAdd={handleNewProduct} onEdit={handleEditProduct} onDelete={id => { if (confirm('¿Eliminar?')) { deleteProduct(id); showToast("Eliminado"); } }} onMenuClick={() => setMobileMenuOpen(true)} />}
                {activeTab === 'collections' && <TabCollections collections={collections} onAdd={() => { setEditingCollection(null); setCollectionFormData({ name: '', description: '' }); setShowCollectionForm(true); }} onEdit={col => { setEditingCollection(col); setCollectionFormData({ name: col.name, description: col.description || '' }); setShowCollectionForm(true); }} onDelete={id => { if (confirm('¿Eliminar?')) { deleteCollection(id); showToast("Eliminado"); } }} onMenuClick={() => setMobileMenuOpen(true)} />}
                {activeTab === 'settings' && (
                    <TabSettings
                        localSettings={localSettings} setLocalSettings={setLocalSettings} onSave={handleSaveSettings} isSaving={isSaving} onMenuClick={() => setMobileMenuOpen(true)}
                        onChange={handleSettingChange} onFileUpload={handleFileUpload} onRemoveHeroImage={removeHeroImage} onResetColors={handleResetColors}
                    />
                )}
                {activeTab === 'materials' && <TabMaterials materials={materials} onAdd={() => { setEditingMaterial(null); setMaterialFormData({ name: '', textureUrl: '' }); setShowMaterialForm(true); }} onEdit={m => { setEditingMaterial(m); setMaterialFormData({ name: m.name, textureUrl: m.textureUrl }); setShowMaterialForm(true); }} onDelete={id => { if (confirm('¿Eliminar?')) { deleteMaterial(id); showToast("Eliminado"); } }} onMenuClick={() => setMobileMenuOpen(true)} />}
                {activeTab === 'account' && <TabAccount session={session} isSaving={isSaving} onSave={handleAccountSave} onMenuClick={() => setMobileMenuOpen(true)} />}
                {activeTab === 'quotes' && <TabQuotes products={products} onMenuClick={() => setMobileMenuOpen(true)} settings={settings} />}
            </main>

            <ModalProduct
                showProductForm={showProductForm} setShowProductForm={setShowProductForm} editingProduct={editingProduct}
                formData={formData} setFormData={setFormData} isMobileView={isMobileView} currentStep={currentStep} totalSteps={totalSteps}
                materials={materials} collections={collections}
                handleSubmitProduct={handleSubmitProduct} handleFileUpload={handleFileUpload}
                handleAddTier={() => setFormData(prev => ({ ...prev, priceTiers: [...prev.priceTiers, { minQty: 1, maxQty: null, unitPrice: prev.price }] }))}
                handleRemoveTier={idx => setFormData(prev => ({ ...prev, priceTiers: prev.priceTiers.filter((_, i) => i !== idx) }))}
                handleTierChange={handleTierChange} prevStep={() => setCurrentStep(prev => Math.max(prev - 1, 1))} nextStep={() => setCurrentStep(prev => Math.min(prev + 1, totalSteps))}
                toggleImageCustomization={idx => { const imgs = [...formData.images]; imgs[idx].isCustomizable = !imgs[idx].isCustomizable; setFormData({ ...formData, images: imgs }); if (imgs[idx].isCustomizable) setEditingImageConfig(idx); }}
                removeGalleryImage={idx => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} setEditingImageConfig={setEditingImageConfig}
            />
            <ModalMaterial showMaterialForm={showMaterialForm} setShowMaterialForm={setShowMaterialForm} editingMaterial={editingMaterial} materialFormData={materialFormData} setMaterialFormData={setMaterialFormData} handleSubmitMaterial={handleSubmitMaterial} onFileUpload={handleFileUpload} />
            <ModalCollection showCollectionForm={showCollectionForm} setShowCollectionForm={setShowCollectionForm} editingCollection={editingCollection} collectionFormData={collectionFormData} setCollectionFormData={setCollectionFormData} handleSubmitCollection={handleSubmitCollection} />
            <ModalTextConfig editingImageConfig={editingImageConfig} formData={formData} setEditingImageConfig={setEditingImageConfig} handleConfigChange={handleConfigChange} />
        </div>
    );
}
