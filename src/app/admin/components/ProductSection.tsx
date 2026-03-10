
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Layers,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
    Type
} from 'lucide-react';
import { Product } from '@/types/product';
import Box3D from '@/components/Three/Box3D';
import styles from '../admin.module.css';

interface ProductSectionProps {
    products: Product[];
    collections: any[];
    materials: any[];
    boxShapes: any[];
    handleEditProduct: (p: Product) => void;
    handleDeleteProduct: (id: string) => void;
    showProductForm: boolean;
    setShowProductForm: (show: boolean) => void;
    editingProduct: Product | null;
    setEditingProduct: (p: Product | null) => void;
    formData: any;
    setFormData: (data: any) => void;
    handleSubmitProduct: (e: React.FormEvent) => void;
    handleShapeChange: (shapeId: string) => void;
    handleAddTier: () => void;
    handleRemoveTier: (idx: number) => void;
    handleTierChange: (idx: number, field: string, value: any) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: any) => void;
    removeGalleryImage: (idx: number) => void;
    toggleImageCustomization: (idx: number) => void;
    handleConfigChange: (field: string, value: number) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    editingImageConfig: number | null;
    setEditingImageConfig: (idx: number | null) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobileView: boolean;
    nextStep: () => void;
    prevStep: () => void;
    totalSteps: number;
}

export default function ProductSection(props: ProductSectionProps) {
    const {
        products,
        collections,
        materials,
        boxShapes,
        handleEditProduct,
        handleDeleteProduct,
        showProductForm,
        setShowProductForm,
        editingProduct,
        formData,
        setFormData,
        handleSubmitProduct,
        handleShapeChange,
        handleAddTier,
        handleRemoveTier,
        handleTierChange,
        handleFileUpload,
        removeGalleryImage,
        toggleImageCustomization,
        handleConfigChange,
        currentStep,
        editingImageConfig,
        setEditingImageConfig,
        isOpen,
        setIsOpen,
        isMobileView,
        nextStep,
        prevStep,
        totalSteps
    } = props;

    return (
        <div className={styles.tabContent}>
            <header className={styles.header}>
                <div className={styles.headerTitleGroup}>
                    <h1>Gestión de Productos</h1>
                </div>
                <button className="btn-primary" onClick={() => { props.setEditingProduct(null); setShowProductForm(true); }}>
                    <Plus size={20} /> Agregar Producto
                </button>
            </header>

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

            {/* MODAL FOR PRODUCTS */}
            {showProductForm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={() => setShowProductForm(false)}>×</button>
                        </div>

                        {isMobileView && (
                            <div className={styles.stepIndicator}>
                                <div className={styles.stepText}>Paso {currentStep} de {totalSteps}</div>
                                <div className={styles.stepDots}>
                                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
                                        <div key={s} className={`${styles.stepDot} ${currentStep === s ? styles.stepDotActive : ''}`} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.modalBody}>
                            <div className={`${styles.previewSection} ${(isMobileView && currentStep !== 1) ? styles.hideOnMobile : ''}`}>
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
                                                            baseColor={formData.baseColor}
                                                            isOpen={isOpen}
                                                            text={formData.name}
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

                                        </>
                                    )}
                                </div>
                            </div>

                            <form id="productForm" className={styles.form} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmitProduct}>
                                {/* STEP 1: BASIC INFO */}
                                <div className={`${styles.formGroup} ${styles.slideContent} ${(isMobileView && currentStep !== 1) ? styles.hideOnMobile : ''}`}>
                                    <h3 className={styles.formGroupTitle}>Información Básica</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.inputGroup}>
                                            <label>Nombre del Producto</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder="Ej: Caja de Regalo Premium"
                                            />
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
                                            <label>Precio Base</label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Material Predeterminado</label>
                                            <select
                                                value={formData.materialId}
                                                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                                            >
                                                {materials.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Descripción</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            placeholder="Describe las características del producto..."
                                        />
                                    </div>
                                </div>

                                {/* STEP 2: 3D MECHANICS */}
                                {(formData.displayMode === '3d' || formData.displayMode === 'both') && (
                                    <div className={`${styles.formGroup} ${styles.slideContent} ${(isMobileView && currentStep !== 2) ? styles.hideOnMobile : ''}`}>
                                        <h3 className={styles.formGroupTitle}>Dimensiones y Mecánica (3D)</h3>
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

                                    </div>
                                )}

                                {/* STEP 3 (or 2): IMAGES & GALLERY */}
                                <div className={`${styles.formGroup} ${styles.slideContent} ${(isMobileView && currentStep !== totalSteps) ? styles.hideOnMobile : ''}`}>
                                    <h3 className={styles.formGroupTitle}>Imágenes y Diseño</h3>
                                    <div className={styles.fileRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Foto de Portada</label>
                                            <div className={styles.uploadBox}>
                                                {formData.image ? (
                                                    <>
                                                        <img src={formData.image} alt="Preview" className={styles.previewImg} />
                                                        <button
                                                            type="button"
                                                            className={styles.deleteFileBtn}
                                                            onClick={() => setFormData((prev: any) => ({ ...prev, image: '' }))}
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

                                    </div>

                                    {(formData.displayMode === 'photos' || formData.displayMode === 'both') && (
                                        <div className={styles.gallerySection} style={{ marginTop: '2rem' }}>
                                            <label>Galería de Imágenes (Mínimo 2 para modo fotos)</label>
                                            <div className={styles.galleryGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                                {formData.images.map((img: any, idx: number) => (
                                                    <div key={idx} className={styles.galleryItem} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        <img src={(img.url || img) || '/placeholder.png'} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                                                    <SettingsIcon size={16} />
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
                                </div>

                                {/* SHARED: VOLUME PRICING (Always on last step or visible on desktop) */}
                                <div className={`${styles.sectionDivider} ${styles.slideContent} ${(isMobileView && currentStep !== totalSteps) ? styles.hideOnMobile : ''}`} style={{ margin: '2rem 0', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
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
                                        <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Sin escalas de precio.</p>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.modalFooter}>
                                    <div className={styles.footerLeft}>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => setShowProductForm(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                    <div className={styles.footerRight}>
                                        {isMobileView ? (
                                            <>
                                                {currentStep > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn-secondary"
                                                        onClick={prevStep}
                                                    >
                                                        <ChevronLeft size={18} /> Anterior
                                                    </button>
                                                )}

                                                {currentStep < totalSteps ? (
                                                    <button
                                                        type="button"
                                                        className="btn-primary"
                                                        onClick={nextStep}
                                                    >
                                                        Siguiente <ChevronRight size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        form="productForm"
                                                        className="btn-primary"
                                                    >
                                                        {editingProduct ? 'Guardar Cambios' : 'Añadir Producto'}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                id="desktopSaveBtn"
                                                type="submit"
                                                form="productForm"
                                                className="btn-primary"
                                            >
                                                {editingProduct ? 'Guardar Cambios' : 'Añadir Producto'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {editingImageConfig !== null && (
                <div className={styles.modal} style={{ zIndex: 11000 }}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Configurar Posición de Texto</h2>
                            <button onClick={() => setEditingImageConfig(null)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{
                                    width: '100%',
                                    height: '250px',
                                    background: '#f1f5f9',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={formData.images[editingImageConfig]?.url}
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: `${formData.images[editingImageConfig]?.textConfig?.y ?? 50}%`,
                                            left: `${formData.images[editingImageConfig]?.textConfig?.x ?? 50}%`,
                                            padding: '4px 8px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            transform: `translate(-50%, -50%) rotate(${formData.images[editingImageConfig]?.textConfig?.rotation ?? 0}deg) scale(${formData.images[editingImageConfig]?.textConfig?.scale ?? 1})`,
                                            pointerEvents: 'none',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        TEXTO DE PRUEBA
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Posición Horizontal (X): {formData.images[editingImageConfig]?.textConfig?.x ?? 50}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData.images[editingImageConfig]?.textConfig?.x ?? 50}
                                        onChange={(e) => handleConfigChange('x', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Posición Vertical (Y): {formData.images[editingImageConfig]?.textConfig?.y ?? 50}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData.images[editingImageConfig]?.textConfig?.y ?? 50}
                                        onChange={(e) => handleConfigChange('y', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Rotación: {formData.images[editingImageConfig]?.textConfig?.rotation ?? 0}°</label>
                                    <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        value={formData.images[editingImageConfig]?.textConfig?.rotation ?? 0}
                                        onChange={(e) => handleConfigChange('rotation', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Escala: {formData.images[editingImageConfig]?.textConfig?.scale ?? 1}</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="3"
                                        step="0.1"
                                        value={formData.images[editingImageConfig]?.textConfig?.scale ?? 1}
                                        onChange={(e) => handleConfigChange('scale', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn-primary" onClick={() => setEditingImageConfig(null)} style={{ width: '100%' }}>
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

