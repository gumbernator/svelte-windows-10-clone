import { writable } from "svelte/store";

export const TaskbarItemStates = {
    unopened: 1,
    opened: 2,
    focused: 3,
};
export const TaskbarItems = writable([]);
