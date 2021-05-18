<script lang="ts">
    import ChosenPanel from "./chosenPanel";

    function onClick() {
        ChosenPanel.update((data) => {
            data.name = "";
            return data;
        });
    }
</script>

<button on:click={onClick} />

<style>
    button {
        position: absolute;
        right: 0;
        height: 100%;
        width: 0.3vw;
        min-width: 4px;
        margin: 0;
        padding: 0;
        background: none;
        border: none;
        border-left: solid 1px var(--system-color-2);
        z-index: 999;
    }

    button:hover {
        background-color: hsla(0, 0%, 80%, 0.2);
    }
</style>
