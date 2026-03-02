import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './nosotros.module.css';

export default function NosotrosPage() {
    return (
        <main className={styles.main}>
            <Navbar />

            <header className={styles.header}>
                <div className="container">
                    <span className={styles.overline}>Desde 2024</span>
                    <h1 className={styles.title}>El silencio <br />del detalle.</h1>
                </div>
            </header>

            <section className={styles.minimalManifesto}>
                <div className="container">
                    <div className={styles.grid}>
                        <div className={styles.quoteBox}>
                            <p>
                                "Artesana no es una tienda. Es un recordatorio de lo que significa sentir algo real entre las manos."
                            </p>
                        </div>
                        <div className={styles.textBox}>
                            <p>
                                Nacimos con una premisa simple: la emoción no se fabrica en serie.
                                Cada caja que sale de nuestro taller lleva consigo horas de curaduría,
                                un diseño único y el alma de quien decide regalarla.
                            </p>
                            <p>
                                Diseñamos experiencias para aquellos que creen que un regalo es,
                                ante todo, una historia que merece ser bien contada.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.values}>
                <div className="container">
                    <div className={styles.valueRow}>
                        <div className={styles.valueItem}>
                            <span>01</span>
                            <h3>Intención</h3>
                            <p>Cada elemento tiene un propósito. Nada es azar.</p>
                        </div>
                        <div className={styles.valueItem}>
                            <span>02</span>
                            <h3>Delicadeza</h3>
                            <p>El lujo reside en lo que casi no se nota, pero se siente.</p>
                        </div>
                        <div className={styles.valueItem}>
                            <span>03</span>
                            <h3>Humanidad</h3>
                            <p>Conectamos personas a través de lo artesanal.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className="container text-center">
                    <h2>¿Creamos algo juntos?</h2>
                    <a href="/contacto" className={styles.minimalLink}>Hablemos</a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
