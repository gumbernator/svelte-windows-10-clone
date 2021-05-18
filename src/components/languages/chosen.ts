import { writable } from "svelte/store";
import eng from "./eng";

const Language = writable({
    language: "en",
    text: eng,
});

export default Language;
