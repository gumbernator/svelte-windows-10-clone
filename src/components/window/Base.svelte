<script lang="ts">
    export let width = "50vw";
    export let height = "50vh";
    export let left = "25vw";
    export let top = "10vh";

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

    function onTitleMouseDown() {
        moving = true;
    }

    function onTitleMouseUp() {
        moving = false;
    }

    function onTitleMouseMove(e: MouseEvent) {
        if (moving) {
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
</script>

<div
    class="form"
    style="top:{topPx}px; left:{leftPx}px; width:{widthPx}px; height:{heightPx}px"
>
    <div class="title-bar" on:mousedown={onTitleMouseDown} />
    <div class="form-body" />
</div>
<svelte:window on:mousemove={onTitleMouseMove} on:mouseup={onTitleMouseUp} />

<style>
    .form {
        position: absolute;
        user-select: none;
        resize: both;
        overflow: auto;
    }

    .title-bar {
        position: absolute;
        top: 0;
        width: 100%;
        height: 3vh;
        background-color: var(--system-color-2);
    }

    .form-body {
        position: absolute;
        top: 3vh;
        width: 100%;
        height: calc(100% - 3vh);
        background-color: var(--system-color-3);
    }
</style>
