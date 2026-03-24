import { Box, MousePointer2, MessageCircle } from 'lucide-react';
import styles from './Features.module.css';

const features = [
    {
        icon: <Box size={32} />,
        title: "Personalización Total",
        description: "Cada detalle es un lienzo en blanco. Elige colores, textos e imágenes que cuenten tu historia."
    },
    {
        icon: <MousePointer2 size={32} />,
        title: "Vista Previa",
        description: "Visualiza tu creación en tiempo real con nuestra tecnología antes de finalizar tu pedido."
    },
    {
        icon: <MessageCircle size={32} />,
        title: "Compra por WhatsApp",
        description: "Finaliza tu compra de forma directa y humana. Estamos a un mensaje de distancia."
    }
];

export default function Features() {
    return (
        <section className={`${styles.features} section-padding`}>
            <div className={`${styles.container} container`}>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>{feature.icon}</div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
