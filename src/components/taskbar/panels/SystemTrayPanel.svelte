<script lang="ts">
    import ChosenPanel from "../chosenPanel";

    let visibility = "hidden";

    ChosenPanel.subscribe((data) => {
        if (data.name === "systemtray") {
            visibility = "visible";
            return;
        }
        visibility = "hidden";
    });
</script>

<div class="system-tray-panel" style="--visibility: {visibility}" />

<style>
    .system-tray-panel {
        position: absolute;
        right: calc(
            15px + max(30px, 4vh) + max(6.5vh, 45px) + max(25px, 3.5vh) -
                (7vw - max(2.5vh, 20px)) / 2
        );
        bottom: var(--taskbar-height);
        width: 7vw;
        height: 10vh;
        border-left: 1px var(--system-color-2) solid;
        border-top: 1px var(--system-color-2) solid;
        border-right: 1px var(--system-color-2) solid;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 998;
        visibility: var(--visibility);
    }
</style>
