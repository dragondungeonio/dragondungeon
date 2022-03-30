import { useRouter } from 'next/router'
import styles from '../styles/menu.module.css'

export default function Credits() {
  let router = useRouter()

  return (
    <div className={styles.pageContent}>
      <h1 onDoubleClick={() => router.push('/award')}>About</h1>
      <h2>Development</h2>
      <p>Keith Groves</p>
      <p>Chris Woolson</p>
      <p>Samuel Sharp</p>
      <p>Sameer Prakash</p>
      <h2>Leadership</h2>
      <img
        src="/img/ui/jtl.png"
        alt="The LEAGUE of Amazing Programmers"
        height={70}
      />
      <p>Keith Groves, Director of Education</p>
      <p>Sarah Cooper, Executive Director</p>
      <p>jointheleague.org</p>
      <h2>Assets</h2>
      <p>Toybox 2020 Competition</p>
      <p>Kevin Macleod (imcompetech.com)</p>
    </div>
  )
}
