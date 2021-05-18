import { writable } from "svelte/store";

const ChosenPanel = writable({
    name: "",
});

export default ChosenPanel;
