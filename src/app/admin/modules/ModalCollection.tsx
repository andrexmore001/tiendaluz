"use client";
import React from 'react';
import styles from '../admin.module.css';

interface ModalCollectionProps {
    showCollectionForm: boolean;
    setShowCollectionForm: (show: boolean) => void;
    editingCollection: any;
    collectionFormData: any;
    setCollectionFormData: (data: any) => void | React.Dispatch<React.SetStateAction<any>>;
    handleSubmitCollection: (e: React.FormEvent) => void;
    collections: any[];
}

const ModalCollection: React.FC<ModalCollectionProps> = ({
    showCollectionForm,
    setShowCollectionForm,
    editingCollection,
    collectionFormData,
    setCollectionFormData,
    handleSubmitCollection,
    collections
}) => {
    if (!showCollectionForm) return null;

    return (
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
                            onChange={(e) => setCollectionFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                            placeholder="Ej: Floral, Aniversario..."
                            required
                        />
                    </div>
                    <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                        <label>Descripción</label>
                        <textarea
                            value={collectionFormData.description}
                            onChange={(e) => setCollectionFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                            placeholder="Breve descripción de la colección"
                            rows={3}
                        />
                    </div>
                    <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                        <label>Categoría Padre (Opcional)</label>
                        <select
                            value={collectionFormData.parentId || ''}
                            onChange={(e) => setCollectionFormData((prev: any) => ({ ...prev, parentId: e.target.value || null }))}
                        >
                            <option value="">Ninguna (Categoría Principal)</option>
                            {collections.filter((c: any) => c.id !== editingCollection?.id).map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {!collectionFormData.parentId && (
                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ margin: 0 }}>Crear Subcategorías a la vez (Opcional)</label>
                                <button 
                                    type="button" 
                                    onClick={() => setCollectionFormData((prev: any) => ({ ...prev, newSubcategories: [...(prev.newSubcategories || []), ''] }))} 
                                    style={{ fontSize: '0.75rem', background: '#cbd5e1', color: '#1e293b', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    + Añadir
                                </button>
                            </div>
                            <small style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1rem', display: 'block' }}>Estas subcategorías se crearán y se vincularán automáticamente a "{collectionFormData.name || 'esta categoría principal'}".</small>
                            
                            {(collectionFormData.newSubcategories || []).map((subName: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder={`Nombre subcategoría ${idx + 1}...`} 
                                        value={subName} 
                                        onChange={(e) => {
                                            const newArray = [...collectionFormData.newSubcategories];
                                            newArray[idx] = e.target.value;
                                            setCollectionFormData((prev: any) => ({ ...prev, newSubcategories: newArray }));
                                        }} 
                                        style={{ flex: 1 }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const newArray = collectionFormData.newSubcategories.filter((_: any, i: number) => i !== idx);
                                            setCollectionFormData((prev: any) => ({ ...prev, newSubcategories: newArray }));
                                        }} 
                                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.modalFooter} style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-secondary" onClick={() => setShowCollectionForm(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingCollection ? 'Actualizar' : 'Crear Colección'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCollection;
