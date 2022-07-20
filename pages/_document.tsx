import { Html, Head, Main, NextScript } from 'next/document'

export default function DragonDungeonDoc() {
    return <Html>
        <Head>
            <title>DragonDungeon</title>
            <link rel="icon" href="/assets/img/game/coinJar.png" />
            <meta property="og:title" content="DragonDungeon" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://dragondungeon.io" />
            <meta
                property="og:image"
                content="https://dragondungeon.io/assets/img/skins/basic.png"
            />
            <meta
                property="og:description"
                content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers."
            />
            <meta
                name="description"
                content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers."
            />
            <meta name="twitter:creator" content="@dragondungeonio" />
            <meta
                name="twitter:image"
                content="https://dragondungeon.io/assets/img/skins/basic.png"
            />
        </Head>
        <Main />
        <NextScript />
        <noscript
            dangerouslySetInnerHTML={{
                __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX" height="0" width="0" style="display: none; visibility: hidden;" />`,
            }}
        />
    </Html>
}