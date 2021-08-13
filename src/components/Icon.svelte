<script>
    export let top;
    export let left;
    export let imgPath;
    export let text = "sdasdasdasdasdasd";

    let backgroundColor = "transparent";
    function onmouseenter() {
        backgroundColor = "rgba(130, 170, 200, 0.5)";
    }

    function onmouseleave() {
        backgroundColor = "transparent";
    }

    function onmousedown() {
        backgroundColor = "rgba(68, 121, 200, 0.6)";
    }
</script>

<button
    style="top: {top}; left: {left}; background-image: url({imgPath}); background-color: {backgroundColor};"
    on:mouseenter={onmouseenter}
    on:mouseleave={onmouseleave}
    on:mousedown={onmousedown}
    on:dblclick
>
    <p>{text}</p>
</button>

<style>
    button {
        position: absolute;
        width: 5rem;
        height: 5rem;
        background-color: transparent;
        background-size: 50%;
        background-position-x: center;
        background-position-y: 30%;
        background-repeat: no-repeat;
        user-select: none;
    }

    p {
        position: absolute;
        top: 70%;
        width: 100%;
        text-align: center;
        font-family: SegoeUISemiLight;
        font-size: 1rem;
        color: white;
        text-shadow: 2px 2px 4px #000000;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
