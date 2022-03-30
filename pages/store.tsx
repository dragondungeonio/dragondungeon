import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useMemo, useState } from 'react'

import styles from 'styles/menu.module.css'

function GemStoreItem(props) {
  let rarityText = ''
  let rarityBorder = '#522398'
  let borderImage = false
  let currency = ''

  switch (props.rarity) {
    case 0:
      rarityText = 'Common'
      rarityBorder = 'whitesmoke'
      currency = 'Gems'
      break;
    case 1:
      rarityText = 'Uncommon'
      rarityBorder = '#009b3a'
      currency = 'Gems'
      break;
    case 2:
      rarityText = 'Rare'
      rarityBorder = '#00a1de'
      currency = 'Gems'
      break;
    case 3:
      rarityText = 'Legendary'
      rarityBorder = '#f9461c'
      currency = 'Gems'
      break;
    case 4:
      rarityText = 'Unique'
      borderImage = true
      rarityBorder = 'linear-gradient(to bottom right, #c60c30 0%, #00a1de 25%, #f9461c 50%, whitesmoke 75%, #f9e300 100%)'
      currency = 'ETH'
  }

  return <div className={styles.borderSliceApplied} style={{ border: borderImage ? '5px solid transparent': `5px solid ${rarityBorder}`, borderImage: borderImage ? rarityBorder: '', padding: '20px', width: '160px' }} onClick={() => confirm(`You are about to buy ${props.name} for ${props.cost} ${currency}.`)}>
    <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '32px' }} /><br /><br />
    {props.name}<br /><br /><i>{props.cost} {currency}</i>
    <br /><br /><p style={{ color: borderImage ? 'whitesmoke' : rarityBorder }}>{rarityText}</p>
  </div>
}

function GemStoreSection(props) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>{props.children}</div>
}

export default function MyDragon() {
  let [user, setUser] = useState<any>('')

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      }
    })

    authUnsub()
  }, [])

  return (
    <div className={styles.pageContent}>
      <h1>Gem Store</h1>
      <h2><img src={user.photoURL} className={styles.heroImage} style={{ height: '60px', verticalAlign: 'middle' }} /> 0 Gems</h2>
      <br />
      <h3>Gems</h3>
      <GemStoreSection>
        <GemStoreItem name="100 Gems" img="/img/ui/gem.png" cost="$0.99" checkout="https://buy.stripe.com/test_dR67vC4af6skbXqeUU" />
        <GemStoreItem name="500 Gems + 50 Bonus" img="/img/ui/gem.png" cost="$4.99" checkout="https://buy.stripe.com/test_28oeY4gX1g2Uf9CbIJ" />
        <GemStoreItem name="1000 Gems + 100 Bonus" img="/img/ui/gem.png" cost="$9.99" checkout="https://buy.stripe.com/test_8wMdU09uz8As4uY7su" />
        <GemStoreItem name="10000 Gems + 1000 Bonus" img="/img/ui/gem.png" cost="$99.99" checkout="https://buy.stripe.com/test_aEU7vC2278AsbXq28b" />
      </GemStoreSection>
      <h3>Modes</h3>
      <GemStoreSection>
        <GemStoreItem name="Capture The Coins" rarity={1} img="/img/game/coinJar.png" cost={400} />
      </GemStoreSection>
      <h3>Skins</h3>
      <GemStoreSection>
        <GemStoreItem name="Electric Dragon" rarity={2} img="/img/dragons/goldDragon.png" cost={100} />
        <GemStoreItem name="Bat Dragon" rarity={3} img="/img/dragons/goldDragon.png" cost={300} />
        <GemStoreItem name="Light Dragon" rarity={4} img="/img/dragons/lightDragon.png" nft="nft-id-here" cost={0.032} />
      </GemStoreSection>
      <h3>Story</h3>
      <GemStoreSection>
        <GemStoreItem name="2022 Annual Pass" rarity={0} img="/img/ui/cursor.png" cost={1000} />
      </GemStoreSection>
    </div>
  )
}
