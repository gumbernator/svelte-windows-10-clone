<script lang="ts">
    let topText = "";
    let bottomText = "0";
    let operand = "";
    const operands = /\+|-|\*|\//;

    function clear() {
        topText = "";
        bottomText = "0";
        operand = "";
    }

    function addCharacter(char: string) {
        if (char === ".") {
            if (!bottomText.includes(".")) {
                bottomText += char;
            }
            return;
        }
        if (char.match(operands) && topText !== "") {
            return;
        }
        if (
            char.match(operands) &&
            (bottomText.includes("+") ||
                bottomText.includes("-") ||
                bottomText.includes("*") ||
                bottomText.includes("/") ||
                topText !== "")
        ) {
            return;
        }
        if (char.match(operands)) {
            operand = char;
            topText = bottomText;
            bottomText = "0";
            return;
        }
        if (bottomText === "0" && (char === "0" || char === "00")) {
            return;
        }
        if (bottomText === "0") {
            bottomText = char;
            return;
        }
        bottomText += char;
    }

    function equals() {
        switch (operand) {
            case "": {
                return;
                break;
            }
            case "/": {
                bottomText = (Number(topText) / Number(bottomText)).toString();
                break;
            }
            case "*": {
                bottomText = (Number(topText) * Number(bottomText)).toString();
                break;
            }
            case "+": {
                bottomText = (Number(topText) + Number(bottomText)).toString();
                break;
            }
            case "-": {
                bottomText = (Number(topText) - Number(bottomText)).toString();
                break;
            }
        }
        topText = "";
        operand = "";
    }
</script>

<div class="calculator" draggable="false">
    <ul class="top-section">
        <li><p style="font-size: 1.5rem;">{topText}{operand}</p></li>
        <li><p style="font-size: 3rem;">{bottomText}</p></li>
    </ul>

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
        background: rgb(30, 30, 30);
    }

    .top-section {
        position: absolute;
        right: 0;
        top: 0;
        height: 20%;
        margin-right: 2rem;
        display: flex;
        list-style: none;
        flex-direction: column;
    }

    .bottom-section {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 80%;
        padding: 0.5rem;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
        grid-gap: 0.25rem;
        user-select: none;
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

    li {
        height: 50%;
        display: flex;
        /* justify-content: center; */
        align-items: center;
    }

    p {
        position: absolute;
        right: 0;
        font-family: SegoeUI;
        color: white;
    }
</style>
