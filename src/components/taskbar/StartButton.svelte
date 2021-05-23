<script lang="ts">
    import ChosenPanel from "./chosenPanel";
    import StartPanel from "./panels/StartPanel.svelte";

    let activeVisibility = "hidden";
    let inactiveVisibility = "visible";
    let chosen = false;

    ChosenPanel.subscribe((data) => {
        chosen = data.name === "start";
        activeVisibility = "hidden";
        inactiveVisibility = "visible";
        if (chosen) {
            activeVisibility = "visible";
            inactiveVisibility = "hidden";
        }
    });

    function onClick() {
        ChosenPanel.update((data) => {
            data.name = data.name === "start" ? "" : "start";
            return data;
        });
    }

    function onMouseEnter() {
        activeVisibility = "visible";
        inactiveVisibility = "hidden";
    }

    function onMouseLeave() {
        if (chosen) {
            return;
        }
        activeVisibility = "hidden";
        inactiveVisibility = "visible";
    }
</script>

<button
    on:mouseenter={onMouseEnter}
    on:mouseleave={onMouseLeave}
    on:click={onClick}
>
    <img
        src="./vectors/icons8-windows-10-start.svg"
        alt=""
        style="visibility: {inactiveVisibility}"
        draggable="false"
    />
    <img
        src="./vectors/icons8-windows-10-start-active.svg"
        alt=""
        style="visibility: {activeVisibility}"
        draggable="false"
    />
</button>
<StartPanel />

<style>
    button {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: calc(var(--taskbar-height) + 0.5vh);
        background: none;
        border: none;
        transition: 100ms;
        transition-property: background-color;
        z-index: 999;
    }

    button:hover {
        background-color: hsla(0, 0%, 80%, 0.1);
    }

    button > img {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
    }
</style>
