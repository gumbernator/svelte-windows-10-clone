<script lang="ts">
    import ChosenPanel from "../chosenPanel";
    import Language from "../../../languages/chosen";
    import eng from "../../../languages/eng";
    import mon from "../../../languages/mon";

    let className = "";
    let previouslyOpened = false;
    ChosenPanel.subscribe((data) => {
        if (data.name === "language") {
            className = "panel-open";
            previouslyOpened = true;
            return;
        }
        className = previouslyOpened ? "panel-close" : "";
    });

    let engClass = "language-picker-not-chosen";
    let monClass = "language-picker-not-chosen";

    let lang = "en";
    Language.subscribe((data) => {
        lang = data.language;
        switch (lang) {
            case "en": {
                engClass = "language-picker-chosen";
                monClass = "language-picker-not-chosen";
                break;
            }
            case "mn": {
                engClass = "language-picker-not-chosen";
                monClass = "language-picker-chosen";
                break;
            }
        }
    });

    function onClickEng() {
        Language.update((data) => {
            data.language = "en";
            data.text = eng;
            return data;
        });
        close();
    }

    function onClickMon() {
        Language.update((data) => {
            data.language = "mn";
            data.text = mon;
            return data;
        });
        close();
    }

    function close() {
        ChosenPanel.update((data) => {
            data.name = "close";
            return data;
        });
        className = "panel-close";
    }
</script>

<div class="language-picker-panel {className}" style="visibility: hidden;">
    <button class="language-picker-option-EN {engClass}" on:click={onClickEng}>
        <div class="language-picker-option-left">ENG</div>
        <div class="language-picker-option-right">
            English (United States)<br />US Keyboard
        </div>
    </button>
    <button class="language-picker-option-MN {monClass}" on:click={onClickMon}>
        <div class="language-picker-option-left">МОН</div>
        <div class="language-picker-option-right">
            Mongolian<br />Buuz (Mongolian)
        </div>
    </button>
</div>

<style>
    .language-picker-panel {
        position: absolute;
        right: 0px;
        bottom: var(--taskbar-height);
        width: 15vw;
        height: 15vh;
        border-left: 1px var(--system-color-2) solid;
        border-top: 1px var(--system-color-2) solid;
        background-color: rgba(0, 0, 0, 0.7);
        animation-duration: 200ms;
        animation-fill-mode: forwards;
        overflow: hidden;
        z-index: 998;
    }

    .panel-open {
        animation-name: languagePickerOpen;
        animation-timing-function: ease-out;
    }

    @keyframes languagePickerOpen {
        from {
            bottom: 0px;
            opacity: 0;
            visibility: hidden;
        }
        to {
            bottom: var(--taskbar-height);
            opacity: 1;
            visibility: visible;
        }
    }

    .panel-close {
        animation-name: languagePickerClose;
    }

    @keyframes languagePickerClose {
        from {
            bottom: var(--taskbar-height);
            opacity: 1;
            visibility: visible;
        }
        to {
            bottom: 0px;
            opacity: 0;
            visibility: hidden;
        }
    }

    .language-picker-option-EN {
        position: absolute;
        top: 3%;
        width: 100%;
        height: 47%;
        display: flex;
        background: transparent;
    }

    .language-picker-option-MN {
        position: absolute;
        bottom: 3%;
        width: 100%;
        height: 47%;
        display: flex;
        background: transparent;
    }

    .language-picker-option-left {
        left: 0px;
        top: 0px;
        width: 20%;
        height: 60%;
        margin-left: 5%;
        display: flex;
        align-items: center;
        color: white;
        font-size: calc(0.6vw + 0.6vh);
        font-family: SegoeUI;
    }

    .language-picker-option-right {
        left: 20%;
        top: 0px;
        width: 80%;
        height: 100%;
        margin-left: 5%;
        display: flex;
        align-items: center;
        color: white;
        font-size: calc(0.6vw + 0.5vh);
        font-family: SegoeUILight;
    }

    .language-picker-chosen {
        background-color: var(--system-color-2);
    }

    .language-picker-not-chosen:hover {
        background-color: rgba(100, 100, 100, 0.5);
    }
</style>
