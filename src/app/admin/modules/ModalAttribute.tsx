"use client";
import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import styles from '../admin.module.css';

interface ModalAttributeProps {
    showAttributeForm: boolean;
    setShowAttributeForm: (show: boolean) => void;
    editingAttribute: any;
    attributeFormData: any;
    setAttributeFormData: (data: any) => void;
    handleSubmitAttribute: (e?: React.FormEvent, overrideValues?: string[]) => void;
}

const ModalAttribute: React.FC<ModalAttributeProps> = ({
    showAttributeForm,
    setShowAttributeForm,
    editingAttribute,
    attributeFormData,
    setAttributeFormData,
    handleSubmitAttribute
}) => {
    const [newValue, setNewValue] = useState("");

    if (!showAttributeForm) return null;

    const parseValues = (valuesArray: any[]) => {
        return valuesArray.map(v => typeof v === 'string' ? v : v.value);
    };

    const handleAddValue = () => {
        if (!newValue.trim()) return;
        
        const currentValues = attributeFormData.values || [];
        // Prevent duplicates
        if (parseValues(currentValues).includes(newValue.trim())) {
            setNewValue("");
            return;
        }

        setAttributeFormData({
            ...attributeFormData,
            values: [...currentValues, newValue.trim()]
        });
        setNewValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddValue();
        }
    };

    const handleRemoveValue = (idxToRemove: number) => {
        const currentValues = attributeFormData.values || [];
        setAttributeFormData({
            ...attributeFormData,
            values: currentValues.filter((_: any, idx: number) => idx !== idxToRemove)
        });
    };

    const currentStringValues = parseValues(attributeFormData.values || []);

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                <div className={styles.modalHeader}>
                    <h2>{editingAttribute ? 'Editar Atributo Global' : 'Nuevo Atributo Global'}</h2>
                    <button onClick={() => setShowAttributeForm(false)}>×</button>
                </div>

                <div className={styles.modalBody}>
                    <form id="attributeForm" className={styles.form} onSubmit={(e) => {
                         e.preventDefault();
                         if (newValue.trim()) {
                             handleAddValue();
                         }
                    }}>
                        
                        <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                            <label>Nombre del Atributo</label>
                            <input
                                type="text"
                                value={attributeFormData.name}
                                onChange={(e) => setAttributeFormData({ ...attributeFormData, name: e.target.value })}
                                placeholder="Ej: Color, Talla, Material, Empaque..."
                                required
                            />
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                                Este nombre es el que verás al generar las variantes (Será el mismo para todos los productos).
                            </p>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Valores Disponibles</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ej: Rojo, L, 10cm..."
                                    style={{ flex: 1 }}
                                />
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={handleAddValue}
                                    style={{ padding: '0 1rem' }}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '0.5rem', 
                                background: '#f8fafc', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                minHeight: '60px' 
                            }}>
                                {currentStringValues.length > 0 ? (
                                    currentStringValues.map((val: string, idx: number) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: '#e2e8f0',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem'
                                        }}>
                                            <Tag size={12} />
                                            <span>{val}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveValue(idx)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#ef4444',
                                                    display: 'flex',
                                                    padding: 0,
                                                    marginLeft: '4px'
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Escribe un valor y presiona Enter o el botón de Añadir (+).</span>
                                )}
                            </div>
                        </div>

                    </form>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowAttributeForm(false)}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        disabled={!attributeFormData.name?.trim() || (currentStringValues.length === 0 && !newValue.trim())}
                        onClick={(e) => {
                             if (newValue.trim()) {
                                 // Auto-add the pending value
                                 const currentValues = attributeFormData.values || [];
                                 if (!parseValues(currentValues).includes(newValue.trim())) {
                                      const updatedValues = [...currentValues, newValue.trim()];
                                      setAttributeFormData({
                                          ...attributeFormData,
                                          values: updatedValues
                                      });
                                      // Call submit manually after state updates
                                      handleSubmitAttribute(e as any, updatedValues);
                                      return;
                                 }
                             }
                             handleSubmitAttribute(e as any);
                        }}
                    >
                        {editingAttribute ? 'Actualizar Atributo' : 'Crear Atributo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAttribute;
