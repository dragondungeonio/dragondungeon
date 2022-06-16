import {
  getAuth,
  onAuthStateChanged,
  getIdToken,
  updateProfile,
} from 'firebase/auth'
import { useMemo, useState } from 'react'
import { getFirestore, getDoc, doc } from 'firebase/firestore'
import { PageLayout } from 'components'

import styles from 'styles/menu.module.css'

function ProfileSelectItem(props) {
  let rarityBorder = 'whitesmoke'
  let borderImage = false

  if (props.equipped && props.type == 'ability') {
    borderImage = true
    rarityBorder =
      'linear-gradient(to bottom right, blue 0%, yellow 25%, brown 50%, green 75%, #c60c30 100%)'
  }

  if (props.equipped && props.type == 'skin') {
    borderImage = true
    rarityBorder =
      'linear-gradient(to bottom right, green 0%, yellow 25%, blue 50%, green 75%, white 100%)'
  }

  if (props.equipped && props.type == 'mod') {
    borderImage = true
    rarityBorder =
      'linear-gradient(to bottom right, green 0%, green 25%, white 50%, green 75%, white 100%)'
  }

  if (props.equipped && props.type == 'trait') {
    borderImage = true
    rarityBorder =
      'linear-gradient(to bottom right, purple 0%, purple 25%, white 50%, purple 75%, white 100%)'
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
        } else if (props.type == 'mod') {
          let equipRequest = await fetch(
            `${window.location.protocol}//${window.location.hostname}:1337/equip/${props.id}?user=${props.token}&type=mod`,
          )
          if (equipRequest.status !== 200) {
            alert('There was an issue equipping this item.')
          } else {
            window.location.reload()
          }
        } else if (props.type == 'trait') {
          return;
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
      {props.type == 'trait' && <><span style={{ color: 'lime' }}>Intrinsic</span><br /><br /></>}
      {props.type == 'mod' && <><span style={{ color: 'lightgreen' }}>Mod</span><br /><br /></>}
      {props.img && <><img
        src={props.img}
        alt={props.name}
        style={{
          imageRendering: 'pixelated',
          height: '60px',
          verticalAlign: 'middle',
        }}
      /><br />
      <br /></>}
      <b style={{ fontSize: '15pt' }}>{props.name}</b>
      <br />
      <i style={{ fontSize: '10pt' }}>{props.description}</i>
      <br />
      <span style={{ fontSize: '12pt', color: '#f9e300' }}>{props.perk}</span>
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
  let [equippedMod, setEquippedMod] = useState<number>(0)

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
        setEquippedMod(playerAppearance.mod || 0)
        let userToken = await getIdToken(currentUser)
        setToken(userToken)
        setSkinsLoaded(true)
      }
    })

    authUnsub()
  }, [])
  return (
    <PageLayout>
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
            style={{
              display: 'inline-block',
              fontSize: '18pt',
              padding: '10px',
              border: '3px solid #f9e300',
              color: '#f9e300',
            }}
            onClick={() => {
              const displayName = prompt('Enter your new Dragon Name:')
              if (displayName) {
                updateProfile(user, { displayName })
                  .then(() => {
                    window.location.reload()
                  })
                  .catch(() => {
                    alert("Couldn't change your Dragon Name.")
                  })
              }
            }}
          >
            Change name
          </div>
        </span>
      </h2>
      <br />
      <h2>Abilities</h2>
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
          img="/assets/img/abilities/fireball.png"
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Iceball'}
          name="Iceball"
          img="/assets/img/abilities/iceball.png"
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Electricball'}
          name="Electricball"
          img="/assets/img/abilities/electricball.png"
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Mudball'}
          name="Mudball"
          img="/assets/img/abilities/mudball.png"
        />
        <ProfileSelectItem
          type="ability"
          token={token}
          equipped={equippedAbility == 'Poisonball'}
          name="Poisonball"
          img="/assets/img/abilities/poisonball.png"
        />
      </div>
      <br />
      <h2>Buildcrafting</h2>
      <br />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '5px',
        }}
      >
        {equippedAbility == 'Fireball' && <>
          <ProfileSelectItem
            type="trait"
            token={token}
            equipped={true}
            name="Great Balls o' Fire"
            perk="Fireballs have greatly increased range and speed."
          />
          <ProfileSelectItem
            type="mod"
            token={token}
            equipped={equippedMod == 100}
            id={100}
            name="Cloak of Invisibility"
            perk="You are invisible while dodging."
          />
          <ProfileSelectItem
            type="mod"
            token={token}
            equipped={equippedMod == 101}
            id={101}
            name="Up, down..."
            perk="Press X to launch a devastating attack affecting all nearby players."
          />
          <ProfileSelectItem
            type="mod"
            token={token}
            equipped={equippedMod == 102}
            id={102}
            name="En Garde"
            perk="In Zones mode, Fireballs shot near your Zones deal extra damage."
          />
        </>}
        {equippedAbility == 'Iceball' && <>
          <ProfileSelectItem
            type="trait"
            token={token}
            equipped={true}
            name="Citizen's Arrest"
            perk="Temporarily stuns your foes, confusing them."
          />
          {/* <ProfileSelectItem
            type="mod"
            token={token}
            equipped={equippedMod == 200}
            id={200}
            name="Great Balls o' Fire"
            perk="Fireballs have greatly increased range and speed."
          /> */}
        </>}
        {equippedAbility == 'Electricball' && <>
          <ProfileSelectItem
            type="trait"
            token={token}
            equipped={true}
            name="Replication Chamber"
            perk="Fireballs have a random chance of replication after damaging a foe."
          />
          {/* <ProfileSelectItem
            type="mod"
            token={token}
            equipped={equippedMod == 300}
            id={300}
            name="Great Balls o' Fire"
            perk="Fireballs have greatly increased range and speed."
          /> */}
        </>}
        {equippedAbility == 'Mudball' && <>
          <ProfileSelectItem
            type="trait"
            token={token}
            equipped={true}
            name="Consistent Growth"
            perk="Fireballs grow larger over time, especially after damaging foes."
          />
          {/* <ProfileSelectItem
            type="mod"
            token={token}
            equipped={equippedMod == 400}
            id={400}
            name="Great Balls o' Fire"
            perk="Fireballs have greatly increased range and speed."
          /> */}
        </>}
        {equippedAbility == 'Poisonball' && <>
          <ProfileSelectItem
            type="trait"
            token={token}
            equipped={true}
            name="Stolen Treasure"
            perk="Damaged foes begin leaking coins, allowing you to plunder their treasures."
          />
          {/* <ProfileSelectItem
            type="mod"
            token={token}
            equipped={equippedMod == 500}
            id={500}
            name="Great Balls o' Fire"
            perk="Fireballs have greatly increased range and speed."
          /> */}
        </>}
      </div>
      <br />
      <h2>Appearance</h2>
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
                      type={'skin'}
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
    </PageLayout>
  )
}
