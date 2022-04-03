import styles from '../styles/menu.module.css'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Credits() {
    let router = useRouter()

    return (
        <div className={styles.pageContent}>
            <h1>Settings &amp; About</h1>
            <h2>Account Linking</h2>
            <a href="https://www.bungie.net/en/OAuth/Authorize?client_id=34616&response_type=code">Link with Bungie.net</a>
            <br /><br />
            <Link href="/link/anet">Link with ArenaNet (Guild Wars 2)</Link>
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
