<script lang="ts">
    import ChosenPanel from "../chosenPanel";

    let className = "";
    let previouslyOpened = false;
    ChosenPanel.subscribe((data) => {
        if (data.name === "start") {
            className = "panel-open";
            previouslyOpened = true;
            return;
        }
        className = previouslyOpened ? "panel-close" : "";
    });
</script>

<div class="panel {className}" style="visibility:hidden;">
    <button class="btn-power" />
    <button class="btn-settings" />
    <button class="btn-profile" />
    <div class="shortcuts" />
</div>

<style>
    .panel {
        position: absolute;
        left: 0px;
        bottom: var(--taskbar-height);
        width: 20vw;
        height: 60vh;
        background-color: rgba(30, 30, 30, 0.95);
        animation-duration: 200ms;
        animation-fill-mode: forwards;
        user-select: none;
        z-index: 998;
    }

    .panel-close {
        animation-name: startClose;
    }

    @keyframes startClose {
        0% {
            bottom: var(--taskbar-height);
            visibility: visible;
            opacity: 1;
        }
        50% {
            bottom: calc(-10vh - var(--taskbar-height));
            visibility: hidden;
            opacity: 0;
        }
    }

    .panel-open {
        animation-name: startOpen;
        animation-timing-function: ease-out;
    }

    @keyframes startOpen {
        from {
            bottom: -10vh;
            visibility: hidden;
            opacity: 0;
        }
        to {
            bottom: var(--taskbar-height);
            visibility: visible;
            opacity: 1;
        }
    }

    button {
        position: absolute;
        left: 0;
        width: calc(var(--taskbar-height) + 0.5vh);
        height: calc(var(--taskbar-height) + 0.5vh);
        background-color: transparent;
        background-repeat: no-repeat;
        background-position: center;
    }

    button:hover {
        background-color: rgba(55, 55, 55, 0.95);
    }

    .btn-power {
        bottom: 0;
        background-image: url(../vectors/power-button.svg);
        background-size: 40%;
    }

    .btn-settings {
        bottom: calc(var(--taskbar-height) + 0.5vh);
        background-image: url(../vectors/settings.svg);
        background-size: 40%;
    }

    .btn-profile {
        bottom: calc(2 * (var(--taskbar-height) + 0.5vh));
        background-color: rgba(30, 30, 30, 0.95);
        background-size: 40%;
    }
</style>
