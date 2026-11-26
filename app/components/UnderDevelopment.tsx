import Link from 'next/link';
import styles from '../not-found.module.css';

export default function UnderDevelopment({ title }: { title: string }) {
  return (
    <div className={styles.page}>
      <section className={styles.stage} aria-labelledby="under-development-title">
        <div className={styles.hero}>
          <span className={styles.status}>Under development</span>
          <h1 className={styles.title} id="under-development-title">
            {title} is under development
          </h1>
          <p className={styles.description}>
            This part of the site is being prepared. Please check back soon.
          </p>
          <Link href="/" className="blog-button">
            Go home
          </Link>
        </div>
      </section>
    </div>
  );
}
