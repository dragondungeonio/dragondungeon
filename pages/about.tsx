import styles from '../styles/menu.module.css'
import { useRouter } from 'next/router'
import { PageLayout } from 'components'
import Link from 'next/link'

export default function Credits() {
    return (
        <PageLayout>
            <h1>About</h1>
            <h2>DragonDungeon Public Beta {require('../package.json').version}</h2>
            <h3>Updates</h3>
            Music volume:&nbsp;
            <button onClick={() => window.localStorage.musicVolume = 0}>Mute</button>
            <button onClick={() => window.localStorage.musicVolume = 0.3}>Low</button>
            <button onClick={() => window.localStorage.musicVolume = 0.5}>Medium</button>
            <button onClick={() => window.localStorage.musicVolume = 1}>High</button>
            <br />
            SFX volume:&nbsp;
            <button onClick={() => window.localStorage.sfxVolume = 0}>Mute</button>
            <button onClick={() => window.localStorage.sfxVolume = 0.3}>Low</button>
            <button onClick={() => window.localStorage.sfxVolume = 0.5}>Medium</button>
            <button onClick={() => window.localStorage.sfxVolume = 1}>High</button>
            <br /><br />
            <Link href={'/credits'}>Game Credits</Link><br />
            <Link href={'https://dragondungeonio.substack.com/'}>Updates</Link><br />
            <Link href={'https://github.com/dragondungeonio/dragondungeon/issues'}>Submit Feedback</Link><br /><br />
            <a href="https://jointheleague.org"><img src="/assets/img/ui/jtl.png" alt="The LEAGUE of Amazing Programmers" height={60} /></a><br /><br />
            <a href="https://lit.games"><img src="/assets/img/ui/lit.png" alt="lit.games" height={50} /></a>
        </PageLayout>
    )
}
