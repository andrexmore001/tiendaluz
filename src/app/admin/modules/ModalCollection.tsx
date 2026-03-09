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
}

const ModalCollection: React.FC<ModalCollectionProps> = ({
    showCollectionForm,
    setShowCollectionForm,
    editingCollection,
    collectionFormData,
    setCollectionFormData,
    handleSubmitCollection
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
