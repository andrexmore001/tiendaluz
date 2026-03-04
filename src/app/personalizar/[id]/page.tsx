"use client";
import { useState, use } from "react";
import Navbar from "@/components/Navbar";
import Box3D from "@/components/Three/Box3D";
import { useSettings } from "@/context/SettingsContext";
import { Type, Image as ImageIcon, MessageCircle } from "lucide-react";
import styles from "./customizer.module.css";

export default function CustomizerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { products, settings, materials } = useSettings();

  const product = products.find((p) => p.id === id) || products[0];

  const [text, setText] = useState("");
  const [includeImage, setIncludeImage] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // 🔥 ESTADO NUEVO

  const currentMaterial =
    materials.find((m) => m.id === product.materialId) ||
    materials.find((m) => m.id === "carton-kraft");

  const [currentView, setCurrentView] = useState<'3d' | 'photos'>(product.displayMode === 'photos' ? 'photos' : '3d');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const displayPhotos = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleWhatsApp = () => {
    const phoneNumber = settings.contact.phone.replace(/\s+/g, "");
    const message = `Hola, quiero comprar:
Producto: ${product.name}
Cantidad: ${quantity}
Texto personalizado: ${text || "Sin texto"}
Incluye imagen personalizada: ${includeImage ? "Sí" : "No"}
Total: $${(product.price * quantity).toLocaleString()}
`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#fcfcfc" }}>
      <Navbar />

      <div className={`${styles.container} container`}>
        <div className={styles.visualizer}>
          <div className={styles.badge}>
            {currentView === '3d' ? 'Vista Previa 3D' : 'Galería de Fotos'}
          </div>

          {currentView === '3d' ? (
            <div style={{ width: '100%', height: '400px' }}>
              <Box3D
                width={product.dimensions?.width || 30}
                height={product.dimensions?.height || 20}
                depth={product.dimensions?.depth || 30}
                materialData={currentMaterial}
                customMaterialTexture={product.customMaterialTexture}
                baseColor={product.baseColor}
                hingeEdge={product.hingeEdge}
                isOpen={isOpen}
                text={text}
              />
            </div>
          ) : (
            <div className={styles.photoGallery} style={{ width: '100%', height: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.mainPhotoWrapper}>
                <div className={styles.imageRelativeWrapper}>
                  <img src={displayPhotos[activePhotoIdx] ? (typeof displayPhotos[activePhotoIdx] === 'string' ? displayPhotos[activePhotoIdx] : (displayPhotos[activePhotoIdx] as any).url) : (product.image || '')} alt={product.name} />
                  {text && displayPhotos[activePhotoIdx] && (
                    <div
                      className={styles.textOverlay}
                      style={{
                        top: `${(displayPhotos[activePhotoIdx] as any).textConfig?.y ?? 50}%`,
                        left: `${(displayPhotos[activePhotoIdx] as any).textConfig?.x ?? 50}%`,
                        transform: `translate(-50%, -50%) rotate(${(displayPhotos[activePhotoIdx] as any).textConfig?.rotation ?? 0}deg) scale(${(displayPhotos[activePhotoIdx] as any).textConfig?.scale ?? 1})`,
                      }}
                    >
                      {text}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.photoThumbs} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {displayPhotos.map((img: any, idx) => (
                  <img
                    key={idx}
                    src={typeof img === 'string' ? img : img.url}
                    alt={`Thumb ${idx}`}
                    onClick={() => setActivePhotoIdx(idx)}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: activePhotoIdx === idx ? '2px solid var(--primary)' : '1px solid #eee'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.visualizerControls} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            {currentView === '3d' && (
              <button
                className={styles.toggleOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {isOpen ? "Cerrar Caja" : "Abrir Caja"}
              </button>
            )}

            {product.displayMode === 'both' && (
              <button
                className={styles.pBtn}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                onClick={() => setCurrentView(currentView === '3d' ? 'photos' : '3d')}
              >
                {currentView === '3d' ? "Ver Fotos" : "Ver 3D"}
              </button>
            )}
          </div>
        </div>

        <aside className={styles.controls}>
          <div className={styles.productHeader}>
            <h1>{product.name}</h1>
            <p className={styles.price}>
              ${product.price.toLocaleString()} COP
            </p>
            <p className={styles.description}>{product.description}</p>
          </div>

          <div className={styles.customSection}>
            <h3>
              <Type size={18} /> Texto Personalizado
            </h3>
            <input
              type="text"
              placeholder="Escribe el mensaje para la caja..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.customSection}>
            <h3>
              <ImageIcon size={18} /> Fotografía Especial
            </h3>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={includeImage}
                onChange={(e) => setIncludeImage(e.target.checked)}
              />
              <span>Deseo incluir una fotografía impresa</span>
            </label>
          </div>

          <div className={styles.footer}>
            <div className={styles.qtySelector}>
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((prev) => prev + 1)}>
                +
              </button>
            </div>

            <button
              className={styles.whatsappBtn}
              onClick={handleWhatsApp}
            >
              <MessageCircle size={20} />
              Finalizar por WhatsApp
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}