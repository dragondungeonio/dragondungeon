import { getAuth, onAuthStateChanged, getIdToken } from 'firebase/auth'
import { useMemo, useState } from 'react'
import { getFirestore, getDoc, doc } from 'firebase/firestore'

import styles from 'styles/menu.module.css'

function ProfileSelectItem(props) {
    let rarityBorder = 'linear-gradient(to bottom right, blue 0%, yellow 25%, brown 50%, green 75%, #c60c30 100%)'
    let borderImage = true
    let affordable = true

    switch (props.rarity) {
        case 0:
            rarityBorder = 'whitesmoke'
            borderImage = false
            break;
        case 1:
            rarityBorder = '#009b3a'
            borderImage = false
            break;
        case 2:
            rarityBorder = '#00a1de'
            borderImage = false
            break;
        case 3:
            rarityBorder = '#f9461c'
            borderImage = false
            break;
        case 4:
            borderImage = true
            rarityBorder = 'linear-gradient(to bottom right, #c60c30 0%, #00a1de 25%, #f9461c 50%, whitesmoke 75%, #f9e300 100%)'
    }

    return <div className={styles.borderSliceApplied} style={{ border: borderImage ? '5px solid transparent' : `5px solid ${rarityBorder}`, borderImage: borderImage ? rarityBorder : '', padding: '20px', width: '160px', background: 'rgba(0, 0, 0, 0.9)' }} onClick={async () => {
        if (props.type == 'ability') {
            let equipRequest = await fetch(`${window.location.protocol}//${window.location.hostname}:1337/equip/${props.name}?user=${props.token}&type=ability`)
            if (equipRequest.status !== 200) {
                alert('There was an issue equipping this item.')
            } else {
                document.querySelector('#currentAbility').innerHTML = `<div style='width:160px'>
                    <img src='/img/abilities/${props.name.toLowerCase()}.png' style='image-rendering:pixelated;height:60px;' /><br /><br />
                    <b>${props.name}</b>
                </div>`
            }
        } else {
            let equipRequest = await fetch(`${window.location.protocol}//${window.location.hostname}:1337/equip/${props.id}?user=${props.token}`)
            if (equipRequest.status !== 200) {
                alert('There was an issue equipping this item.')
            } else {
                document.querySelector('#currentDragon').innerHTML = `<div style='width:160px'>
                    <img src=${props.img} style='image-rendering:pixelated;height:60px;' /><br /><br />
                    <b>${props.name}</b>
                </div>`
            }
        }
    }} >
        <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '60px', opacity: affordable ? 1 : 0.5, verticalAlign: 'middle' }} /><br /><br />
        <b>{props.name}</b>
        <br />
        <i style={{ fontSize: '10pt' }}>{props.description}</i>
        <br />
        <span style={{ fontSize: '8pt', color: '#f9e300' }}>{props.perk}</span>
    </div>
}

export default function Profile() {
    let [user, setUser] = useState<any>('')
    let [token, setToken] = useState<string>('')
    let [skins, setSkins] = useState<any>('')
    let [entitledSkins, setEntitledSkins] = useState<number[]>([])
    let [skinsLoaded, setSkinsLoaded] = useState<boolean>(false)

    useMemo(() => {
        let auth = getAuth()
        let authUnsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                let skinListingResp = await fetch('/api/skins.json')
                let skinListing = await skinListingResp.json()
                let db = getFirestore()
                let playerEntitlementsDoc = await getDoc(doc(db, currentUser.uid, 'store'))
                let playerEntitlements = playerEntitlementsDoc.data()
                let playerAppearanceDoc = await getDoc(doc(db, currentUser.uid, 'dragon'))
                let playerAppearance = playerAppearanceDoc.data()
                setEntitledSkins(playerEntitlements.skinEntitlements)
                setSkins(skinListing)
                skinListing.forEach(skin => {
                    if (skin.id == playerAppearance.skin) {
                        document.querySelector('#currentDragon').innerHTML = `<div style='width:160px'>
                            <img src=${skin.thumbnail} style='image-rendering:pixelated;height:60px;' /><br /><br />
                            <b>${skin.name}</b>
                        </div>`
                    }
                });
                document.querySelector('#currentAbility').innerHTML = `<div style='width:160px'>
                    <img src='/img/abilities/${playerAppearance.ability}.png' style='image-rendering:pixelated;height:60px;' /><br /><br />
                    <b>${playerAppearance.ability}</b>
                </div>`
                let userToken = await getIdToken(currentUser)
                setToken(userToken)
                setSkinsLoaded(true)
            }
        })

        authUnsub()
    }, [])

    return (
        <div className={styles.pageContent}>
            <h1>Profile</h1>
            <h2>
                <img src={user.photoURL} style={{ borderRadius: '55px', verticalAlign: 'middle' }} />&nbsp;&nbsp;
                <span style={{ fontSize: '30pt' }}>{user.displayName}</span>&nbsp;&nbsp;
                <span style={{ fontSize: '20pt' }}>{user.email}</span>
            </h2>
            <br />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
                <div id='currentDragon'></div>
                <div id='currentAbility'></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
                <details style={{ marginTop: '10px' }}>
                    <summary style={{ fontSize: '16pt' }}>Skins</summary>
                    <p>Get more skins from the Gem Store.</p>
                    {skinsLoaded &&
                        <>
                            {skins.map(skin => {
                                if (entitledSkins.includes(skin.id)) {
                                    return <><ProfileSelectItem token={token} id={skin.id} name={skin.name} description={skin.description} rarity={skin.rarity} img={skin.thumbnail} perk={skin.perk} /><br /></>
                                }
                            })}
                        </>}
                </details>
                <details style={{ marginTop: '10px' }}>
                    <summary style={{ fontSize: '16pt' }}>Abilities</summary>
                    <br />
                    <ProfileSelectItem type="ability" token={token} name="Fireball" rarity={0} img="/img/abilities/fireball.png" perk="" /><br />
                    <ProfileSelectItem type="ability" token={token} name="Iceball" img="/img/abilities/iceball.png" perk="Targets are temporarily frozen and cannot move or shoot" /><br />
                    <ProfileSelectItem type="ability" token={token} name="Electricball" img="/img/abilities/electricball.png" perk="Targets have a random chance of duplicating your Electricballs" /><br />
                    <ProfileSelectItem type="ability" token={token} name="Mudball" img="/img/abilities/mudball.png" perk="Mudballs get bigger and expand their range as they hit targets" /><br />
                    <ProfileSelectItem type="ability" token={token} name="Poisonball" img="/img/abilities/poisonball.png" perk="Targets are poisoned and have reduced capabilities" />
                </details>
            </div>
            <br /><br />
        </div>
    )
}
