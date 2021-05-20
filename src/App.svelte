<script lang="ts">
    import Taskbar from "./components/taskbar/Taskbar.svelte";
    import Window from "./components/window/Base.svelte";
</script>

<main>
    <div class="background" />

    <Taskbar />
    <Window />
</main>

<style>
    div {
        width: 100vw;
        height: 100vh;
        background-repeat: no-repeat;
    }
    .background {
        background-image: url(../vectors/Flat-Mountains.svg);
        background-color: #588dde;
        background-size: 100%;
        background-position: center;
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
