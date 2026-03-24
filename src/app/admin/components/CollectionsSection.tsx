
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import styles from '../admin.module.css';

interface CollectionsSectionProps {
    collections: any[];
    handleAddCollection: () => void;
    handleEditCollection: (col: any) => void;
    handleDeleteCollection: (id: string) => void;
    showCollectionForm: boolean;
    setShowCollectionForm: (show: boolean) => void;
    editingCollection: any;
    collectionFormData: any;
    setCollectionFormData: (data: any) => void;
    handleSubmitCollection: (e: React.FormEvent) => void;
}

export default function CollectionsSection({
    collections,
    handleAddCollection,
    handleEditCollection,
    handleDeleteCollection,
    showCollectionForm,
    setShowCollectionForm,
    editingCollection,
    collectionFormData,
    setCollectionFormData,
    handleSubmitCollection
}: CollectionsSectionProps) {
    return (
        <div className={styles.tabContent}>
            <header className={styles.header}>
                <h1>Colecciones / Categorías</h1>
                <button className="btn-primary" onClick={handleAddCollection}>
                    <Plus size={20} /> Nueva Colección
                </button>
            </header>

            <div className={styles.collectionsList}>
                {collections.length > 0 ? collections.map((col: any) => (
                    <div key={col.id} className={styles.collectionItem}>
                        <div className={styles.colInfo}>
                            <span className={styles.colName}>{col.name}</span>
                            <p className={styles.colDesc}>{col.description}</p>
                        </div>
                        <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => handleEditCollection(col)}><Edit size={16} /></button>
                            {col.name !== "Todas" && (
                                <button className={styles.iconBtnDelete} onClick={() => handleDeleteCollection(col.id)}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className={styles.emptyState}>
                        <Layers size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No hay colecciones creadas.</p>
                    </div>
                )}
            </div>

            {/* MODAL FOR COLLECTIONS */}
            {showCollectionForm && (
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
                                    onChange={(e) => setCollectionFormData({ ...collectionFormData, name: e.target.value })}
                                    placeholder="Ej: Floral, Aniversario..."
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                                <label>Descripción</label>
                                <textarea
                                    value={collectionFormData.description}
                                    onChange={(e) => setCollectionFormData({ ...collectionFormData, description: e.target.value })}
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
            )}
        </div>
    );
}
