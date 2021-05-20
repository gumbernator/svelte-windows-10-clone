<script lang="ts">
    import StartButton from "./StartButton.svelte";
    import TaskbarItem from "./TaskbarItem.svelte";

    import SystemTray from "./SystemTray.svelte";
    import LanguagePicker from "./LanguagePicker.svelte";
    import DateControl from "./DateControl.svelte";
    import NotificationCenter from "./NotificationCenter.svelte";
    import DesktopCorner from "./DesktopCorner.svelte";

    import TaskbarItems from "./taskbarItems";
    import { get } from "svelte/store";

    let taskbarItems = get(TaskbarItems);
    TaskbarItems.subscribe((data) => {
        taskbarItems = data;
    });
</script>

<div class="taskbar">
    <StartButton />
    {#each taskbarItems as taskbarItem, i}
        <TaskbarItem itemPosition={i} iconPath={taskbarItem.icon} />
    {/each}

    <SystemTray />
    <LanguagePicker />
    <DateControl />
    <NotificationCenter />
    <DesktopCorner />
</div>

<style>
    .taskbar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: var(--taskbar-height);
        background-color: hsla(360, 0%, 0%, 0.85);
        user-select: none;
        z-index: 999;
    }
</style>
