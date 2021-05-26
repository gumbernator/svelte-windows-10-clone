<script lang="ts">
    import Taskbar from "./components/taskbar/Taskbar.svelte";
    import Window from "./components/window/Window.svelte";

    import { Windows } from "./components/window/windows";
    import type { WindowPropType } from "./components/window/windows";
    import { TaskbarItemStates } from "./components/window/taskbarItems";
    import ChosenPanel from "./components/taskbar/chosenPanel";

    import Calculator from "./components/window/forms/Calculator.svelte";

    function onBackgroundClick() {
        Windows.update((windows: WindowPropType) => {
            for (let key in windows) {
                windows[key].focused = false;
                if (
                    windows[key].taskbarItemState == TaskbarItemStates.focused
                ) {
                    windows[key].taskbarItemState = TaskbarItemStates.opened;
                }
            }
            return windows;
        });
        ChosenPanel.update((data) => {
            data.name = "";
            return data;
        });
    }
</script>

<main>
    <div on:click={onBackgroundClick}>
        <img src="./vectors/Flat-Mountains.svg" alt="" draggable="false" />
    </div>

    <Taskbar />
    <Window
        windowId="id1"
        left="1vw"
        top="1vh"
        width="20vw"
        height="60vh"
        minWidth="15vw"
        minHeight="40vh"
        itemPosition={0}><Calculator /></Window
    >
</main>

<style>
    div {
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: #588dde;
        user-select: none;
    }

    img {
        position: absolute;
        width: 100%;
        height: auto;
        bottom: 0;
    }

    :global(:root) {
        --taskbar-height: max(4vh, 30px);
        --system-color-1: #2b2b2b;
        --system-color-2: #757575;
        --system-color-3: #424242;
        --system-color-4: #b1b1b1;
    }
    :global(body) {
        padding: 0;
        margin: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }
</style>
