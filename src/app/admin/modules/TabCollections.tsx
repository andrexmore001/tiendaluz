"use client";
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import styles from '../admin.module.css';
import TabHeader from './TabHeader';

interface TabCollectionsProps {
    collections: any[];
    onAdd: () => void;
    onEdit: (col: any) => void;
    onDelete: (id: string) => void;
    onMenuClick: () => void;
}

const TabCollections: React.FC<TabCollectionsProps> = ({ collections, onAdd, onEdit, onDelete, onMenuClick }) => {
    const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className={styles.tabContent}>
            <TabHeader title="Colecciones / Categorías" onMenuClick={onMenuClick}>
                <button className="btn-primary" onClick={onAdd}>
                    <Plus size={20} /> Nueva Colección
                </button>
            </TabHeader>

            <div className={styles.collectionsList}>
                {collections.filter((c: any) => !c.parentId).length > 0 ? collections.filter((c: any) => !c.parentId).map((parent: any) => {
                    const children = collections.filter((c: any) => c.parentId === parent.id);
                    return (
                        <React.Fragment key={parent.id}>
                            <div className={styles.collectionItem} style={{ borderLeft: '4px solid var(--primary)', marginBottom: (children.length > 0 && expandedParents[parent.id]) ? '0' : '0.5rem' }}>
                                <div className={styles.colInfo}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        {children.length > 0 && (
                                            <button 
                                                onClick={() => toggleExpand(parent.id)} 
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#64748b' }}
                                                title={expandedParents[parent.id] ? "Ocultar subcategorías" : "Mostrar subcategorías"}
                                            >
                                                {expandedParents[parent.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </button>
                                        )}
                                        <span className={styles.colName} style={{ fontWeight: 600 }}>{parent.name}</span>
                                        <span className={styles.pCat} style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.5 }}>{parent.id}</span>
                                        {children.length > 0 && <span style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => toggleExpand(parent.id)}>{children.length} Subcategorías</span>}
                                    </div>
                                    <p className={styles.colDesc}>{parent.description}</p>
                                </div>
                                <div className={styles.rowActions}>
                                    <button className={styles.iconBtn} onClick={() => onEdit(parent)} title="Editar">
                                        <Edit size={16} />
                                    </button>
                                    {parent.name !== "Todas" && (
                                        <button className={styles.iconBtnDelete} onClick={() => onDelete(parent.id)} title="Eliminar">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {expandedParents[parent.id] && children.map((child: any, index: number) => (
                                <div key={child.id} className={styles.collectionItem} style={{ 
                                    marginLeft: '2rem', 
                                    borderLeft: '2px dashed #cbd5e1', 
                                    background: '#f8fafc', 
                                    marginTop: '-1px', 
                                    borderTopLeftRadius: 0, 
                                    borderTopRightRadius: 0,
                                    marginBottom: index === children.length - 1 ? '1rem' : '0' 
                                }}>
                                    <div className={styles.colInfo} style={{ paddingLeft: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1' }}>↳</span>
                                            <span className={styles.colName} style={{ fontSize: '0.95rem' }}>{child.name}</span>
                                            <span className={styles.pCat} style={{ fontSize: '0.7rem', fontFamily: 'monospace', opacity: 0.4 }}>{child.id}</span>
                                        </div>
                                        {child.description && <p className={styles.colDesc} style={{ marginLeft: '1.8rem', marginTop: '0.2rem' }}>{child.description}</p>}
                                    </div>
                                    <div className={styles.rowActions}>
                                        <button className={styles.iconBtn} onClick={() => onEdit(child)} title="Editar">
                                            <Edit size={16} />
                                        </button>
                                        <button className={styles.iconBtnDelete} onClick={() => onDelete(child.id)} title="Eliminar" style={{ background: 'transparent' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    );
                }) : (
                    <div className={styles.emptyState}>
                        <Layers size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No hay colecciones creadas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabCollections;
