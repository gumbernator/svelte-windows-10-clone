<script lang="ts">
    import Taskbar from "./components/taskbar/Taskbar.svelte";
    import Window from "./components/window/Window.svelte";

    import { Windows } from "./components/window/windows";
    import type { WindowPropType } from "./components/window/windows";
    import { TaskbarItemStates } from "./components/window/taskbarItems";
    import ChosenPanel from "./components/taskbar/chosenPanel";

    import Calculator from "./components/window/forms/Calculator.svelte";
    import Minesweeper from "./components/window/forms/Minesweeper.svelte";

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
        windowId="_calculator"
        left="25vw"
        top="10vh"
        width="20vw"
        height="60vh"
        minWidth="15vw"
        minHeight="40vh"
        icon="./vectors/calculator.svg"
        title="Calculator"
        itemPosition={0}
    >
        <Calculator />
    </Window>
    <Window
        windowId="_minesweeper"
        left="20vw"
        top="10vh"
        width="40vw"
        height="60vh"
        minWidth="40vw"
        minHeight="60vh"
        icon="./vectors/bomb.svg"
        title="Minesweeper"
        itemPosition={1}
    >
        <Minesweeper />
    </Window>
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
