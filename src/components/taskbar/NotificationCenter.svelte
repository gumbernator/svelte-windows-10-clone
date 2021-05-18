<script lang="ts">
    import ChosenPanel from "./chosenPanel";
    import NotificationPanel from "./panels/NotificationPanel.svelte";

    function onClick() {
        ChosenPanel.update((data) => {
            data.name = data.name === "notification" ? "" : "notification";
            return data;
        });
    }
</script>

<button on:click={onClick} />
<NotificationPanel />

<style>
    button {
        position: absolute;
        right: 12px;
        height: 100%;
        width: 4vh;
        min-width: 35px;
        background: none;
        border: none;
        background-image: url(../vectors/notification-empty.svg);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: 100ms;
        transition-property: background-color;
        z-index: 999;
    }

    button:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }
</style>
