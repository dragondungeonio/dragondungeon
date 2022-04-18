import {
  getAuth,
  onAuthStateChanged,
  getIdToken,
  updateProfile,
} from 'firebase/auth'
import { useMemo, useState } from 'react'
import { getFirestore, getDoc, doc } from 'firebase/firestore'

import styles from 'styles/menu.module.css'

function ProfileSelectItem(props) {
  let rarityBorder = 'whitesmoke'
  let borderImage = false

  if (props.equipped && props.type == 'ability') {
    borderImage = true
    rarityBorder =
      'linear-gradient(to bottom right, blue 0%, yellow 25%, brown 50%, green 75%, #c60c30 100%)'
  }

  if (props.equipped && props.type !== 'ability') {
    borderImage = true
    rarityBorder =
      'linear-gradient(to bottom right, #c60c30 0%, #f9e300 25%, red 50%, yellow 75%, #c60c30 100%)'
  }

  return (
    <div
      className={styles.borderSliceApplied}
      style={{
        border: borderImage
          ? '5px solid transparent'
          : `5px solid ${rarityBorder}`,
        borderImage: borderImage ? rarityBorder : '',
        padding: '20px',
        width: '130px',
        background: 'black',
      }}
      onClick={async () => {
        if (props.type == 'ability') {
          let equipRequest = await fetch(
            `${window.location.protocol}//${window.location.hostname}:1337/equip/${props.name}?user=${props.token}&type=ability`,
          )
          if (equipRequest.status !== 200) {
            alert('There was an issue equipping this item.')
          } else {
            window.location.reload()
          }
        } else {
          let equipRequest = await fetch(
            `${window.location.protocol}//${window.location.hostname}:1337/equip/${props.id}?user=${props.token}`,
          )
          if (equipRequest.status !== 200) {
            alert('There was an issue equipping this item.')
          } else {
            window.location.reload()
          }
        }
      }}
    >
      <img
        src={props.img}
        alt={props.name}
        style={{
          imageRendering: 'pixelated',
          height: '60px',
          verticalAlign: 'middle',
        }}
      />
      <br />
      <br />
      <b>{props.name}</b>
      <br />
      <i style={{ fontSize: '10pt' }}>{props.description}</i>
      <br />
      <span style={{ fontSize: '8pt', color: '#f9e300' }}>{props.perk}</span>
    </div>
  )
}

export default function Profile() {
  let [user, setUser] = useState<any>('')
  let [token, setToken] = useState<string>('')
  let [skins, setSkins] = useState<any>('')
  let [entitledSkins, setEntitledSkins] = useState<number[]>([])
  let [skinsLoaded, setSkinsLoaded] = useState<boolean>(false)
  let [equippedSkin, setEquippedSkin] = useState<number>(0)
  let [equippedAbility, setEquippedAbility] = useState<string>('')

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        let skinListingResp = await fetch('/api/skins.json')
        let skinListing = await skinListingResp.json()
        let db = getFirestore()
        let playerEntitlementsDoc = await getDoc(
          doc(db, currentUser.uid, 'store'),
        )
        let playerEntitlements = playerEntitlementsDoc.data()
        let playerAppearanceDoc = await getDoc(
          doc(db, currentUser.uid, 'dragon'),
        )
        let playerAppearance = playerAppearanceDoc.data()
        setEntitledSkins(playerEntitlements.skinEntitlements)
        setSkins(skinListing)
        setEquippedSkin(playerAppearance.skin)
        setEquippedAbility(playerAppearance.ability)
        let userToken = await getIdToken(currentUser)
        setToken(userToken)
        setSkinsLoaded(true)
      }
    })

    authUnsub()
  }, [])

  return (
    <div className={styles.pageContent}>
      <h2>
        <img
          src={user.photoURL}
          height={70}
          style={{ borderRadius: '55px', verticalAlign: 'middle' }}
        />
        &nbsp;&nbsp;
        <span style={{ fontSize: '20pt', display: 'inline-block' }}>
          {user.displayName}{' '}
          <div
            style={{
              display: 'inline-block',
              width: '0.5em',
            }}
          ></div>
          <div
            style={{ display: 'inline-block', fontSize: '0.8em' }}
            onClick={() => {
              const displayName = prompt('Enter your new Dragon Name:')
              if (displayName) {
                updateProfile(user, { displayName })
                user.displayName = displayName
              }
            }}
          >
            Change name
          </div>
        </span>
      </h2>
      <br />
      <br />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '3px',
        }}
      >
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Fireball'}
          name="Fireball"
          img="/img/abilities/fireball.png"
          perk=""
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Iceball'}
          name="Iceball"
          img="/img/abilities/iceball.png"
          perk="Targets are temporarily frozen and cannot move or shoot"
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Electricball'}
          name="Electricball"
          img="/img/abilities/electricball.png"
          perk="Targets have a random chance of duplicating your Electricballs"
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Mudball'}
          name="Mudball"
          img="/img/abilities/mudball.png"
          perk="Mudballs get bigger and expand their range as they hit targets"
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Poisonball'}
          name="Poisonball"
          img="/img/abilities/poisonball.png"
          perk="Targets are poisoned and have reduced capabilities"
        />
      </div>
      <br />
      <br />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '5px',
        }}
      >
        {skinsLoaded && (
          <>
            {skins.map((skin) => {
              if (entitledSkins.includes(skin.id)) {
                return (
                  <>
                    <ProfileSelectItem
                      token={token}
                      equipped={equippedSkin == skin.id}
                      id={skin.id}
                      name={skin.name}
                      description={skin.description}
                      rarity={skin.rarity}
                      img={skin.thumbnail}
                      perk={skin.perk}
                    />
                  </>
                )
              }
            })}
          </>
        )}
      </div>
      <br />
      <br />
    </div>
  )
}
