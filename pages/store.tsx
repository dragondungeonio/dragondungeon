import { getAuth, onAuthStateChanged, getIdToken } from 'firebase/auth'
import { useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { PageLayout } from 'components'

import styles from 'styles/menu.module.css'

function GemStoreItem(props) {
  let affordable = props.isRealMoneyPurchase ? true : props.cost <= props.player

  return (
    <div
      className={styles.borderSliceApplied}
      style={{
        border: `5px solid ${
          props.isRealMoneyPurchase ? '#522398' : 'whitesmoke'
        }`,
        padding: '20px',
        width: '200px',
        background: 'black',
      }}
      onClick={() => {
        if (props.owned) {
          alert('You already own this item.')
        } else {
          if (!props.isRealMoneyPurchase) {
            if (props.cost <= props.player) {
              if (
                confirm(
                  `You are about to buy ${props.name} for ${props.cost} Gems.`,
                )
              ) {
                fetch(
                  `${window.location.protocol}//${window.location.hostname}:1337/purchase/${props.id}?user=${props.token}`,
                ).then((r) => {
                  if (r.status == 200) {
                    alert(
                      `You have purchased ${props.name}. You may need to refresh the game before your purchase appears in the Gem Store.`,
                    )
                  } else {
                    alert('There was an issue. Try again later.')
                  }
                })
              }
            } else {
              alert(
                `You need ${props.cost - props.player} more Gems to buy ${
                  props.name
                }.`,
              )
            }
          } else {
            loadStripe(
              'pk_test_51KgIDsG5JuiCDpDvlSQlZMTIMg1skB4Of3C6p8o18wI9rU6hIjQJ6psyxtVTpbTK4ZSXzcvCwxelaBnzx5LuAqO200b39PdZfa',
            ).then(async (stripe) => {
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
                clientSecret,
              })

              const paymentElement = elements.create('payment')
              paymentElement.mount('#payment-element')
              let payForm = document.querySelector(
                '#payment-form',
              ) as HTMLFormElement
              payForm.style.display = 'block'
              let selectForm = document.querySelector(
                '#buygems',
              ) as HTMLFormElement
              selectForm.style.display = 'none'

              payForm.onsubmit = async (e) => {
                e.preventDefault()

                const { error } = await stripe.confirmPayment({
                  elements,
                  confirmParams: {
                    return_url: `${window.location.protocol}//${window.location.host}/store`,
                  },
                })

                if (
                  error.type === 'card_error' ||
                  error.type === 'validation_error'
                ) {
                  alert(error.message)
                } else {
                  alert(
                    "We couldn't process your Gem purchase. Please try again later.",
                  )
                }

                payForm.style.display = 'none'
              }
            })
          }
        }
      }}
    >
      <img
        src={props.img}
        alt={props.name}
        style={{
          imageRendering: 'pixelated',
          height: '45px',
          opacity: affordable ? 1 : 0.5,
        }}
      />
      <br />
      <br />
      <b style={{ fontSize: '17pt' }}>{props.name}</b>
      <br />
      <br />
      {!props.owned && (
        <>
          <span
            style={{ color: affordable ? 'white' : 'red', fontSize: '15pt' }}
          >
            {props.cost}
          </span>
          {props.isRealMoneyPurchase ? '' : ' Gems'}
        </>
      )}
      {props.owned && (
        <span style={{ color: 'green', fontSize: '15pt' }}>Owned</span>
      )}
      <br />
      <p>{props.description}</p>
      <p style={{ color: '#f9e300', fontSize: '10pt' }}>{props.perk}</p>
    </div>
  )
}

function GemStoreSection(props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
      }}
    >
      {props.children}
    </div>
  )
}

export default function MyDragon() {
  let [user, setUser] = useState<any>('')
  let [gems, setGems] = useState<number>(0)
  let [skins, setSkins] = useState<any>('')
  let [token, setToken] = useState<string>('')
  let [entitledSkins, setEntitledSkins] = useState<any>('')
  let [skinsLoaded, setSkinsLoaded] = useState<boolean>(false)

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        let skinListingResp = await fetch('/api/skins.json')
        let skinListing = await skinListingResp.json()
        setSkins(skinListing)
        let db = getFirestore()
        let playerEntitlementsDoc = await getDoc(
          doc(db, currentUser.uid, 'store'),
        )
        let playerEntitlements = playerEntitlementsDoc.data()
        setGems(playerEntitlements.gems)
        setEntitledSkins(playerEntitlements.skinEntitlements)
        setToken(await getIdToken(currentUser))
        setSkinsLoaded(true)
      }
    })

    authUnsub()
  }, [])

  return (
    <PageLayout>
      <h1>Store</h1>
      <h2>
        <img
          src="/assets/img/ui/gem.png"
          style={{ height: '40px', verticalAlign: 'middle' }}
        />{' '}
        {gems}
        <br />
        <br />
        <a
          onClick={() =>
            ((
              document.querySelector('#buygems') as HTMLDivElement
            ).style.display = 'block')
          }
          style={{
            fontSize: '20pt',
            textDecoration: 'none',
            color: '#f9e300',
            border: '3px solid #f9e300',
            padding: '10px',
          }}
        >
          Get More
        </a>
        <br />
        <br />
      </h2>
      <p>
        It may take up to <b>3 minutes</b> for Gem and Store purchases to appear
        in your account.
      </p>
      <br />
      <div id="buygems" className={styles.form}>
        <BackButton divId="buygems" />
        <br />
        <br />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
          }}
        >
          <GemStoreItem
            name="100"
            img="/assets/img/ui/gem.png"
            isRealMoneyPurchase={true}
            cost="$0.99"
            checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/100?uid=${user.uid}`}
          />
          <GemStoreItem
            name="500 + 50"
            img="/assets/img/ui/gem.png"
            isRealMoneyPurchase={true}
            cost="$4.99"
            checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/500?uid=${user.uid}`}
          />
          <GemStoreItem
            name="1000 + 100"
            img="/assets/img/ui/gem.png"
            isRealMoneyPurchase={true}
            cost="$9.99"
            checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/1000?uid=${user.uid}`}
          />
          <GemStoreItem
            name="10000 + 1000"
            img="/assets/img/ui/gem.png"
            isRealMoneyPurchase={true}
            cost="$99.99"
            checkout={`${window.location.protocol}//${window.location.hostname}:1337/pay/10000?uid=${user.uid}`}
          />
        </div>
      </div>
      <form id="payment-form" className={styles.form}>
        <BackButton divId="payment-form" />
        <br />
        <br />
        <div id="payment-element"></div>
        <br />
        <br />
        <button id="submit" className={styles.formSubmit}>
          Buy Gems
        </button>
      </form>
      {skinsLoaded && (
        <GemStoreSection>
          {skins.map((skin) => {
            return (
              <GemStoreItem
                isRealMoneyPurchase={false}
                token={token}
                name={skin.name}
                id={skin.id}
                owned={entitledSkins.includes(skin.id)}
                description={skin.description}
                img={skin.thumbnail}
                cost={skin.gemCost}
                perk={skin.perk}
                player={gems}
              />
            )
          })}
        </GemStoreSection>
      )}
      <br />
      <br />
    </PageLayout>
  )
}

function BackButton({ divId }) {
  return (
    <a
      onClick={() =>
        ((document.querySelector('#' + divId) as HTMLDivElement).style.display =
          '')
      }
      style={{
        fontSize: '20pt',
        textDecoration: 'none',
        color: '#f9e300',
        border: '3px solid #f9e300',
        padding: '10px',
      }}
    >
      Back
    </a>
  )
}
