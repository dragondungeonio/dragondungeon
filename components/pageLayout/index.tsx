import { motion } from 'framer-motion'
import styles from 'styles/menu.module.css'

const PageLayout = (props): JSX.Element => {
    return <motion.main
        variants={{
            hidden: { opacity: 0, x: 0, y: 0 },
            enter: { opacity: 1, x: 0, y: 0 },
            exit: { opacity: 0, x: 0, y: 0 },
        }}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: 'linear' }}
        className={styles.pageContent}
    >
        {props.children}
    </motion.main>
}

export { PageLayout }