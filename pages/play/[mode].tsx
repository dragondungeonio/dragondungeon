import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const CoreView = dynamic(() => import('app/view/CoreView'), { ssr: false })

export default function Game(props) {
  const router = useRouter()
  useMemo(() => {
    if (typeof window !== undefined) {
      window.localStorage.gameType = router.query.mode
    }
  }, [router.query.mode])
  return <CoreView controls={props.controls} />
}
