import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const CoreView = dynamic(() => import('app/view/CoreView'), { ssr: false })

export default function Game(props) {
  const router = useRouter()
  return <>
    {router.query.mode && <CoreView mode={router.query.mode.toString() || 'arena'} token={props.user.token} controls={props.controls} />}
  </>
}
