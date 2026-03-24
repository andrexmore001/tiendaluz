
import { Plus, Edit, Trash2, Box } from 'lucide-react';
import styles from '../admin.module.css';

interface MaterialsSectionProps {
    materials: any[];
    handleEditMaterial: (m: any) => void;
    handleDeleteMaterial: (id: string) => void;
    setEditingMaterial: (m: any) => void;
    setMaterialFormData: (data: any) => void;
    setShowMaterialForm: (show: boolean) => void;
    showMaterialForm: boolean;
    editingMaterial: any;
    materialFormData: any;
    handleSubmitMaterial: (e: React.FormEvent) => void;
}

export default function MaterialsSection({
    materials,
    handleEditMaterial,
    handleDeleteMaterial,
    setEditingMaterial,
    setMaterialFormData,
    setShowMaterialForm,
    showMaterialForm,
    editingMaterial,
    materialFormData,
    handleSubmitMaterial
}: MaterialsSectionProps) {
    return (
        <div className={styles.tabContent}>
            <header className={styles.header}>
                <h1>Gestión de Materiales</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingMaterial(null);
                        setMaterialFormData({ name: '', textureUrl: '', baseColor: '#e3c5a8' });
                        setShowMaterialForm(true);
                    }}
                >
                    <Plus size={20} /> Nuevo Material
                </button>
            </header>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Vista Previa</span>
                    <span>Nombre</span>
                    <span>ID</span>
                    <span>Acciones</span>
                </div>
                {materials.map((m) => (
                    <div key={m.id} className={styles.tableRow}>
                        <div
                            className={styles.miniImg}
                            style={{
                                background: `url(${m.textureUrl})`,
                                backgroundSize: 'cover',
                                borderRadius: '4px'
                            }}
                        ></div>
                        <span className={styles.pName}>{m.name}</span>
                        <span className={styles.pCat}>{m.id}</span>
                        <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => handleEditMaterial(m)}>
                                <Edit size={16} />
                            </button>
                            <button className={styles.iconBtnDelete} onClick={() => handleDeleteMaterial(m.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FOR MATERIALS */}
            {showMaterialForm && (
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
                                        onChange={(e) => setMaterialFormData({ ...materialFormData, name: e.target.value })}
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
                                            onChange={(e) => setMaterialFormData({ ...materialFormData, baseColor: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            value={materialFormData.baseColor || '#FFFFFF'}
                                            onChange={(e) => setMaterialFormData({ ...materialFormData, baseColor: e.target.value })}
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Imagen de Textura</label>
                                    <div className={styles.uploadBox}>
                                        {materialFormData.textureUrl ? (
                                            <img src={materialFormData.textureUrl} alt="Preview" className={styles.previewImg} />
                                        ) : (
                                            <div className={styles.emptyUpload}>
                                                <Box size={20} />
                                                <span>Subir Textura</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setMaterialFormData((prev: any) => ({ ...prev, textureUrl: reader.result as string }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.formActions} style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowMaterialForm(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editingMaterial ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
