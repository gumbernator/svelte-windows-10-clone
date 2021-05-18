<script lang="ts">
    import ChosenPanel from "./chosenPanel";
    import LanguagePickerPanel from "./panels/LanguagePickerPanel.svelte";
    import ChosenLanguage from "../languages/chosen";

    let languageAbbr = "";

    ChosenLanguage.subscribe((data) => {
        switch (data.language) {
            case "en": {
                languageAbbr = "ENG";
                break;
            }
            case "mn": {
                languageAbbr = "МОН";
                break;
            }
        }
    });

    function onClick() {
        ChosenPanel.update((data) => {
            data.name = data.name === "language" ? "" : "language";
            return data;
        });
    }
</script>

<button on:click={onClick}>
    <p>{languageAbbr}</p>
</button>
<LanguagePickerPanel />

<style>
    button {
        position: absolute;
        right: calc(14px + max(30px, 4vh) + max(6.5vh, 45px));
        height: 100%;
        width: 3.5vh;
        min-width: 25px;
        background: none;
        border: none;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        z-index: 999;
    }

    button:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    button > p {
        padding-bottom: 0.2vh;
        font-size: calc(0.4vw + 0.5vh);
        font-family: SegoeUI;
    }
</style>
