import { useRouter } from 'next/router'
import { PageLayout } from 'components'

export default function Credits() {
  let router = useRouter()

  return (
    <PageLayout>
      <h1>Credits</h1>
      <h2>Development</h2>
      <p>Sameer Prakash</p>
      <p>Samuel Sharp</p>
      <p>Chris Woolson</p>
      <h2>Leadership</h2>
      <img
        src="/assets/img/ui/jtl.png"
        alt="The LEAGUE of Amazing Programmers"
        height={50}
      />
      <p>Vic Wintriss, Founder</p>
      <p>Keith Groves, Director of Education</p>
      <p>Sarah Cooper, Executive Director</p>
      <img src="/assets/img/ui/lit.png" alt="Lit.games Logo" height={40} />
      <p>Luke Wood, CEO</p>
      <h2>Assets</h2>
      <p>Toybox 2020 Competition</p>
      <p>YouTube Audio Library</p>
      <h2>
        &copy; 2020-{new Date().getFullYear()} the LEAGUE of Amazing Programmers
      </h2>
    </PageLayout>
  )
}
