import { white } from "colors"
import { useRouter } from "next/router"

export default function Cutscene() {
    let router = useRouter()
    return <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'black' }}>
        <video src={`/video/cutscenes/${router.query.video}.mp4`} autoPlay onClick={() => {
            (document.querySelector('#exit') as HTMLButtonElement).style.display = 'block'
            setTimeout(() => {
                if (document.querySelector('#exit')) {
                    (document.querySelector('#exit') as HTMLButtonElement).style.display = 'none'
                }
            }, 1000)
        }} style={{ width: '100vw', position: 'fixed', top: 0, left: 0 }} onEnded={() => {
            router.push(`/play/${router.query.video.toString().split('/')[0]}`)
        }}></video>
        <button id="exit" onClick={() => {
            router.push(`/play/${router.query.video.toString().split('/')[0]}`)
        }} style={{ display: 'none', fontSize: '15pt', zIndex: 9999, position: 'fixed', bottom: 0, right: 0, width: '70px', height: '40px', border: '2px solid red', background: 'transparent', color: 'whitesmoke' }}>Skip</button>
    </div>
}