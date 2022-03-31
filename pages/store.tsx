import { getAuth, onAuthStateChanged, getIdToken } from 'firebase/auth'
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
      break;
    case 5:
      borderImage = true
      rarityBorder = 'linear-gradient(to bottom right, blue 0%, red 90%, #c60c30 100%)'
      currency = 'Gems'
      break;
    case 6:
      borderImage = true
      rarityBorder = 'linear-gradient(to bottom right, whitesmoke 0%, #c60c30 90%, #c60c30 100%)'
      currency = 'Exclusive Item'
      break;
  }

  return <div className={styles.borderSliceApplied} style={{ border: borderImage ? '5px solid transparent' : `5px solid ${rarityBorder}`, borderImage: borderImage ? rarityBorder : '', padding: '20px', width: '200px', background: 'rgba(0, 0, 0, 0.9)' }} onClick={() => {
    if (props.owned) {
      alert('You already own this item.')
    } else if (props.rarity == 6) {
      alert('This item is not available for purchase.')
    } else {
      if (currency == 'Gems') {
        if (props.cost < props.player) {
          if (confirm(`You are about to buy ${props.name} for ${props.cost} Gems.`)) {
            fetch(`${window.location.protocol}//${window.location.hostname}:1337/purchase/${props.id}?user=${props.token}&type=${props.rarity == 5 ? 'mode' : 'skin'}`)
              .then((r) => {
                if (r.status == 200) {
                  alert(`You have purchased ${props.name}. You may need to refresh the game before your purchase appears in the Gem Store.`)
                } else {
                  alert('There was an issue. Try again later.')
                }
              })
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
            let payForm = (document.querySelector("#payment-form") as HTMLFormElement)
            payForm.style.display = 'block'
            let selectForm = (document.querySelector("#buygems") as HTMLFormElement)
            selectForm.style.display = 'none'

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
    }
  }}>
    <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '45px', opacity: affordable ? 1 : 0.5 }} /><br /><br />
    <b style={{ fontSize: '17pt' }}>{props.name}</b><br /><br />
    {!props.owned && <><span style={{ color: affordable ? 'white' : 'red', fontSize: '15pt' }}>{props.cost}</span> {currency}</>}
    {props.owned && <span style={{ color: 'green', fontSize: '15pt' }}>Owned</span>}
    <br /><p>{props.description}</p><p style={{ color: '#f9e300', fontSize: '10pt' }}>{props.perk}</p><p style={{ color: borderImage ? 'whitesmoke' : rarityBorder, fontSize: '15pt' }}>{rarityText}</p>
  </div>
}

function GemStoreSection(props) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>{props.children}</div>
}

export default function MyDragon() {
  let [user, setUser] = useState<any>('')
  let [gems, setGems] = useState<number>(0)
  let [skins, setSkins] = useState<any>('')
  let [modes, setModes] = useState<any>('')
  let [token, setToken] = useState<string>('')
  let [entitledSkins, setEntitledSkins] = useState<any>('')
  let [entitledModes, setEntitledModes] = useState<any>('')
  let [skinsLoaded, setSkinsLoaded] = useState<boolean>(false)
  let [modesLoaded, setModesLoaded] = useState<boolean>(false)

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        let skinListingResp = await fetch('/api/skins.json')
        let skinListing = await skinListingResp.json()
        let modeListingResp = await fetch('/api/modes.json')
        let modeListing = await modeListingResp.json()
        setSkins(skinListing)
        setModes(modeListing)
        let db = getFirestore()
        let playerEntitlementsDoc = await getDoc(doc(db, currentUser.uid, 'store'))
        let playerEntitlements = playerEntitlementsDoc.data()
        setGems(playerEntitlements.gems)
        setEntitledSkins(playerEntitlements.skinEntitlements)
        setEntitledModes(playerEntitlements.modeEntitlements)
        setToken(await getIdToken(currentUser))
        setSkinsLoaded(true)
        setModesLoaded(true)
      }
    })

    authUnsub()
  }, [])

  return (
    <div className={styles.pageContent}>
      <h1>Store</h1>
      <h2><img src="/img/ui/gem.png" className={styles.heroImage} style={{ height: '40px', verticalAlign: 'middle' }} /> {gems}&nbsp;<a onClick={() => (document.querySelector('#buygems') as HTMLDivElement).style.display = 'block'} style={{ fontSize: '13pt', textDecoration: 'none' }}>Get More</a> </h2>
      <p>It may take up to <b>3 minutes</b> for Gem and Store purchases to appear in your account.</p>
      <br />
      <div id="buygems" className={styles.form}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <GemStoreItem name="100" img="/img/ui/gem.png" cost="$0.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/100?uid=${user.uid}`} />
          <GemStoreItem name="500 + 50" img="/img/ui/gem.png" cost="$4.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/500?uid=${user.uid}`} />
          <GemStoreItem name="1000 + 100" img="/img/ui/gem.png" cost="$9.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/1000?uid=${user.uid}`} />
          <GemStoreItem name="10000 + 1000" img="/img/ui/gem.png" cost="$99.99" checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/10000?uid=${user.uid}`} />
        </div>
      </div>
      <form id="payment-form" className={styles.form}>
        <div id="payment-element"></div>
        <br /><br />
        <button id="submit" className={styles.formSubmit}>
          Buy Gems
        </button>
      </form>
      {(skinsLoaded && modesLoaded) && <GemStoreSection>
        {modes.map(mode => {
          return <GemStoreItem token={token} name={mode.name} id={mode.id} owned={entitledModes.includes(mode.id)} description={mode.description} rarity={5} img={mode.thumbnail} cost={mode.gemCost} player={gems} />
        })}
        {skins.map(skin => {
          return <GemStoreItem token={token} name={skin.name} id={skin.id} owned={entitledSkins.includes(skin.id)} description={skin.description} rarity={skin.rarity} img={skin.thumbnail} cost={skin.gemCost} perk={skin.perk} player={gems} />
        })}
      </GemStoreSection>}
      <br /><br />
    </div>
  )
}
