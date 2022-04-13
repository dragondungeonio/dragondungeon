import styles from '../../styles/menu.module.css'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

export default function BNETlink() {
    let router = useRouter()
    let [response, setResponse] = useState<string>('')

    useMemo(() => {
        if (router.query.code) {
            fetch('https://www.bungie.net/platform/app/oauth/token/', {
                method: 'POST',
                body: `grant_type=authorization_code&code=${router.query.code}&client_id=34616`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }).then(response => response.text()).then(token => setResponse(token)).catch(e => setResponse(e))
        } else {
            router.push('/')
        }
    }, [])

    return (
        <div className={styles.pageContent}>
            <h1>Accounts // Bungie</h1>
            { response }
        </div>
    )
}
