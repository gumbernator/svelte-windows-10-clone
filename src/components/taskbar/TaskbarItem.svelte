<script lang="ts">
    export let itemPosition: number;
    export let iconPath: string;

    const states = {
        unopened: 1,
        opened: 2,
        focused: 3,
    };

    let state = states.unopened;
    let className = "taskbar-item-unopened";

    function onClick() {
        switch (state) {
            case states.unopened: {
                state = states.opened;
                className = "taskbar-item-opened";
                break;
            }
            case states.opened: {
                state = states.focused;
                className = "taskbar-item-focused";
                break;
            }
            case states.focused: {
                state = states.opened;
                className = "taskbar-item-opened";
                break;
            }
        }
    }
</script>

<button
    class="taskbar-item {className}"
    on:click={onClick}
    style="--item-position: {itemPosition};"
>
    <img src={iconPath} alt="" class="taskbar-icon" />
    <div />
</button>

<style>
    button {
        margin: 0px;
        padding: 0px;
        background: none;
        border: none;
    }

    .taskbar-icon {
        width: 100%;
        height: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .taskbar-item {
        position: absolute;
        top: 0;
        left: calc(
            var(--item-position) * var(--taskbar-height) + var(--taskbar-height) +
                0.5vh + (var(--item-position) + 1) * 1px
        );
        bottom: 0;
        width: var(--taskbar-height);
        user-select: none;
        transition-property: background-color;
        z-index: 999;
    }

    .taskbar-item-unopened {
        background-color: transparent;
        transition: 100ms;
    }

    .taskbar-item-unopened > div {
        background: transparent;
    }

    .taskbar-item-unopened:hover {
        background-color: hsla(0, 0%, 80%, 0.1);
    }

    .taskbar-item-opened {
        background-color: transparent;
        transition: 100ms;
    }

    .taskbar-item-opened > div {
        position: absolute;
        bottom: 0;
        left: 7%;
        right: 7%;
        width: auto;
        height: 0.2vh;
        min-height: 3px;
        background-color: var(--system-color-2);
        transition: 100ms;
    }

    .taskbar-item-opened:hover {
        background-color: hsla(0, 0%, 80%, 0.1);
    }

    .taskbar-item-opened:hover > div {
        left: 0;
        right: 0;
    }

    .taskbar-item-focused {
        background-color: hsla(0, 0%, 80%, 0.2);
        transition: 100ms;
    }

    .taskbar-item-focused > div {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: auto;
        height: 0.2vh;
        min-height: 3px;
        background-color: var(--system-color-2);
    }

    .taskbar-item-focused:hover {
        background-color: hsla(0, 0%, 80%, 0.3);
    }
</style>
