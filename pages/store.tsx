import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { getFirestore, doc, getDoc } from 'firebase/firestore/lite'

import styles from 'styles/menu.module.css'

function GemStoreItem(props) {
  let rarityText = ''
  let rarityBorder = '#522398'
  let borderImage = false
  let currency = ''
  let affordable = true

  switch (props.rarity) {
    case 0:
      rarityText = 'Common'
      rarityBorder = 'whitesmoke'
      currency = 'Gems'
      if (props.player < props.cost) { affordable = false }
      break;
    case 1:
      rarityText = 'Uncommon'
      rarityBorder = '#009b3a'
      currency = 'Gems'
      if (props.player < props.cost) { affordable = false }
      break;
    case 2:
      rarityText = 'Rare'
      rarityBorder = '#00a1de'
      currency = 'Gems'
      if (props.player < props.cost) { affordable = false }
      break;
    case 3:
      rarityText = 'Legendary'
      rarityBorder = '#f9461c'
      currency = 'Gems'
      if (props.player < props.cost) { affordable = false }
      break;
    case 4:
      rarityText = 'Unique'
      borderImage = true
      rarityBorder = 'linear-gradient(to bottom right, #c60c30 0%, #00a1de 25%, #f9461c 50%, whitesmoke 75%, #f9e300 100%)'
      currency = 'ETH'
  }

  return <div className={styles.borderSliceApplied} style={{ border: borderImage ? '5px solid transparent' : `5px solid ${rarityBorder}`, borderImage: borderImage ? rarityBorder : '', padding: '20px', width: '160px', background: 'rgba(0, 0, 0, 0.9)' }} onClick={() => {
    if (currency == 'Gems') {
      if (props.cost < props.player) {
        if (confirm(`You are about to buy ${props.name} for ${props.cost} Gems.`)) {
          alert(`You have purchased ${props.name}. Have fun!`)
        }
      } else {
        alert(`You need ${props.cost - props.player} more Gems to buy ${props.name}.`)
      }
    } else if (currency == 'ETH') {
      alert('NFT items are not yet available.')
    } else {
      loadStripe('pk_test_51KgIDsG5JuiCDpDvlSQlZMTIMg1skB4Of3C6p8o18wI9rU6hIjQJ6psyxtVTpbTK4ZSXzcvCwxelaBnzx5LuAqO200b39PdZfa')
        .then(async (stripe) => {
          const response = await fetch(props.checkout)
          const { clientSecret } = await response.json()

          let elements = stripe.elements({
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#c60c30',
                colorBackground: '#522398',
                colorText: 'white',
              },
            },
            clientSecret
          })

          const paymentElement = elements.create("payment");
          paymentElement.mount("#payment-element");
          let payForm = (document.querySelector("#payment-form") as HTMLFormElement )
          payForm.style.display = 'block'

          payForm.onsubmit = async (e) => {
            e.preventDefault()

            const { error } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.protocol}//${window.location.host}/store`,
              },
            })

            if (error.type === "card_error" || error.type === "validation_error") {
              alert(error.message)
            } else {
              alert("We couldn't process your Gem purchase. Please try again later.")
            }

            payForm.style.display = 'none'
          }
        })
    }
  }}>
    <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '45px', opacity: affordable ? 1 : 0.5 }} /><br /><br />
    <b style={{ fontSize: '17pt' }}>{props.name}</b><br /><br /><span style={{ color: affordable ? 'white' : 'red', fontSize: '15pt' }}>{props.cost}</span> {currency}
    <br /><br /><p style={{ color: borderImage ? 'whitesmoke' : rarityBorder, fontSize: '15pt' }}>{rarityText}</p>
  </div>
}

function GemStoreSection(props) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>{props.children}</div>
}

export default function MyDragon() {
  let [user, setUser] = useState<any>('')
  let [gems, setGems] = useState<number>(0)
  let [skins, setSkins] = useState<any>('')
  let [skinsLoaded, setSkinsLoaded] = useState<boolean>(false)

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        let skinListingResp = await fetch('/api/skins.json')
        let skinListing = await skinListingResp.json()
        setSkins(skinListing)
        setSkinsLoaded(true)
        let db = getFirestore()
        let playerEntitlementsDoc = await getDoc(doc(db, currentUser.uid, 'store'))
        let playerEntitlements = playerEntitlementsDoc.data()
        setGems(playerEntitlements.gems)
      }
    })

    authUnsub()
  }, [])

  return (
    <div className={styles.pageContent}>
      <h1>Store</h1>
      <h2><img src={user.photoURL} className={styles.heroImage} style={{ height: '60px', verticalAlign: 'middle', borderRadius: '50px' }} />&nbsp;&nbsp; { gems } Gems &nbsp;&nbsp;<a href='#buy' className={styles.formSubmit}>Get More</a> </h2>
      <br />
      <form id="payment-form" className={styles.form}>
        <div id="payment-element"></div>
        <br /><br />
        <button id="submit" className={styles.formSubmit}>
          Buy Gems
        </button>
      </form>
      <h2>Modes</h2>
      <GemStoreSection>
        <GemStoreItem name="Capture" rarity={1} img="/img/game/coinJar.png" cost={400} player={gems} />
      </GemStoreSection>
      <h2>Skins</h2>
      <GemStoreSection>
        <GemStoreItem name="Electric" rarity={2} img="/img/dragons/goldDragon.png" cost={100} player={gems} />
        <GemStoreItem name="Batdragon" rarity={3} img="/img/dragons/goldDragon.png" cost={300} player={gems} />
        <GemStoreItem name="Lighter" rarity={4} img="/img/dragons/lightDragon.png" nft="nft-id-here" cost={0.032} />
      </GemStoreSection>
      <h2>Story</h2>
      <GemStoreSection>
        <GemStoreItem name="2022 Annual Pass" rarity={0} img="/img/ui/cursor.png" cost={1000} player={gems} />
      </GemStoreSection>
      <br /><br />
      <hr />
      <br /><br />
      <span id='buy' />
      <GemStoreSection>
        <GemStoreItem name="100" img="/img/ui/gem.png" cost="$0.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/100?uid=${user.uid}`} />
        <GemStoreItem name="500 + 50" img="/img/ui/gem.png" cost="$4.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/500?uid=${user.uid}`} />
        <GemStoreItem name="1000 + 100" img="/img/ui/gem.png" cost="$9.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/1000?uid=${user.uid}`} />
        <GemStoreItem name="10000 + 1000" img="/img/ui/gem.png" cost="$99.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/10000?uid=${user.uid}`} />
      </GemStoreSection>
      <br /><br /><br /><br />
    </div>
  )
}
