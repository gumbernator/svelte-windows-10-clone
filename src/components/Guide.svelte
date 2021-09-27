<script>
    import { slide } from "svelte/transition";

    export let top;
    export let left;
    export let width;
    export let height;
    export let text;

    export let appearAt;
    export let disappearAt;

    let show = false;

    function open() {
        show = true;
    }

    function close() {
        show = false;
    }

    setTimeout(open, appearAt);

    setTimeout(close, disappearAt);
</script>

{#if show}
    <div
        style="--top: {top}; --left: {left}; --width: {width}; --height: {height};"
        transition:slide={{ duration: 1000 }}
    >
        <button on:click={close} />
        <p>{text}</p>
    </div>
{/if}

<style>
    div {
        position: absolute;
        left: var(--left);
        top: var(--top);
        width: var(--width);
        height: var(--height);
        border-radius: 1rem 0 1rem 1rem;
        background: whitesmoke;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    button {
        position: absolute;
        top: 0;
        right: 0;
        height: 1rem;
        width: 1rem;
        background: grey;
        background-image: url(../vectors/cancel.svg);
        background-size: cover;
    }

    button:hover {
        background: crimson;
        background-image: url(../vectors/cancel.svg);
    }

    p {
        margin: 0.5rem;
        text-align: center;
        color: black;
        font-family: SegoeUILight;
        font-size: 1rem;
        font-weight: 400;
    }
</style>
