<script lang="ts">
    import { fade } from "svelte/transition";
    import { TaskbarItemStates } from "./taskbarItems";
    import TaskbarItem from "./TaskbarItem.svelte";
    import { Windows } from "./windows";
    import type { WindowPropType } from "./windows";

    // Initializing all variables
    export let width = "50vw";
    export let height = "50vh";
    export let minWidth = "10vw";
    export let minHeight = "15vh";
    export let left = "25vw";
    export let top = "10vh";
    export let icon = "./vectors/email.svg";
    export let title = "Title";
    export let windowId = "";
    export let itemPosition = 0;
    export let firstOpen = false;
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
    let minWidthPx =
        (+minWidth.replace("vw", "") * document.documentElement.clientWidth) /
        100;
    let minHeightPx =
        (+minHeight.replace("vh", "") * document.documentElement.clientHeight) /
        100;
    let pLeftPx = leftPx;
    let pTopPx = topPx;
    let pWidthPx = widthPx;
    let pHeightPx = heightPx;

    let moving = false;
    let maximized = false;
    let formClass = "";
    let formTransition = "none";
    let visible = false;
    let titleBarClass = "title-bar-focused";
    let borderVisibility = "visible";

    let taskbarItemState = TaskbarItemStates.unopened;
    let taskbarClass = "taskbar-item-unopened";

    const windowsStates = {
        minimized: 1,
        expanded: 2,
        maximized: 3,
    };
    let state = windowsStates.expanded;

    const pressPlaces = {
        none: 0,
        title: 1,
        top: 2,
        left: 3,
        bottom: 4,
        right: 5,
    };
    let pressedPlace = pressPlaces.none;

    function onTitleMouseDown() {
        pressedPlace = pressPlaces.title;
        moving = true;
    }

    function onTopBorderDown() {
        pressedPlace = pressPlaces.top;
        takeFocus();
    }
    function onLeftBorderDown() {
        pressedPlace = pressPlaces.left;
        takeFocus();
    }
    function onBottomBorderDown() {
        pressedPlace = pressPlaces.bottom;
        takeFocus();
    }
    function onRightBorderDown() {
        pressedPlace = pressPlaces.right;
        takeFocus();
    }

    function onMouseUp() {
        pressedPlace = pressPlaces.none;
        moving = false;
    }

    function onMouseMove(e: MouseEvent) {
        if (pressedPlace == pressPlaces.none) {
            return;
        } else if (pressedPlace == pressPlaces.title && moving && !maximized) {
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
        } else if (pressedPlace == pressPlaces.top) {
            heightPx -= e.movementY;
            heightPx = Math.max(minHeightPx, heightPx);
            topPx += heightPx == minHeightPx ? 0 : e.movementY;
        } else if (pressedPlace == pressPlaces.left) {
            widthPx -= e.movementX;
            widthPx = Math.max(minWidthPx, widthPx);
            leftPx += widthPx == minWidthPx ? 0 : e.movementX;
        } else if (pressedPlace == pressPlaces.bottom) {
            heightPx += e.movementY;
            heightPx = Math.max(minHeightPx, heightPx);
        } else if (pressedPlace == pressPlaces.right) {
            widthPx += e.movementX;
            widthPx = Math.max(minWidthPx, widthPx);
        }
    }

    function onMinimizeClick() {
        formClass = "form-minimize";
        state = windowsStates.minimized;
        taskbarItemState = TaskbarItemStates.opened;
        taskbarClass = "taskbar-item-opened";
        borderVisibility = "hidden";
    }

    function onMaximizeClick() {
        formTransition = "100ms";
        setTimeout(() => {
            formTransition = "none";
        }, 100);
        state = maximized ? windowsStates.expanded : windowsStates.maximized;
        if (maximized) {
            setTimeout(() => {
                takeFocus();
            }, 100);

            leftPx = pLeftPx;
            topPx = pTopPx;
            widthPx = pWidthPx;
            heightPx = pHeightPx;

            state = windowsStates.expanded;
        } else {
            pLeftPx = leftPx;
            pTopPx = topPx;
            pWidthPx = widthPx;
            pHeightPx = heightPx;

            leftPx = 0;
            topPx = 0;
            widthPx = document.documentElement.clientWidth;
            heightPx =
                document.documentElement.clientHeight -
                Math.max(0.04 * document.documentElement.clientHeight, 30);

            state = windowsStates.maximized;
        }
        maximized = !maximized;
    }

    function onCloseClick() {
        visible = false;
        setTimeout(() => {
            formClass = "";
            maximized = false;
        }, 100);

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
                borderVisibility = "visible";
                takeFocus();
                break;
            }
            case TaskbarItemStates.opened: {
                taskbarItemState = TaskbarItemStates.focused;
                taskbarClass = "taskbar-item-focused";
                if (state == windowsStates.minimized) {
                    formClass = "";
                }
                borderVisibility = "visible";
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

    if (firstOpen) {
        onTaskbarItemClick();
    }
</script>

{#if visible}
    <div
        class="form {formClass}"
        style="--top:{topPx}px; --left:{leftPx}px; --width:{widthPx}px; --height:{heightPx}px; --taskbar-index: {itemPosition}; z-index: {zIndex}; transition: {formTransition};"
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
    <div
        class="top-border"
        style="--top:{topPx}px; --left:{leftPx}px; --width:{widthPx}px; --height:{heightPx}px; z-index: {zIndex}; visibility: {borderVisibility};"
        on:mousedown={onTopBorderDown}
    />
    <div
        class="left-border"
        style="--top:{topPx}px; --left:{leftPx}px; --width:{widthPx}px; --height:{heightPx}px; z-index: {zIndex}; visibility: {borderVisibility};"
        on:mousedown={onLeftBorderDown}
    />
    <div
        class="bottom-border"
        style="--top:{topPx}px; --left:{leftPx}px; --width:{widthPx}px; --height:{heightPx}px; z-index: {zIndex}; visibility: {borderVisibility};"
        on:mousedown={onBottomBorderDown}
    />
    <div
        class="right-border"
        style="--top:{topPx}px; --left:{leftPx}px; --width:{widthPx}px; --height:{heightPx}px; z-index: {zIndex}; visibility: {borderVisibility};"
        on:mousedown={onRightBorderDown}
    />
{/if}
<TaskbarItem
    id={windowId}
    {itemPosition}
    iconPath={icon}
    className={taskbarClass}
    on:click={onTaskbarItemClick}
/>
<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} />

<style>
    .form {
        position: absolute;
        left: var(--left);
        top: var(--top);
        width: var(--width);
        height: var(--height);
        background: transparent;
        border: 1px solid var(--system-color-2);
        border-radius: 0.5rem;
        overflow: hidden;
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
        50% {
            width: var(--taskbar-height);
            height: var(--taskbar-height);
        }
        100% {
            top: calc(100vh - var(--taskbar-height));
            left: calc(
                var(--taskbar-index) * (var(--taskbar-height) + 0.5vh) +
                    var(--taskbar-height) + 0.5vh + (var(--taskbar-index) + 1) *
                    1px
            );
            width: var(--taskbar-height);
            height: var(--taskbar-height);
            visibility: hidden;
            opacity: 0;
        }
    }

    .title-bar {
        position: absolute;
        top: 0;
        width: 100%;
        height: 3vh;
        user-select: none;
        backdrop-filter: blur(2px);
    }

    .title-bar-focused {
        background: rgba(117, 117, 117, 0.9);
    }

    .title-bar-unfocused {
        background: rgba(43, 43, 43, 0.9);
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

    .top-border {
        position: absolute;
        left: var(--left);
        top: var(--top);
        width: var(--width);
        height: 0.25rem;
        cursor: n-resize;
    }

    .left-border {
        position: absolute;
        left: var(--left);
        top: var(--top);
        height: var(--height);
        width: 0.25rem;
        cursor: w-resize;
    }

    .bottom-border {
        position: absolute;
        left: var(--left);
        top: calc(var(--top) + var(--height));
        width: calc(var(--width) + 0.25rem);
        height: 0.25rem;
        cursor: s-resize;
    }

    .right-border {
        position: absolute;
        left: calc(var(--left) + var(--width));
        top: var(--top);
        height: var(--height);
        width: 0.25rem;
        cursor: e-resize;
    }
</style>
