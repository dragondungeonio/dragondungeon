function Error({ statusCode }) {
    return (
        <p>
            DragonDungeon encountered an error and needs to reload.
            <button onClick={() => window.location.reload()}></button>
        </p>
    )
}

export default Error