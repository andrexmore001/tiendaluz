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
          <div className={styles.badge}>Vista Previa 3D</div>

          <Box3D
            width={product.dimensions?.width || 30}
            height={product.dimensions?.height || 20}
            depth={product.dimensions?.depth || 30}
            materialData={currentMaterial}
            customMaterialTexture={product.customMaterialTexture}
            baseColor={product.baseColor}
            hingeEdge={product.hingeEdge}
            isOpen={isOpen} // 🔥 IMPORTANTE
          />

          {/* 🔥 BOTÓN ABRIR / CERRAR */}
          <button
            className={styles.toggleOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? "Cerrar Caja" : "Abrir Caja"}
          </button>
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