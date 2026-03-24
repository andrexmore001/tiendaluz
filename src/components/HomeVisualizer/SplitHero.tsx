import Link from 'next/link';
import ImageComparison from './ImageComparison';
import styles from './split-hero.module.css';

export default function SplitHero() {
  return (
    <section className={styles.splitHero}>
      <div className={`${styles.container} container`}>
        <div className={styles.imageCol}>
          <ImageComparison 
            beforeImage="https://res.cloudinary.com/dtnrgadz4/image/upload/v1773535108/artesana/qlrsgcaln6d6dnrmi3of.jpg" 
            afterImage="https://res.cloudinary.com/dtnrgadz4/image/upload/v1773535108/artesana/cch0vmtiod9gyfyqhhlz.jpg"
          />
        </div>
        <div className={styles.textCol}>
          <h1 className={styles.title}>
            Fábrica<br />de cajas<br />de cartón
          </h1>
          <Link href="/productos" className={styles.actionBtn}>
            Ver más &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
