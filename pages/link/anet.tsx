import styles from '../../styles/menu.module.css'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

function RewardItem(props) {
    return <div onClick={async () => {
        let claimRequest = await fetch(`${window.location.protocol}//${window.location.hostname}:1337/claim/anet/${props.requirements}?user=${props.user}&token=${props.token}&char=${props.name}`)
        if (claimRequest.status == 200) {
            alert('This reward has been claimed!')
        } else {
            alert('You cannot claim this reward.')
        }
    }} style={{ border: '5px solid red', padding: '20px', width: '300px', background: 'black' }}>
        <span>{ props.scope == 0 ? `On character ${props.name}`: 'Account-wide' }</span><br />
        <span style={{ fontSize: '18pt' }}>{props.requirements}</span><br />
        <span style={{ fontSize: '16pt', color: '#f9e300' }}>{props.perk}</span>
    </div>
}

export default function ANETlink() {
    let router = useRouter()
    let [token, setToken] = useState('')
    let [characters, setCharacters] = useState([])
    let [characterData, setCharacterData] = useState<any>('')
    let [rewards, setRewards] = useState<any>()
    let [rewardsLoaded, setRewardsLoaded] = useState<boolean>(false)
    let [fireToken, setFireToken] = useState('')

    useMemo(async () => {
        setRewards(await (await fetch('/api/anet.json')).json())
        onAuthStateChanged(getAuth(), async user => {
            if (user) {
                setFireToken(await user.getIdToken())
            }
        })
        setRewardsLoaded(true)
    }, [])

    return (
        <div className={styles.pageContent}>
            <h1>Accounts // ArenaNet</h1>
            { token == '' && <>
                <input type="text" placeholder='API Token' id='arenaTokenInput' style={{ fontSize: '20pt', color: 'white', width: '1199px', background: 'rgba(0, 0, 0, 0.9)', borderRadius: '10px', border: 'none', padding: '10px' }} />
                <br /><br />
                <button style={{ fontSize: '23pt', color: 'white', background: 'transparent', border: 'none' }} onClick={async () => {
                    let anetToken = (document.querySelector('#arenaTokenInput') as HTMLInputElement).value || ''
                    setToken(anetToken)
                    setCharacters(await (await fetch(`https://api.guildwars2.com/v2/characters?access_token=${anetToken}`)).json())
                }}>Submit</button>
            </> }
            { (token !== '' && characterData == '') && <>
                {characters.map(char => {
                    return <><button onClick={async () => {
                        setCharacterData(await (await fetch(`https://api.guildwars2.com/v2/characters/${char}?access_token=${token}`)).json())
                    }} key={char} style={{ fontSize: '23pt', color: 'white', background: 'transparent', border: 'none' }}>{char}</button><br /></>
                })}
            </> }
            { (token !== '' && characterData !== '') && <>
                <h2>{characterData.name}</h2>
                <h3>Level {characterData.level} {characterData.race} {characterData.profession}</h3>
                { rewardsLoaded && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    { rewards.map(reward => {
                        return <RewardItem name={characterData.name} token={token} user={fireToken} scope={reward.scope} requirements={reward.req} perk={reward.res} />
                    }) }
                </div> }
            </> }
        </div>
    )
}
