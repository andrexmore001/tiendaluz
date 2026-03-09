"use client";
import React from 'react';
import { Box } from 'lucide-react';
import styles from '../admin.module.css';

interface ModalMaterialProps {
    showMaterialForm: boolean;
    setShowMaterialForm: (show: boolean) => void;
    editingMaterial: any;
    materialFormData: any;
    setMaterialFormData: (data: any) => void | React.Dispatch<React.SetStateAction<any>>;
    handleSubmitMaterial: (e: React.FormEvent) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

const ModalMaterial: React.FC<ModalMaterialProps> = ({
    showMaterialForm,
    setShowMaterialForm,
    editingMaterial,
    materialFormData,
    setMaterialFormData,
    handleSubmitMaterial,
    onFileUpload
}) => {
    if (!showMaterialForm) return null;

    return (
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
                                onChange={(e) => setMaterialFormData((prev: any) => ({ ...prev, name: e.target.value }))}
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
                                    onChange={(e) => setMaterialFormData((prev: any) => ({ ...prev, baseColor: e.target.value }))}
                                />
                                <input
                                    type="text"
                                    value={materialFormData.baseColor || '#FFFFFF'}
                                    onChange={(e) => setMaterialFormData((prev: any) => ({ ...prev, baseColor: e.target.value }))}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Imagen de Textura</label>
                            <div className={styles.uploadBox}>
                                {materialFormData.textureUrl ? (
                                    <div style={{ position: 'relative' }}>
                                        <img src={materialFormData.textureUrl} alt="Preview" className={styles.previewImg} />
                                        <button
                                            type="button"
                                            className={styles.deleteFileBtn}
                                            onClick={() => setMaterialFormData((prev: any) => ({ ...prev, textureUrl: '' }))}
                                            style={{ top: '5px', right: '5px' }}
                                        >×</button>
                                    </div>
                                ) : (
                                    <div className={styles.emptyUpload}>
                                        <Box size={20} />
                                        <span>Subir Textura</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onFileUpload(e, 'textureUrl')}
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
    );
};

export default ModalMaterial;
