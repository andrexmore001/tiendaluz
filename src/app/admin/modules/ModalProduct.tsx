"use client";
import React from 'react';
import {
    Trash2,
    Plus,
    Smartphone,
    Layers,
    Settings,
    Type,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
const ProductModel = dynamic(() => import('@/components/Three/ProductModel'), {
    ssr: false,
    loading: () => <div className={styles.emptyState} style={{ height: '350px' }}>Cargando Modelo 3D...</div>
});
import styles from '../admin.module.css';

interface ModalProductProps {
    showProductForm: boolean;
    setShowProductForm: (show: boolean) => void;
    editingProduct: any;
    formData: any;
    setFormData: (data: any) => void | React.Dispatch<React.SetStateAction<any>>;
    isMobileView: boolean;
    currentStep: number;
    totalSteps: number;
    materials: any[];
    collections: any[];
    handleSubmitProduct: (e: React.FormEvent) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: any) => void;
    handleAddTier: () => void;
    handleRemoveTier: (idx: number) => void;
    handleTierChange: (idx: number, field: string, value: any) => void;
    prevStep: () => void;
    nextStep: () => void;
    toggleImageCustomization: (idx: number) => void;
    removeGalleryImage: (idx: number) => void;
    setEditingImageConfig: (idx: number | null) => void;
}

const ModalProduct: React.FC<ModalProductProps> = ({
    showProductForm,
    setShowProductForm,
    editingProduct,
    formData,
    setFormData,
    isMobileView,
    currentStep,
    totalSteps,
    materials,
    collections,
    handleSubmitProduct,
    handleFileUpload,
    handleAddTier,
    handleRemoveTier,
    handleTierChange,
    prevStep,
    nextStep,
    toggleImageCustomization,
    removeGalleryImage,
    setEditingImageConfig
}) => {
    if (!showProductForm) return null;

    return (
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
                    {/* Left/Top Side: 3D Preview (Only for 3D steps) */}
                    <div className={`${styles.previewSection} ${((formData.displayMode === '3d' || formData.displayMode === 'both') && (isMobileView && currentStep === 2) || !isMobileView) ? '' : styles.hideOnMobile}`}>
                        {(formData.displayMode === '3d' || formData.displayMode === 'both') ? (
                            <>
                                <div className={styles.adminBoxPreview}>
                                    <ProductModel modelUrl={formData.modelUrl} />
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState} style={{ height: '350px' }}>
                                <Smartphone size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <p style={{ color: '#94a3b8' }}>Preview 3D no disponible en modo Fotos</p>
                            </div>
                        )}
                    </div>

                    <form id="productForm" className={styles.form} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmitProduct}>
                        {/* STEP 1: BASIC INFO */}
                        <div className={`${styles.formGroup} ${styles.slideContent} ${(isMobileView && currentStep !== 1) ? styles.hideOnMobile : ''}`}>
                            <h3 className={styles.formGroupTitle}>Información Básica</h3>

                            <div className={styles.inputGroup} style={{ marginBottom: '2rem' }}>
                                <label>Modo de Visualización</label>
                                <div className={styles.typeToggle}>
                                    <button
                                        type="button"
                                        className={formData.displayMode === 'photos' ? styles.typeBtnActive : styles.typeBtn}
                                        onClick={() => setFormData((prev: any) => ({ ...prev, displayMode: 'photos' }))}
                                    >Solo Fotos</button>
                                    <button
                                        type="button"
                                        className={formData.displayMode === '3d' ? styles.typeBtnActive : styles.typeBtn}
                                        onClick={() => setFormData((prev: any) => ({ ...prev, displayMode: '3d' }))}
                                    >Solo 3D</button>
                                    <button
                                        type="button"
                                        className={formData.displayMode === 'both' ? styles.typeBtnActive : styles.typeBtn}
                                        onClick={() => setFormData((prev: any) => ({ ...prev, displayMode: 'both' }))}
                                    >Ambos</button>
                                </div>
                            </div>

                            <div className={styles.inputGroup} style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isVisible !== false}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, isVisible: e.target.checked }))}
                                        style={{ marginRight: '0.75rem', width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                                    />
                                    <span>Visible en la tienda (mostrar al cliente)</span>
                                </label>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Nombre del Producto</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                                        required
                                        placeholder="Ej: Caja de Regalo Premium"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Categoría</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                                    >
                                        {collections.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Precio Base</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Material Predeterminado</label>
                                    <select
                                        value={formData.materialId}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, materialId: e.target.value }))}
                                    >
                                        {materials.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Describe las características del producto..."
                                />
                            </div>
                        </div>

                        {/* STEP 2: 3D MECHANICS */}
                        {(formData.displayMode === '3d' || formData.displayMode === 'both') && (
                            <div className={`${styles.formGroup} ${styles.slideContent} ${(isMobileView && currentStep !== 2) ? styles.hideOnMobile : ''}`}>
                                <h3 className={styles.formGroupTitle}>Dimensiones y Mecánica</h3>


                                <div className={styles.dimensionsRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Ancho (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.width}
                                            onChange={(e) => setFormData((prev: any) => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Alto (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={(e) => setFormData((prev: any) => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Largo (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.depth}
                                            onChange={(e) => setFormData((prev: any) => ({ ...prev, depth: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                                    <label>Archivo de Modelo 3D (.glb, .gltf)</label>
                                    <div className={styles.uploadBox}>
                                        {formData.modelUrl ? (
                                            <>
                                                <div className={styles.fileInfo}>
                                                    <Layers size={20} />
                                                    <span>Modelo Cargado</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.deleteFileBtn}
                                                    onClick={() => setFormData((prev: any) => ({ ...prev, modelUrl: '' }))}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className={styles.emptyUpload}>
                                                <Plus size={20} />
                                                <span>Subir Modelo 3D</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept=".glb,.gltf"
                                            onChange={(e) => handleFileUpload(e, 'modelUrl')}
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
                                                    onClick={() => setFormData((prev: any) => ({
                                                        ...prev,
                                                        image: '',
                                                        // También quita de la galería si estaba allí
                                                        images: prev.images.filter((img: any) => img.url !== prev.image)
                                                    }))}
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
                                    <div className={styles.inputGroup}>
                                        <label>Diseño 3D (Arte)</label>
                                        <div className={styles.uploadBox}>
                                            {formData.boxTexture ? (
                                                <>
                                                    <img src={formData.boxTexture} alt="Preview" className={styles.previewImg} />
                                                    <button
                                                        type="button"
                                                        className={styles.deleteFileBtn}
                                                        onClick={() => setFormData((prev: any) => ({ ...prev, boxTexture: '' }))}
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
                                )}
                            </div>

                            {(formData.displayMode === 'photos' || formData.displayMode === 'both') && (
                                <div className={styles.gallerySection} style={{ marginTop: '2rem' }}>
                                    <label>Galería de Imágenes</label>
                                    <div className={styles.galleryGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                        {formData.images.map((img: any, idx: number) => (
                                            <div key={idx} className={styles.galleryItem} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img src={img.url || (typeof img === 'string' ? img : '/placeholder.png')} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                                            className={styles.pBtn}
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
                                        {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalProduct;
