import { writable } from "svelte/store";

export type WindowPropType = {
    [key: string]: {
        focused: boolean;
        zIndex: number;
        taskbarItemState: number;
    };
};
export const Windows = writable({});
