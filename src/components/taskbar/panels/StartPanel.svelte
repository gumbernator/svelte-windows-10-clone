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

    function onProgramClick(windowId: string) {
        if (document.getElementById(windowId) != null) {
            document.getElementById(windowId)!.click();

            ChosenPanel.update((data) => {
                data.name = "";
                return data;
            });
        }
    }
</script>

<div class="panel {className}" style="visibility:hidden;">
    <button class="btn-power" />
    <button class="btn-settings" />
    <button class="btn-profile" />
    <div class="shortcuts">
        <p>C</p>
        <button
            on:click={() => {
                onProgramClick("_calculator");
            }}
        >
            <img src="./vectors/calculator.svg" alt="calculator" />
            <p>Calculator</p>
        </button>
        <p>M</p>
        <button
            on:click={() => {
                onProgramClick("_mail");
            }}
        >
            <img src="./vectors/email.svg" alt="email" />
            <p>Mail</p>
        </button>
        <button
            on:click={() => {
                onProgramClick("_minesweeper");
            }}
        >
            <img src="./vectors/bomb.svg" alt="minesweeper" />
            <p>Minesweeper</p>
        </button>
        <p>P</p>
        <button
            on:click={() => {
                onProgramClick("_paint");
            }}
        >
            <img src="./vectors/microsoft-paint.svg" alt="paint" />
            <p>Paint</p>
        </button>
    </div>
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
        background-image: url(../images/diamond.png);
        background-position: center;
        background-repeat: no-repeat;
        background-size: 70%;
        bottom: calc(2 * (var(--taskbar-height) + 0.5vh));
    }

    .shortcuts {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
    }

    .shortcuts p {
        color: white;
        font-family: SegoeUILight;
        font-size: 1rem;
    }

    .shortcuts > p {
        position: relative;
        left: calc(var(--taskbar-height));
        margin-left: 1rem;
    }

    .shortcuts > button {
        position: relative;
        left: calc(var(--taskbar-height) + 0.5vh);
        width: calc(100% - var(--taskbar-height) - 0.5vh);
        display: flex;
        align-items: center;
    }

    .shortcuts > button > img {
        height: 90%;
    }
</style>
