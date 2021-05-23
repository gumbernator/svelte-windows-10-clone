<script lang="ts">
    import Taskbar from "./components/taskbar/Taskbar.svelte";
    import Window from "./components/window/Base.svelte";
    import { Windows } from "./components/window/windows";
    import type { WindowPropType } from "./components/window/windows";
    import { TaskbarItemStates } from "./components/window/taskbarItems";
    import ChosenPanel from "./components/taskbar/chosenPanel";

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
        left="0vw"
        top="0vh"
        width="20vw"
        height="20vh"
        itemPosition={0}
    />
    <Window
        windowId="id2"
        left="0vw"
        top="25vh"
        width="20vw"
        height="20vh"
        itemPosition={1}
    />
    <Window
        windowId="id3"
        left="0vw"
        top="50vh"
        width="20vw"
        height="20vh"
        itemPosition={2}
    />
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
