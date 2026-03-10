
import { Plus, Edit, Trash2 } from 'lucide-react';
import styles from '../admin.module.css';
import EmptyState from './UI/EmptyState';

interface ShapesSectionProps {
    boxShapes: any[];
    handleEditShape: (s: any) => void;
    handleDeleteShape: (id: string) => void;
    setEditingShape: (s: any) => void;
    setShapeFormData: (data: any) => void;
    setShowShapeForm: (show: boolean) => void;
    showShapeForm: boolean;
    editingShape: any;
    shapeFormData: any;
    handleSubmitShape: (e: React.FormEvent) => void;
}

export default function ShapesSection({
    boxShapes,
    handleEditShape,
    handleDeleteShape,
    setEditingShape,
    setShapeFormData,
    setShowShapeForm,
    showShapeForm,
    editingShape,
    shapeFormData,
    handleSubmitShape
}: ShapesSectionProps) {
    return (
        <div className={styles.tabContent}>
            <header className={styles.header}>
                <h1>Formas de Caja Corporativas</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingShape(null);
                        setShapeFormData({
                            name: '',
                            type: 'standard',
                            width: 4,
                            height: 2,
                            depth: 4,
                            hingeEdge: 'long',
                            flapsLocation: 'base',
                            flapHeightPercent: 0.25,
                            flapWidthOffset: -0.2,
                            flapType: 'rectangular',
                            tuckFlapHeightPercent: 0.15
                        });
                        setShowShapeForm(true);
                    }}
                >
                    <Plus size={20} /> Nueva Forma
                </button>
            </header>

            <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                    <span>Nombre</span>
                    <span>Tipo</span>
                    <span>Medidas Base (cm)</span>
                    <span>Acciones</span>
                </div>
                {boxShapes.length > 0 ? boxShapes.map((s) => (
                    <div key={s.id} className={styles.tableRow}>
                        <span className={styles.pName}>{s.name}</span>
                        <span className={styles.pCat} style={{ textTransform: 'capitalize' }}>{s.type}</span>
                        <span className={styles.pPrice}>
                            {s.defaultDimensions.width}x{s.defaultDimensions.height}x{s.defaultDimensions.depth}
                        </span>
                        <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => handleEditShape(s)}>
                                <Edit size={16} />
                            </button>
                            <button className={styles.iconBtnDelete} onClick={() => handleDeleteShape(s.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <EmptyState Icon={Plus} text="No hay formas de caja definidas." />
                )}
            </div>

            {/* MODAL FOR SHAPES */}
            {showShapeForm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h2>{editingShape ? 'Editar Forma' : 'Nueva Forma'}</h2>
                            <button onClick={() => setShowShapeForm(false)}>×</button>
                        </div>
                        <form className={styles.form} onSubmit={handleSubmitShape}>
                            <div className={styles.formStack}>
                                <div className={styles.inputGroup}>
                                    <label>Nombre de la Forma (Ej: Caja Premium)</label>
                                    <input
                                        type="text"
                                        value={shapeFormData.name}
                                        onChange={(e) => setShapeFormData({ ...shapeFormData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Mecánica 3D</label>
                                    <select
                                        value={shapeFormData.type}
                                        onChange={(e) => setShapeFormData({ ...shapeFormData, type: e.target.value as any })}
                                    >
                                        <option value="standard">Estándar (Bisagra trasera)</option>
                                        <option value="lid-base">Tapa y Base (2 piezas separables)</option>
                                        <option value="drawer">Cajón (Deslizable)</option>
                                    </select>
                                </div>
                                {shapeFormData.type === 'standard' && (
                                    <>
                                        <div className={styles.inputGroup}>
                                            <label>Posición Bisagra</label>
                                            <select
                                                value={shapeFormData.hingeEdge}
                                                onChange={(e) => setShapeFormData({ ...shapeFormData, hingeEdge: e.target.value as any })}
                                            >
                                                <option value="long">Lado más largo</option>
                                                <option value="short">Lado más corto</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Ubicación Aletas (Aristas)</label>
                                            <select
                                                value={shapeFormData.flapsLocation}
                                                onChange={(e) => setShapeFormData({ ...shapeFormData, flapsLocation: e.target.value as any })}
                                            >
                                                <option value="base">En la Caja (Base)</option>
                                                <option value="lid">En la Tapa</option>
                                            </select>
                                        </div>

                                        <div className={styles.dimensionsRow}>
                                            <div className={styles.inputGroup}>
                                                <label>Alto Aleta (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={shapeFormData.flapHeightPercent}
                                                    onChange={(e) => setShapeFormData({ ...shapeFormData, flapHeightPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Offset Ancho (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={shapeFormData.flapWidthOffset}
                                                    onChange={(e) => setShapeFormData({ ...shapeFormData, flapWidthOffset: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Alto Cierre (Tuck %)</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    min="0"
                                                    max="1"
                                                    value={shapeFormData.tuckFlapHeightPercent}
                                                    onChange={(e) => setShapeFormData({ ...shapeFormData, tuckFlapHeightPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                                            <label>Perfil de Aleta</label>
                                            <div className={styles.typeToggle}>
                                                <button
                                                    type="button"
                                                    className={shapeFormData.flapType === 'rectangular' ? styles.typeBtnActive : styles.typeBtn}
                                                    onClick={() => setShapeFormData({ ...shapeFormData, flapType: 'rectangular' })}
                                                >Rectangular</button>
                                                <button
                                                    type="button"
                                                    className={shapeFormData.flapType === 'trapezoidal' ? styles.typeBtnActive : styles.typeBtn}
                                                    onClick={() => setShapeFormData({ ...shapeFormData, flapType: 'trapezoidal' })}
                                                >Trapecio</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className={styles.dimensionsRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Ancho Base</label>
                                        <input
                                            type="number"
                                            value={shapeFormData.width}
                                            onChange={(e) => setShapeFormData({ ...shapeFormData, width: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Alto Base</label>
                                        <input
                                            type="number"
                                            value={shapeFormData.height}
                                            onChange={(e) => setShapeFormData({ ...shapeFormData, height: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Largo Base</label>
                                        <input
                                            type="number"
                                            value={shapeFormData.depth}
                                            onChange={(e) => setShapeFormData({ ...shapeFormData, depth: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter} style={{
                                position: 'sticky',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '1.5rem 0',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                borderTop: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem',
                                zIndex: 100,
                                marginTop: '2rem'
                            }}>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowShapeForm(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingShape ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
