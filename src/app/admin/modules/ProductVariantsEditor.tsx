"use client";
import React, { useState } from 'react';
import { Plus, Trash2, RefreshCcw, Layers, Search, Image as ImageIcon } from 'lucide-react';
import styles from '../admin.module.css';

interface ProductVariantsEditorProps {
    formData: any;
    setFormData: (data: any) => void;
    attributes: any[];
}

export default function ProductVariantsEditor({ formData, setFormData, attributes }: ProductVariantsEditorProps) {
    const [selectedAttributes, setSelectedAttributes] = useState<{ attrId: string, values: string[] }[]>([]);
    const [searchTerms, setSearchTerms] = useState<{[key: string]: string}>({});

    const handleAddAttribute = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const attrId = e.target.value;
        if (!attrId || selectedAttributes.find(a => a.attrId === attrId)) return;
        
        setSelectedAttributes([...selectedAttributes, { attrId, values: [] }]);
    };

    const handleBulkSelect = (attrIdx: number, selectAll: boolean) => {
        const newAttrs = [...selectedAttributes];
        const attrDef = attributes.find(a => a.id === newAttrs[attrIdx].attrId);
        if (selectAll && attrDef) {
            newAttrs[attrIdx].values = attrDef.values.map((v: any) => typeof v === 'string' ? v : v.value);
        } else {
            newAttrs[attrIdx].values = [];
        }
        setSelectedAttributes(newAttrs);
    };

    const handleRemoveAttribute = (idx: number) => {
        setSelectedAttributes(selectedAttributes.filter((_, i) => i !== idx));
    };

    const handleToggleValue = (attrIdx: number, value: string) => {
        const newAttrs = [...selectedAttributes];
        const currentVals = newAttrs[attrIdx].values;
        if (currentVals.includes(value)) {
            newAttrs[attrIdx].values = currentVals.filter(v => v !== value);
        } else {
            newAttrs[attrIdx].values.push(value);
        }
        setSelectedAttributes(newAttrs);
    };

    const generateVariants = () => {
        // Cartesian product of selected values
        if (selectedAttributes.length === 0 || selectedAttributes.some(a => a.values.length === 0)) {
            alert("Asegúrate de seleccionar al menos un atributo y un valor para cada atributo elegido.");
            return;
        }

        const arraysToCombine = selectedAttributes.map(sa => {
            const attrObj = attributes.find(a => a.id === sa.attrId);
            return sa.values.map(val => ({ attrId: sa.attrId, attrName: attrObj?.name, value: val }));
        });

        const cartesian = arraysToCombine.reduce((a, b) => 
            a.flatMap(x => b.map(y => [...(Array.isArray(x) ? x : [x]), y]))
        , [[]] as any[]);

        const newVariants = cartesian.map((combo: any, i: number) => {
            const safeCombo = Array.isArray(combo) ? combo : [combo];
            const suffix = safeCombo.map(c => c.value).join('-').toUpperCase().replace(/[^A-Z0-9]/g, '');
            // Simple SKU gen
            const baseSku = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'PRD';
            
            return {
                id: `new_temp_${Date.now()}_${i}`,
                sku: `${baseSku}-${suffix}`,
                price: formData.price,
                stock: 10,
                isActive: true,
                image: '',
                attributes: safeCombo
            };
        });

        setFormData({ ...formData, variants: newVariants });
    };

    const handleVariantChange = (idx: number, field: string, value: any) => {
        const newV = [...(formData.variants || [])];
        newV[idx] = { ...newV[idx], [field]: value };
        setFormData({ ...formData, variants: newV });
    };

    const handleRemoveVariant = (idx: number) => {
        const newV = [...(formData.variants || [])];
        newV.splice(idx, 1);
        setFormData({ ...formData, variants: newV });
    };

    const handleVariantImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
            const data = await res.json();
            if (data.url) {
                handleVariantChange(idx, 'image', data.url);
            }
        } catch (err) {
            console.error("Upload error", err);
            alert("Error al subir imagen");
        }
    };

    const currentVariants = formData.variants || [];

    return (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} /> Opciones y Variantes
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Selecciona los atributos (ej. Color, Talla) que aplican a este producto y genera las combinaciones posibles.
            </p>

            {/* Atributos Seleccionados */}
            <div style={{ marginBottom: '1.5rem' }}>
                {selectedAttributes.map((sa, idx) => {
                    const attrDef = attributes.find(a => a.id === sa.attrId);
                    if (!attrDef) return null;
                    return (
                        <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <strong>{attrDef.name}</strong>
                                <button type="button" onClick={() => handleRemoveAttribute(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                    <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder={`Buscar en ${attrDef.name}...`}
                                        value={searchTerms[sa.attrId] || ''}
                                        onChange={(e) => setSearchTerms({ ...searchTerms, [sa.attrId]: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                                            fontSize: '0.85rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Seleccionar:</span>
                                    <button type="button" onClick={() => handleBulkSelect(idx, true)} style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>Todos</button>
                                    <button type="button" onClick={() => handleBulkSelect(idx, false)} style={{ fontSize: '0.75rem', background: 'white', border: '1px solid #cbd5e1', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>Ninguno</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', padding: '2px' }}>
                                {attrDef.values
                                    .filter((v: any) => {
                                        const valStr = typeof v === 'string' ? v : v.value;
                                        const term = (searchTerms[sa.attrId] || '').toLowerCase();
                                        return valStr.toLowerCase().includes(term);
                                    })
                                    .map((v: any, vIdx: number) => {
                                        const valStr = typeof v === 'string' ? v : v.value;
                                        const isSelected = sa.values.includes(valStr);
                                        return (
                                            <button
                                                key={vIdx}
                                                type="button"
                                                onClick={() => handleToggleValue(idx, valStr)}
                                                style={{
                                                    padding: '0.4rem 1rem',
                                                    borderRadius: '20px',
                                                    border: isSelected ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                                                    background: isSelected ? 'var(--primary)' : 'white',
                                                    color: isSelected ? 'white' : '#475569',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: isSelected ? '0 2px 4px var(--primary-shadow)' : 'none'
                                                }}
                                            >
                                                {valStr}
                                            </button>
                                        );
                                    })}
                                {attrDef.values.filter((v: any) => {
                                    const valStr = typeof v === 'string' ? v : v.value;
                                    const term = (searchTerms[sa.attrId] || '').toLowerCase();
                                    return valStr.toLowerCase().includes(term);
                                }).length === 0 && (
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0.5rem' }}>
                                        No se encontraron resultados para "{searchTerms[sa.attrId]}"
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {attributes.filter(a => a.values && a.values.length > 0).length === 0 ? (
                    <div style={{ padding: '1rem', background: '#fffbeb', color: '#b45309', borderRadius: '8px', border: '1px solid #fcd34d', fontSize: '0.9rem' }}>
                        No tienes atributos globales con valores asignados. Ve a la pestaña principal de <strong>Atributos</strong> para crearlos (ej. "Talla: S, M, L") antes de usarlos en un producto.
                    </div>
                ) : (
                    <>
                        <div className={styles.inputGroup} style={{ maxWidth: '300px' }}>
                            <select onChange={handleAddAttribute} value="">
                                <option value="" disabled>Añadir Atributo al Producto...</option>
                                {attributes
                                    .filter(a => a.values && a.values.length > 0)
                                    .filter(a => !selectedAttributes.find(sa => sa.attrId === a.id))
                                    .map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                            </select>
                        </div>

                        {selectedAttributes.length > 0 && (
                            <button type="button" onClick={generateVariants} className="btn-secondary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <RefreshCcw size={16} /> Generar Variantes ({selectedAttributes.length > 0 ? selectedAttributes.reduce((acc, sa) => acc * Math.max(1, sa.values.length), 1) : 0})
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Tabla de Variantes */}
            {currentVariants.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Imagen</th>
                                <th style={{ padding: '0.5rem' }}>Variante</th>
                                <th style={{ padding: '0.5rem' }}>SKU</th>
                                <th style={{ padding: '0.5rem' }}>Precio ($)</th>
                                <th style={{ padding: '0.5rem' }}>Stock</th>
                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Activo</th>
                                <th style={{ padding: '0.5rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentVariants.map((v: any, idx: number) => (
                                <tr key={v.id || idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                            {v.image ? (
                                                <img src={v.image} alt="variant" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                            ) : (
                                                <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '4px', border: '1px dashed #cbd5e1', display: 'flex', alignItems:'center', justifyContent:'center'}}>
                                                   <ImageIcon size={14} color="#94a3b8" />
                                                </div>
                                            )}
                                            <label style={{ fontSize: '0.65rem', color: 'var(--primary)', cursor: 'pointer', textAlign: 'center', marginTop: '2px', fontWeight: 600 }}>
                                                {v.image ? 'Cambiar' : 'Subir'}
                                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleVariantImageUpload(idx, e)} />
                                            </label>
                                            {v.image && (
                                                <button type="button" onClick={() => handleVariantChange(idx, 'image', null)} style={{ fontSize: '0.65rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Quitar</button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {v.attributes?.map((a: any) => a.value).join(' / ') || 'Default'}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input type="text" value={v.sku} onChange={e => handleVariantChange(idx, 'sku', e.target.value)} style={{ width: '100px', padding: '0.2rem' }} />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input type="number" value={v.price || ''} onChange={e => handleVariantChange(idx, 'price', parseInt(e.target.value))} placeholder={formData.price} style={{ width: '80px', padding: '0.2rem' }} />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input type="number" value={v.stock} onChange={e => handleVariantChange(idx, 'stock', parseInt(e.target.value))} style={{ width: '60px', padding: '0.2rem' }} />
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <input type="checkbox" checked={v.isActive} onChange={e => handleVariantChange(idx, 'isActive', e.target.checked)} />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button type="button" onClick={() => handleRemoveVariant(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {currentVariants.length === 0 && selectedAttributes.length === 0 && (
                 <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                     Este producto solo tiene su variante por defecto.
                 </div>
            )}
        </div>
    );
}
