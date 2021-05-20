<script lang="ts">
    import ChosenPanel from "../chosenPanel";
    import ChosenLanguage from "../../languages/chosen";
    import { get } from "svelte/store";

    let className = "";
    let previouslyOpened = false;
    ChosenPanel.subscribe((data) => {
        if (data.name === "notification") {
            className = "panel-open";
            previouslyOpened = true;
            return;
        }
        className = previouslyOpened ? "panel-close" : "";
    });

    let language = get(ChosenLanguage);

    ChosenLanguage.subscribe((data) => {
        language = data;
    });
</script>

<div class="notification-panel {className}" style="visibility: hidden;">
    <div class="no-noti-message">
        {language.text.notificationPanel.noNewNotification}
    </div>
    <button class="location">
        <div class="location-icon" />
        <div class="card-text">{language.text.notificationPanel.location}</div>
    </button>
    <button class="night-light">
        <div class="night-light-icon" />
        <div class="card-text">
            {language.text.notificationPanel.nightLight}
        </div>
    </button>
    <button class="screen-snip">
        <div class="screen-snip-icon" />
        <div class="card-text">
            {language.text.notificationPanel.screenSnip}
        </div>
    </button>
    <button class="network">
        <div class="network-icon" />
        <div class="card-text">{language.text.notificationPanel.network}</div>
    </button>
</div>

<style>
    .notification-panel {
        position: absolute;
        bottom: var(--taskbar-height);
        width: 20vw;
        height: calc(100vh - var(--taskbar-height));
        border-left: 1px var(--system-color-2) solid;
        background-color: rgba(30, 30, 30, 0.95);
        animation-duration: 500ms;
        animation-timing-function: cubic-bezier(0.04, 0.45, 0, 0.98);
        animation-fill-mode: forwards;
        user-select: none;
        z-index: 999;
    }

    .panel-close {
        animation-name: notificationClose;
    }

    @keyframes notificationClose {
        from {
            left: 80vw;
            visibility: visible;
        }
        to {
            left: 100vw;
            visibility: hidden;
        }
    }

    .panel-open {
        animation-name: notificationOpen;
    }

    @keyframes notificationOpen {
        from {
            left: 100vw;
            visibility: hidden;
        }
        to {
            left: 80vw;
            visibility: visible;
        }
    }

    .no-noti-message {
        position: absolute;
        top: 50%;
        width: 100%;
        text-align: center;
        color: var(--system-color-4);
        font-size: calc(0.55vw + 0.55vh);
        font-family: SegoeUIBold;
    }

    .location {
        position: absolute;
        left: 4.5%;
        bottom: 0.5%;
        width: 22%;
        height: 7%;
        background: rgba(150, 150, 150, 0.4);
        box-sizing: border-box;
        border: transparent solid 1px;
    }

    .location:hover {
        background: rgba(150, 150, 150, 0.6);
        border-color: whitesmoke;
    }

    .location-icon {
        position: absolute;
        left: 0px;
        top: 10%;
        width: 25%;
        height: 25%;
        background-image: url(../vectors/marker.svg);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .night-light {
        position: absolute;
        left: 27.5%;
        bottom: 0.5%;
        width: 22%;
        height: 7%;
        background: rgba(150, 150, 150, 0.4);
        box-sizing: border-box;
        border: transparent solid 1px;
    }

    .night-light:hover {
        background: rgba(150, 150, 150, 0.6);
        border-color: whitesmoke;
    }

    .night-light-icon {
        position: absolute;
        left: 0px;
        top: 10%;
        width: 25%;
        height: 25%;
        background-image: url(../vectors/dark-light.svg);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .screen-snip {
        position: absolute;
        left: 50.5%;
        bottom: 0.5%;
        width: 22%;
        height: 7%;
        background: rgba(150, 150, 150, 0.4);
        box-sizing: border-box;
        border: transparent solid 1px;
    }

    .screen-snip:hover {
        background: rgba(150, 150, 150, 0.6);
        border-color: whitesmoke;
    }

    .screen-snip-icon {
        position: absolute;
        left: 0px;
        top: 10%;
        width: 25%;
        height: 25%;
        background-image: url(../vectors/settings.svg);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .network {
        position: absolute;
        left: 73.5%;
        bottom: 0.5%;
        width: 22%;
        height: 7%;
        background: rgba(150, 150, 150, 0.4);
        box-sizing: border-box;
        border: transparent solid 1px;
    }

    .network:hover {
        background: rgba(150, 150, 150, 0.6);
        border-color: whitesmoke;
    }

    .network-icon {
        position: absolute;
        left: 0px;
        top: 10%;
        width: 25%;
        height: 25%;
        background-image: url(../vectors/wifi.svg);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .card-text {
        position: absolute;
        left: 5%;
        bottom: 5%;
        color: white;
        font-size: calc(0.45vw + 0.45vh);
        font-family: SegoeUI;
    }
</style>
