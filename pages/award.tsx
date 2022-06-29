import { useRouter } from 'next/router'
import { PageLayout } from 'components'

export default function Credits() {
  let router = useRouter()

  return (
    <PageLayout>
      <img
        src="assets/img/ui/cert.png"
        style={{
          width: '100vw',
          zIndex: 99999999,
        }}
      />
    </PageLayout>
  )
}
