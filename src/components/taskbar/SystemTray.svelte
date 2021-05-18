<script lang="ts">
    import ChosenPanel from "./chosenPanel";
    import SystemTrayPanel from "./panels/SystemTrayPanel.svelte";

    function onClick() {
        ChosenPanel.update((data) => {
            data.name = data.name === "systemtray" ? "" : "systemtray";
            return data;
        });
    }
</script>

<button on:click={onClick} />
<SystemTrayPanel />

<style>
    button {
        position: absolute;
        right: calc(
            15px + max(30px, 4vh) + max(6.5vh, 45px) + max(25px, 3.5vh)
        );
        width: 2.5vh;
        min-width: 20px;
        background-image: url(../vectors/chevron-up.svg);
        background-size: 60%;
        background-repeat: no-repeat;
        background-color: transparent;
        background-position: center;
        border: none;
        height: 100%;
        z-index: 999;
    }

    button:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }
</style>
