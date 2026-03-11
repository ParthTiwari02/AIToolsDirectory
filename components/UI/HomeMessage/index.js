import styles from "./index.module.css"

export default function HomeMessage() {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Welcome to AI Tools Directory! 🤖</h4>
      <p className={styles.subtitle}>Discover, explore, and launch the best AI tools.</p>
    </div>
  )
}
