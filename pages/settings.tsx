import styles from '../styles/menu.module.css'
import { useRouter } from 'next/router'

export default function Credits() {
    let router = useRouter()

    return (
        <div className={styles.pageContent}>
            <h1>Settings &amp; About</h1>
            <h2>Settings Editor</h2>
            <p>Coming soon...</p>
            <h2>About</h2>
            <h3>Dragon Dungeon {require('../package.json').version}</h3>
            <h4 onClick={() => {
                router.push('/credits')
            }}>Game Credits</h4>
            <img src="/img/ui/jtl.png" alt="The LEAGUE of Amazing Programmers" height={60} /><br /><br />
            <img src="/img/ui/lit.png" alt="lit.games" height={50} />
        </div>
    )
}
