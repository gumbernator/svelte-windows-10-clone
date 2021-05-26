<script lang="ts">
</script>

<div class="calculator">
    <div class="top-section">
        <p>resultasdddd</p>
    </div>

    <div class="bottom-section">
        <button style="grid-column: span 2; background-color: #ff2d7a;"
            >C</button
        >
        <button>/</button>
        <button>*</button>
        <button>7</button>
        <button>8</button>
        <button>9</button>
        <button>-</button>
        <button>4</button>
        <button>5</button>
        <button>6</button>
        <button style="grid-row: span 2;">+</button>
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>0</button>
        <button>00</button>
        <button>.</button>
        <button style="background-color: #0596d9;">=</button>
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
        background: white;
        display: flex;
        align-items: center;
    }

    .bottom-section {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 80%;
        background: black;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
        grid-gap: 0.125rem;
    }

    button {
        display: grid;
        border: none;
        padding: 0;
        margin: 0;
        border-radius: 0;
        place-items: center;
        background-color: #0d2636;
        color: white;
        font-size: 3vh;
    }

    button:active {
        background-color: white;
    }

    p {
        position: absolute;
        right: 0;
        margin-right: 2rem;
        font-family: monospace;
        font-size: 2rem;
    }
</style>
