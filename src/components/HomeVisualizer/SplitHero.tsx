import Link from 'next/link';
import ImageComparison from './ImageComparison';
import styles from './split-hero.module.css';

export default function SplitHero() {
  return (
    <section className={styles.splitHero}>
      <div className={`${styles.container} container`}>
        <div className={styles.imageCol}>
          <ImageComparison 
            beforeImage="https://res.cloudinary.com/dtnrgadz4/image/upload/v1774491318/1_r3xczt.jpg" 
            afterImage="https://res.cloudinary.com/dtnrgadz4/image/upload/v1774491317/2_xplwiz.jpg"
          />
        </div>
        <div className={styles.textCol}>
          <h1 className={styles.title}>
            Artesana:<br />Empaques que<br />envuelven emociones
          </h1>
          <Link href="/productos" className={`btn-primary ${styles.actionBtn}`}>
            Ver más &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
