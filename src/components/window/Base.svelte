<script lang="ts">
    import { fade } from "svelte/transition";
    import { TaskbarItemStates } from "./taskbarItems";
    import TaskbarItem from "./TaskbarItem.svelte";
    import { Windows } from "./windows";
    import type { WindowPropType } from "./windows";

    // Initializing all variables
    export let width = "50vw";
    export let height = "50vh";
    export let left = "25vw";
    export let top = "10vh";
    export let icon = "./vectors/email.svg";
    export let title = "Title";
    export let windowId = "";
    export let itemPosition = 0;
    let zIndex = 0;

    let nodeRef: HTMLElement;

    let widthPx =
        (+width.replace("vw", "") * document.documentElement.clientWidth) / 100;
    let heightPx =
        (+height.replace("vh", "") * document.documentElement.clientHeight) /
        100;
    let leftPx =
        (+left.replace("vw", "") * document.documentElement.clientWidth) / 100;
    let topPx =
        (+top.replace("vh", "") * document.documentElement.clientHeight) / 100;

    let moving = false;
    let maximized = false;
    let formClass = "";
    let visible = false;
    let titleBarClass = "title-bar-focused";

    let taskbarItemState = TaskbarItemStates.unopened;
    let taskbarClass = "taskbar-item-unopened";

    const windowsStates = {
        minimized: 1,
        expanded: 2,
        maximized: 3,
    };
    let state = windowsStates.expanded;

    function onTitleMouseDown() {
        moving = true;
    }

    function onTitleMouseUp() {
        moving = false;
    }

    function onTitleMouseMove(e: MouseEvent) {
        if (moving && !maximized) {
            leftPx += e.movementX;
            topPx += e.movementY;
            leftPx = Math.max(leftPx, -widthPx * 0.95);
            leftPx = Math.min(
                leftPx,
                document.documentElement.clientWidth * 0.95
            );
            topPx = Math.max(topPx, 0);
            topPx = Math.min(
                topPx,
                document.documentElement.clientHeight * 0.95
            );
        }
    }

    function onMinimizeClick() {
        formClass = "form-minimize";
        state = windowsStates.minimized;
        taskbarItemState = TaskbarItemStates.opened;
        taskbarClass = "taskbar-item-opened";
    }

    function onMaximizeClick() {
        formClass = maximized ? "form-shrink" : "form-maximize";
        state = maximized ? windowsStates.expanded : windowsStates.maximized;
        maximized = !maximized;
    }

    function onCloseClick() {
        visible = false;
        setTimeout(() => {
            formClass = "";
            maximized = false;
        }, 100);
        // taskbarItemState = TaskbarItemStates.unopened;
        // taskbarClass = "taskbar-item-unopened";

        Windows.update((windows: WindowPropType) => {
            windows[windowId].taskbarItemState = TaskbarItemStates.unopened;
            return windows;
        });
    }

    function takeFocus() {
        Windows.update((windows: WindowPropType) => {
            let maxZ = -1;
            for (let key in windows) {
                maxZ = Math.max(maxZ, windows[key].zIndex);
                windows[key].focused = false;
                if (
                    windows[key].taskbarItemState === TaskbarItemStates.focused
                ) {
                    windows[key].taskbarItemState = TaskbarItemStates.opened;
                }
                if (zIndex < windows[key].zIndex) {
                    windows[key].zIndex--;
                }
            }
            windows[windowId].focused = true;
            windows[windowId].zIndex = maxZ;
            windows[windowId].taskbarItemState = TaskbarItemStates.focused;
            return windows;
        });
    }

    function onTaskbarItemClick() {
        switch (taskbarItemState) {
            case TaskbarItemStates.unopened: {
                taskbarItemState = TaskbarItemStates.focused;
                taskbarClass = "taskbar-item-focused";
                visible = true;
                takeFocus();
                break;
            }
            case TaskbarItemStates.opened: {
                taskbarItemState = TaskbarItemStates.focused;
                taskbarClass = "taskbar-item-focused";
                if (state == windowsStates.minimized) {
                    formClass = "";
                }
                takeFocus();
                break;
            }
            case TaskbarItemStates.focused: {
                onMinimizeClick();
                break;
            }
        }
    }

    Windows.update((windows: WindowPropType) => {
        for (let key in windows) {
            if (key == windowId) continue;
            windows[key].zIndex++;
        }
        windows[windowId] = {
            focused: true,
            zIndex: 0,
            taskbarItemState: TaskbarItemStates.unopened,
        };
        return windows;
    });

    Windows.subscribe((windows: WindowPropType) => {
        if (!windows[windowId]) return;
        titleBarClass = windows[windowId].focused
            ? "title-bar-focused"
            : "title-bar-unfocused";
        zIndex = windows[windowId].zIndex;
        taskbarItemState = windows[windowId].taskbarItemState;
        switch (taskbarItemState) {
            case TaskbarItemStates.unopened: {
                taskbarClass = "taskbar-item-unopened";
                break;
            }
            case TaskbarItemStates.opened: {
                taskbarClass = "taskbar-item-opened";
                break;
            }
            case TaskbarItemStates.focused: {
                taskbarClass = "taskbar-item-focused";
                break;
            }
        }
    });
</script>

{#if visible}
    <div
        class="form {formClass}"
        style="--top:{topPx}px; --left:{leftPx}px; --width:{widthPx}px; --height:{heightPx}px; --taskbar-index:{itemPosition}; z-index: {zIndex}"
        transition:fade={{ duration: 100 }}
        on:mousedown={takeFocus}
        bind:this={nodeRef}
    >
        <div
            class="title-bar {titleBarClass}"
            on:mousedown={onTitleMouseDown}
            on:dblclick={onMaximizeClick}
        >
            <img src={icon} alt="" draggable="false" />
            <div class="title-text-container">
                <p>{title}</p>
            </div>
            <button class="btn-minimize" on:click={onMinimizeClick} />
            <button class="btn-expand" on:click={onMaximizeClick} />
            <button class="btn-close" on:click={onCloseClick} />
        </div>
        <div class="form-body">
            <slot />
        </div>
    </div>
{/if}
<TaskbarItem
    {itemPosition}
    iconPath={icon}
    className={taskbarClass}
    on:click={onTaskbarItemClick}
/>
<svelte:window on:mousemove={onTitleMouseMove} on:mouseup={onTitleMouseUp} />

<style>
    .form {
        position: absolute;
        left: var(--left);
        top: var(--top);
        width: var(--width);
        height: var(--height);
        user-select: none;
        resize: both;
        overflow: auto;
    }

    .form-minimize {
        animation-name: formMinimize;
        animation-duration: 400ms;
        animation-fill-mode: forwards;
    }

    @keyframes formMinimize {
        0% {
            opacity: 1;
        }
        100% {
            top: calc(100vh - var(--taskbar-height));
            left: calc(var(--taskbar-height) * (var(--taskbar-index) + 1));
            width: var(--taskbar-height);
            height: var(--taskbar-height);
            visibility: hidden;
            opacity: 0;
        }
    }

    .form-maximize {
        animation-name: formMaximize;
        animation-duration: 200ms;
        animation-fill-mode: forwards;
    }

    @keyframes formMaximize {
        to {
            top: 0;
            left: 0;
            width: 100vw;
            height: calc(100vh - var(--taskbar-height));
        }
    }

    .form-shrink {
        animation-name: formShrink;
        animation-duration: 200ms;
        animation-fill-mode: forwards;
    }

    @keyframes formShrink {
        from {
            top: 0;
            left: 0;
            width: 100vw;
            height: calc(100vh - var(--taskbar-height));
        }
        to {
            left: var(--left);
            top: var(--top);
            width: var(--width);
            height: var(--height);
        }
    }

    .title-bar {
        position: absolute;
        top: 0;
        width: 100%;
        height: 3vh;
        user-select: none;
    }

    .title-bar-focused {
        background-color: var(--system-color-2);
    }

    .title-bar-unfocused {
        background-color: var(--system-color-1);
    }

    .form-body {
        position: absolute;
        top: 3vh;
        width: 100%;
        height: calc(100% - 3vh);
        background-color: var(--system-color-3);
    }

    img {
        position: absolute;
        left: 0;
        top: 0;
        width: 3vh;
        height: 3vh;
        user-select: none;
    }

    .title-text-container {
        position: absolute;
        left: 3vh;
        top: 0;
        height: 3vh;
        display: flex;
        align-items: center;
    }

    p {
        color: white;
        font-family: SegoeUISemilight;
        font-size: 1.5vh;
    }

    button {
        position: absolute;
        top: 0;
        width: 4vh;
        height: 3vh;
        background-color: transparent;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .btn-minimize {
        right: calc(4vh * 2);
        background-image: url(../vectors/minimize.svg);
    }

    .btn-minimize:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    .btn-expand {
        right: calc(4vh * 1);
        background-image: url(../vectors/expand-shrink.svg);
    }

    .btn-expand:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    .btn-close {
        right: 0;
        background-image: url(../vectors/cancel.svg);
    }

    .btn-close:hover {
        background-color: crimson;
    }
</style>
