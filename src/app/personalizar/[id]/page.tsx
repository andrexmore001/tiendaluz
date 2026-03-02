"use client";
import { useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Box3D from '@/components/Three/Box3D';
import { useSettings } from '@/context/SettingsContext';
import { Type, Palette, Image as ImageIcon, MessageCircle } from 'lucide-react';
import styles from './customizer.module.css';

export default function CustomizerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { products, settings, materials } = useSettings();
    const product = products.find(p => p.id === id) || products[0];
    const boxType = product.boxType || (product.name.toLowerCase().includes('gold') ? 'lid-base' : product.name.toLowerCase().includes('azul') ? 'drawer' : 'standard');

    const [text, setText] = useState('');
    const [textColor, setTextColor] = useState('#4A4A4A');
    const [includeImage, setIncludeImage] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isOpen, setIsOpen] = useState(false);

    const handleWhatsApp = () => {
        const phoneNumber = settings.contact.phone.replace(/\s+/g, '');
        const message = `Hola, quiero comprar:
Producto: ${product.name}
Cantidad: ${quantity}
Texto personalizado: ${text || 'Sin texto'}
Incluye imagen personalizada: ${includeImage ? 'Sí' : 'No'}
Total: $${(product.price * quantity).toLocaleString()}
`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    const currentMaterial = materials.find(m => m.id === (product.materialId || 'carton-kraft'));

    return (
        <main style={{ minHeight: '100vh', background: '#fcfcfc' }}>
            <Navbar />

            <div className={`${styles.container} container`}>
                <div className={styles.visualizer}>
                    <div className={styles.badge}>Vista Previa 3D</div>
                    <Box3D
                        width={product.dimensions?.width || 4}
                        height={product.dimensions?.height || 2}
                        depth={product.dimensions?.depth || 4}
                        topTexture={product.boxTexture}
                        customText={text}
                        textColor={textColor}
                        boxType={boxType as any}
                        isOpen={isOpen}
                        materialTexture={product.customMaterialTexture || currentMaterial?.textureUrl}
                        baseColor={product.baseColor}
                        hingeEdge={product.hingeEdge as any}
                        flapsLocation={product.flapsLocation as any}
                    />
                    <button
                        className={styles.toggleOpen}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? 'Cerrar Caja' : 'Abrir Caja'}
                    </button>
                </div>

                <aside className={styles.controls}>
                    <div className={styles.productHeader}>
                        <h1>{product.name}</h1>
                        <p className={styles.price}>${product.price.toLocaleString()} COP</p>
                        <p className={styles.description}>{product.description}</p>
                    </div>

                    <div className={styles.customSection}>
                        <h3><Type size={18} /> Texto Personalizado</h3>
                        <input
                            type="text"
                            placeholder="Escribe el mensaje para la caja..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className={styles.input}
                        />

                        <div className={styles.colorPicker}>
                            <p>Color del texto</p>
                            <div className={styles.colors}>
                                {['#4A4A4A', '#E8A2A2', '#D4AF37', '#FFFFFF'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setTextColor(color)}
                                        style={{ background: color, border: textColor === color ? '2px solid var(--primary)' : '1px solid #ddd' }}
                                        className={styles.colorBtn}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.customSection}>
                        <h3><ImageIcon size={18} /> Fotografía Especial</h3>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={includeImage}
                                onChange={(e) => setIncludeImage(e.target.checked)}
                            />
                            <span>Deseo incluir una fotografía impresa</span>
                        </label>
                        {includeImage && (
                            <div className={styles.dropzone}>
                                <ImageIcon size={24} style={{ opacity: 0.5 }} />
                                <p>Haz clic o arrastra una foto aquí</p>
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>máx. 10MB</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.qtySelector}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>

                        <button className={styles.whatsappBtn} onClick={handleWhatsApp}>
                            <MessageCircle size={20} />
                            Finalizar por WhatsApp
                        </button>
                    </div>
                </aside>
            </div>
        </main>
    );
}
