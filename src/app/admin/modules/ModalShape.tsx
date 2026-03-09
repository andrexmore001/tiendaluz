"use client";
import React from 'react';
import styles from '../admin.module.css';

interface ModalShapeProps {
    showShapeForm: boolean;
    setShowShapeForm: (show: boolean) => void;
    editingShape: any;
    shapeFormData: any;
    setShapeFormData: (data: any) => void | React.Dispatch<React.SetStateAction<any>>;
    handleSubmitShape: (e: React.FormEvent) => void;
}

const ModalShape: React.FC<ModalShapeProps> = ({
    showShapeForm,
    setShowShapeForm,
    editingShape,
    shapeFormData,
    setShapeFormData,
    handleSubmitShape
}) => {
    if (!showShapeForm) return null;

    return (
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
                                onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Mecánica 3D</label>
                            <select
                                value={shapeFormData.type}
                                onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, type: e.target.value as any }))}
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
                                        onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, hingeEdge: e.target.value as any }))}
                                    >
                                        <option value="long">Lado más largo</option>
                                        <option value="short">Lado más corto</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Ubicación Aletas (Aristas)</label>
                                    <select
                                        value={shapeFormData.flapsLocation}
                                        onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, flapsLocation: e.target.value as any }))}
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
                                            onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, flapHeightPercent: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Offset Ancho (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={shapeFormData.flapWidthOffset}
                                            onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, flapWidthOffset: parseFloat(e.target.value) || 0 }))}
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
                                            onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, tuckFlapHeightPercent: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Perfil de Aleta</label>
                                    <div className={styles.typeToggle}>
                                        <button
                                            type="button"
                                            className={shapeFormData.flapType === 'rectangular' ? styles.typeBtnActive : styles.typeBtn}
                                            onClick={() => setShapeFormData((prev: any) => ({ ...prev, flapType: 'rectangular' }))}
                                        >Rectangular</button>
                                        <button
                                            type="button"
                                            className={shapeFormData.flapType === 'trapezoidal' ? styles.typeBtnActive : styles.typeBtn}
                                            onClick={() => setShapeFormData((prev: any) => ({ ...prev, flapType: 'trapezoidal' }))}
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
                                    onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Alto Base</label>
                                <input
                                    type="number"
                                    value={shapeFormData.height}
                                    onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Largo Base</label>
                                <input
                                    type="number"
                                    value={shapeFormData.depth}
                                    onChange={(e) => setShapeFormData((prev: any) => ({ ...prev, depth: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.modalFooter} style={{
                        position: 'sticky',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '1.5rem 2.5rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                        zIndex: 100,
                        marginTop: 'auto'
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
    );
};

export default ModalShape;
