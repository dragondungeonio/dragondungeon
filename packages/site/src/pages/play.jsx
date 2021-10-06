import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { initializeApp } from 'firebase/app';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import './play.module.css';

initializeApp({
  apiKey: "AIzaSyCRClPzTZnRSg_fAap6ENnAkxUBQKJGk5w",
  authDomain: "leaguedragoncoin.firebaseapp.com",
  projectId: "leaguedragoncoin",
  storageBucket: "leaguedragoncoin.appspot.com",
  messagingSenderId: "320692217416",
  appId: "1:320692217416:web:f9cd0efdc04445865e9a7d"
});
const auth = getAuth();
const provider = new GoogleAuthProvider();


export default function Play() {
  const [userIsLoggedIn, setUserIsLoggedIn] = useState();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserIsLoggedIn(true);
      }
    });
  }, [])

  return (
    <Layout
      title={`Play`}
      description="Ready to jump in? Let's play some Dragon Dungeon!">
      <BrowserOnly style={{ padding: '20px' }}>
        <h1>Play Dragon Dungeon</h1>
        {!userIsLoggedIn &&
          <>
            <button onClick={() => {
              signInWithPopup(auth, provider)
                .then((result) => {
                  setUserIsLoggedIn(true);
                  console.log(result.user);
                }).catch((error) => {
                  alert(error.message);
                });
            }}>Login</button>
           &nbsp;&nbsp;
            <button onClick={() => {
              signInAnonymously(auth)
                .then((result) => {
                  setUserIsLoggedIn(true);
                  console.log(result.user);
                }).catch((error) => {
                  alert(error.message);
                });
            }}>Skip</button>
          </>
        }
        { userIsLoggedIn && <>
            { ('HTMLPortalElement' in window) && <>
              <portal src={`${window.location.protocol}//${window.location.hostname}:1337/play/random`}></portal>
            </> }
            { !('HTMLPortalElement' in window) && <>
              <button onClick={() => {
                window.location.href = `${window.location.protocol}//${window.location.hostname}:1337`;
              }}></button>
            </> }
        </>
        }
      </BrowserOnly>
    </Layout>
  );
}
