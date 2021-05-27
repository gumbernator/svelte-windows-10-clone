<script lang="ts">
    let text = "";

    function clear() {
        text = "";
    }

    function addCharacter(char: string) {
        text += char;
    }

    function equals() {
        text = "something :P";
    }
</script>

<div class="calculator">
    <div class="top-section">
        <p>{text}</p>
    </div>

    <div class="bottom-section">
        <button
            style="grid-column: span 2; background-color: rgba(60, 60, 60);"
            on:click={clear}>C</button
        >
        <button on:click={() => addCharacter("/")}>/</button>
        <button on:click={() => addCharacter("*")}>*</button>
        <button on:click={() => addCharacter("7")}>7</button>
        <button on:click={() => addCharacter("8")}>8</button>
        <button on:click={() => addCharacter("9")}>9</button>
        <button on:click={() => addCharacter("-")}>-</button>
        <button on:click={() => addCharacter("4")}>4</button>
        <button on:click={() => addCharacter("5")}>5</button>
        <button on:click={() => addCharacter("6")}>6</button>
        <button style="grid-row: span 2;" on:click={() => addCharacter("+")}
            >+</button
        >
        <button on:click={() => addCharacter("1")}>1</button>
        <button on:click={() => addCharacter("2")}>2</button>
        <button on:click={() => addCharacter("3")}>3</button>
        <button on:click={() => addCharacter("0")}>0</button>
        <button on:click={() => addCharacter("00")}>00</button>
        <button on:click={() => addCharacter(".")}>.</button>
        <button style="background-color: rgba(60, 60, 60);" on:click={equals}
            >=</button
        >
    </div>
</div>

<style>
    .calculator {
        height: 100%;
        width: 100%;
        position: absolute;
        overflow: hidden;
    }

    .top-section {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 20%;
        background: rgb(30, 30, 30);
        display: flex;
        align-items: center;
    }

    .bottom-section {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 80%;
        padding: 0.5rem;
        background: rgb(30, 30, 30);
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
        grid-gap: 0.25rem;
    }

    button {
        display: grid;
        border: none;
        padding: 0;
        margin: 0;
        border-radius: 0;
        place-items: center;
        background-color: var(--system-color-1);
        color: white;
        font-size: 3vh;
    }

    button:active {
        transform: scale(0.95);
    }

    button:hover {
        opacity: 0.5;
    }

    p {
        position: absolute;
        right: 0;
        margin-right: 2rem;
        font-family: SegoeUI;
        font-size: 2rem;
        color: white;
    }
</style>
