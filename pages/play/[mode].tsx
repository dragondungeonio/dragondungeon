import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const CoreView = dynamic(() => import('app/view/CoreView'), { ssr: false })

export default function Game() {

    let router = useRouter()

    useMemo(() => {
        if (typeof window !== undefined) {
            let inGameMusic = new Audio('/music/risingtide.mp3')
            inGameMusic.loop = true
            inGameMusic.play()
            window.localStorage.gameType = router.query.mode
        }
    }, [])

    return <CoreView />
}
