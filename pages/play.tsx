import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'

const CoreView = dynamic(() => import('app/view/CoreView'), { ssr: false })

export default function Game() {
  useMemo(() => {
    // if (typeof window !== undefined) {
    //   let inGameMusic = new Audio('/music/risingtide.mp3')
    //   inGameMusic.loop = true
    //   inGameMusic.play()
    // }
  }, [])

  return <CoreView />
}
