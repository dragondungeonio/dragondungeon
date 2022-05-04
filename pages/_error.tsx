function Error({ statusCode }) {
    return (
        <p>
            dragondungeon.io encounteed an error and needs to reload.
            <button onClick={() => window.location.reload()}></button>
        </p>
    )
}

export default Error