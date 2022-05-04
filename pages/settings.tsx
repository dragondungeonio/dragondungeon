import styles from '../styles/menu.module.css'
import { useRouter } from 'next/router'
import { PageLayout } from 'components'
import Link from 'next/link'

export default function Credits() {
    let router = useRouter()

    return (
        <PageLayout>
            <h1>About</h1>
            <h2><Link href={'https://github.com/dragondungeonio/dragondungeon/issues'}>Submit Feedback</Link></h2>
            {/* <h2>Account Linking</h2>
            <a href="https://www.bungie.net/en/OAuth/Authorize?client_id=34616&response_type=code">Link with Bungie.net</a>
            <br /><br />
            <Link href="/link/anet">Link with ArenaNet (Guild Wars 2)</Link> */}
            <h3>Dragon Dungeon Public Beta {require('../package.json').version}</h3>
            <Link href={'/credits'}>Game Credits</Link><br /><br />
            <a href="https://jointheleague.org"><img src="/img/ui/jtl.png" alt="The LEAGUE of Amazing Programmers" height={60} /></a><br /><br />
            <a href="https://lit.games"><img src="/img/ui/lit.png" alt="lit.games" height={50} /></a>
            <br /><br /><button onClick={() => {
                throw 'You asked for this!'
            }}>Throw Debug Error</button>
        </PageLayout>
    )
}
