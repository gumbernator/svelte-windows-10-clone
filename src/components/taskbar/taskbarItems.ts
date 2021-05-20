import { writable } from "svelte/store";

const TaskbarItems = writable([
    {
        windowId: "file-explorer",
        pinned: true,
        icon: "./vectors/icons8-folder.svg",
    },
    {
        windowId: "edge-browser",
        pinned: true,
        icon: "./vectors/icons8-microsoft-edge.svg",
    },
]);

export default TaskbarItems;
