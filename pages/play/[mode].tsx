import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const CoreView = dynamic(() => import('app/view/CoreView'), { ssr: false })

export default function Game(props) {
  const router = useRouter()
  const [musicPlaying, setMusicPlaying] = useState<boolean>()
  useMemo(() => {
    if (typeof window !== undefined) {
      let inGameMusic = new Audio('/music/risingtide.mp3')
      inGameMusic.volume = 0.5
      inGameMusic.loop = true
      inGameMusic
        .play()
        .then(() => {
          setMusicPlaying(true)
        })
        .catch(() => {
          setMusicPlaying(false)
        })
      window.localStorage.gameType = router.query.mode
    }
  }, [router.query.mode])
  console.log('PLAYING MUSIC: ' + musicPlaying)
  return <CoreView isPlayingMusic={musicPlaying} controls={props.controls} />
}
