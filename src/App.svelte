<script lang="ts">
    import Taskbar from "./components/taskbar/Taskbar.svelte";
    import Window from "./components/window/Window.svelte";

    import { Windows } from "./components/window/windows";
    import type { WindowPropType } from "./components/window/windows";
    import { TaskbarItemStates } from "./components/window/taskbarItems";
    import ChosenPanel from "./components/taskbar/chosenPanel";

    import Calculator from "./components/window/forms/Calculator.svelte";
    import Minesweeper from "./components/window/forms/Minesweeper.svelte";

    import lazyLoad from "./components/lazyLoad";

    import Language from "./languages/chosen";
    import { get } from "svelte/store";
    import Mail from "./components/window/forms/Mail.svelte";
    import Paint from "./components/window/forms/Paint.svelte";
    import Icon from "./components/Icon.svelte";
    import Aboutme from "./components/window/forms/Aboutme.svelte";
    let language = get(Language);

    Language.subscribe((data) => {
        language = data;
    });

    let onBackgroundClick = () => {
        Windows.update((windows: WindowPropType) => {
            for (let key in windows) {
                windows[key].focused = false;
                if (
                    windows[key].taskbarItemState == TaskbarItemStates.focused
                ) {
                    windows[key].taskbarItemState = TaskbarItemStates.opened;
                }
            }
            return windows;
        });
        ChosenPanel.update((data) => {
            data.name = "";
            return data;
        });
    };
</script>

<main draggable="false" on:dragstart|preventDefault>
    <div class="background" on:click={onBackgroundClick}>
        <img
            use:lazyLoad={"./images/windows11wallpaper.png"}
            alt=""
            draggable="false"
        />
    </div>

    <Icon
        top="0"
        left="0"
        imgPath="../images/github-icon.png"
        text="Github"
        on:dblclick={() => {
            window.open("https://github.com/gumbernator", "_blank");
        }}
    />
    <Icon
        top="5rem"
        left="0"
        imgPath="../vectors/email-send.svg"
        text="Mail me"
        on:dblclick={() => {
            window.location.href = "mailto:guyugmonkh@hotmail.com";
        }}
    />
    <Icon
        top="10rem"
        left="0"
        imgPath="../images/linkedin-icon.png"
        text="Linkedin"
        on:dblclick={() => {
            window.open(
                "https://mn.linkedin.com/in/guyugmonkh-lkhagvachuluun-022833182",
                "_blank"
            );
        }}
    />

    <Taskbar />

    <Window
        windowId="_mail"
        left="10vw"
        top="20vh"
        width="60vw"
        minWidth="50vw"
        height="65vh"
        minHeight="40vh"
        icon="./vectors/email.svg"
        title={language.text.mailTitle}
        itemPosition={0}
    >
        <Mail />
    </Window>
    <Window
        windowId="_paint"
        left="20vw"
        top="10vh"
        width="60vw"
        height="70vh"
        minWidth="30vw"
        minHeight="20vh"
        icon="./vectors/microsoft-paint.svg"
        title={language.text.paintTitle}
        itemPosition={1}
    >
        <Paint />
    </Window>
    <Window
        windowId="_calculator"
        left="25vw"
        top="15vh"
        width="20vw"
        height="60vh"
        minWidth="15vw"
        minHeight="40vh"
        icon="./vectors/calculator.svg"
        title={language.text.calculatorTitle}
        itemPosition={2}
    >
        <Calculator />
    </Window>
    <Window
        windowId="_minesweeper"
        left="40vw"
        top="10vh"
        width="40vw"
        height="60vh"
        minWidth="40vw"
        minHeight="60vh"
        icon="./vectors/bomb.svg"
        title={language.text.minesweeperTitle}
        itemPosition={3}
    >
        <Minesweeper />
    </Window>

    <Window
        windowId="_profile"
        left="7vw"
        top="10vh"
        width="55vw"
        height="60vh"
        minWidth="40vw"
        minHeight="30vh"
        icon="./vectors/profile.svg"
        title={language.text.profileTitle}
        itemPosition={4}
        firstOpen={true}
    >
        <Aboutme />
    </Window>
</main>

<style>
    .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img {
        height: 100%;
        width: 100%;
        object-fit: cover;
        user-select: none;
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

    @media screen and (max-width: 4000px) {
        :global(html) {
            font-size: 26px;
        }
    }

    @media screen and (max-width: 3500px) {
        :global(html) {
            font-size: 22px;
        }
    }

    @media screen and (max-width: 2600px) {
        :global(html) {
            font-size: 18px;
        }
    }

    @media screen and (max-width: 2000px) {
        :global(html) {
            font-size: 16px;
        }
    }

    @media screen and (max-width: 1200px) {
        :global(html) {
            font-size: 15px;
        }
    }

    @media screen and (max-width: 900px) {
        :global(html) {
            font-size: 14px;
        }
    }
</style>
