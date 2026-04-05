"use client";
import React from 'react';
import styles from '../admin.module.css';

interface ModalSupplierProps {
    showSupplierForm: boolean;
    setShowSupplierForm: (show: boolean) => void;
    editingSupplier: any;
    supplierFormData: any;
    setSupplierFormData: (data: any) => void | React.Dispatch<React.SetStateAction<any>>;
    handleSubmitSupplier: (e: React.FormEvent) => void;
}

const ModalSupplier: React.FC<ModalSupplierProps> = ({
    showSupplierForm,
    setShowSupplierForm,
    editingSupplier,
    supplierFormData,
    setSupplierFormData,
    handleSubmitSupplier
}) => {
    if (!showSupplierForm) return null;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent} style={{ maxWidth: '450px' }}>
                <div className={styles.modalHeader}>
                    <h2>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                    <button onClick={() => setShowSupplierForm(false)}>×</button>
                </div>
                <form className={styles.form} onSubmit={handleSubmitSupplier}>
                    <div className={styles.formStack}>
                        <div className={styles.inputGroup}>
                            <label>Nombre del Proveedor</label>
                            <input
                                type="text"
                                value={supplierFormData.name}
                                onChange={(e) => setSupplierFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                                placeholder="Ej: Distribuidora XYZ"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Contacto (Opcional)</label>
                            <input
                                type="text"
                                value={supplierFormData.contact || ''}
                                onChange={(e) => setSupplierFormData((prev: any) => ({ ...prev, contact: e.target.value }))}
                                placeholder="Teléfono, email o web..."
                            />
                        </div>
                    </div>
                    <div className={styles.formActions} style={{ marginTop: '2rem' }}>
                        <button type="button" onClick={() => setShowSupplierForm(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingSupplier ? 'Guardar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalSupplier;
