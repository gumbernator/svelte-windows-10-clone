<script lang="ts">
    export let width = "50vw";
    export let height = "50vh";
    export let left = "25vw";
    export let top = "10vh";
    export let icon = "./vectors/email.svg";
    export let title = "Title";
    export let taskbarIndex = 0;

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
    }

    function onMaximizeClick() {
        formClass = maximized ? "form-shrink" : "form-maximize";
        maximized = !maximized;
    }

    function onCloseClick() {
        if (nodeRef.parentNode != null) {
            nodeRef.parentNode.removeChild(nodeRef);
        }
    }
</script>

<div
    class="form {formClass}"
    style="--top:{topPx}px; --left:{leftPx}px; --width:{widthPx}px; --height:{heightPx}px; --taskbar-index:{taskbarIndex +
        1};"
    on:dblclick={onMaximizeClick}
    bind:this={nodeRef}
>
    <div class="title-bar" on:mousedown={onTitleMouseDown}>
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
            left: calc(var(--taskbar-height) * var(--taskbar-index));
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
        background-color: var(--system-color-2);
        user-select: none;
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
