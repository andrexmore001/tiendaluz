import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}></div>
            <div className={`${styles.content} container`}>
                <h1 className={styles.title}>
                    Creamos cajas que <br />
                    <span>cuentan historias</span>
                </h1>
                <p className={styles.subtitle}>
                    Regalos personalizados hechos con amor, diseñados para emocionar y perdurar en el corazón.
                </p>
                <div className={styles.ctaGroup}>
                    <Link href="/personalizar" className="btn-primary">
                        Diseñar mi caja
                    </Link>
                    <Link href="/productos" className={styles.secondaryBtn}>
                        Ver Colecciones
                    </Link>
                </div>
            </div>
        </section>
    );
}
