<script>
    import Language from "../../../languages/chosen";
    import { get } from "svelte/store";
    let language = get(Language);

    Language.subscribe((data) => {
        language = data;
    });

    let topPresets = [
        "#000000",
        "#7F7F7F",
        "#880015",
        "#ED1C24",
        "#FF7F27",
        "#FFF200",
        "#22B14C",
        "#00A2E8",
        "#3F48CC",
        "#A349A4",
    ];
    let bottomPresets = [
        "#FFFFFF",
        "#C3C3C3",
        "#B97A57",
        "#FFAEC9",
        "#FFC90E",
        "#EFE4B0",
        "#B5E61D",
        "#99D9EA",
        "#7092BE",
        "#C8BFE7",
    ];

    let color = "#000";
    let mouseDown = false;
    let prevX, prevY, currX, currY;
    let burshSize = 1;
    let ctx = null;
    let cnv = null;
    function onmousemove(e) {
        if (mouseDown) {
            const boundRect = cnv.getBoundingClientRect();
            prevX = currX;
            prevY = currY;
            currX = e.clientX - boundRect.left;
            currY = e.clientY - boundRect.top;
            line(prevX, prevY, currX, currY, burshSize, color);
        }
    }

    function onmousedown(e) {
        mouseDown = true;
        if (!cnv) {
            cnv = document.getElementById("_canvas");
        }
        const boundRect = cnv.getBoundingClientRect();
        prevX = e.clientX - boundRect.left;
        prevY = e.clientY - boundRect.top;
        currX = prevX;
        currY = prevY;
    }

    function onmouseup() {
        mouseDown = false;
    }

    function line(px, py, x, y, w, c) {
        if (!ctx || !cnv) {
            cnv = document.getElementById("_canvas");
            ctx = cnv.getContext("2d");
        }
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.stroke();
        ctx.closePath();
    }

    function onclear() {
        if (!ctx || !cnv) {
            cnv = document.getElementById("_canvas");
            ctx = cnv.getContext("2d");
        }
        ctx.clearRect(0, 0, cnv.width, cnv.height);
    }

    function onsave() {
        if (!ctx || !cnv) {
            cnv = document.getElementById("_canvas");
            ctx = cnv.getContext("2d");
        }
        download(cnv, "paintimage.png");
    }

    function download(canvas, filename) {
        /// create an "off-screen" anchor tag
        let lnk = document.createElement("a"),
            e;

        /// the key here is to set the download attribute of the a tag
        lnk.download = filename;

        /// convert canvas content to data-uri for link. When download
        /// attribute is set the content pointed to by link will be
        /// pushed as "download" in HTML5 capable browsers
        lnk.href = canvas.toDataURL("image/png");

        /// create a "fake" click-event to trigger the download
        if (document.createEvent) {
            e = document.createEvent("MouseEvents");
            e.initMouseEvent(
                "click",
                true,
                true,
                window,
                0,
                0,
                0,
                0,
                0,
                false,
                false,
                false,
                false,
                0,
                null
            );

            lnk.dispatchEvent(e);
        } else if (lnk.fireEvent) {
            lnk.fireEvent("onclick");
        }
    }

    let root = document.querySelector(":root"),
        style = window
            .getComputedStyle(root, null)
            .getPropertyValue("font-size"),
        fontSize = parseFloat(style);
    let cnvW = document.documentElement.clientWidth * 0.55;
    let cnvH = document.documentElement.clientHeight * 0.6 - fontSize * 4;
</script>

<div class="main">
    <div class="top-section" draggable="false">
        <div class="size-picker">
            <label for="sizes">{language.text.paint.size}:</label>
            <select name="sizes" id="sizes" bind:value={burshSize}>
                <option value="1">1px</option>
                <option value="2">2px</option>
                <option value="4">4px</option>
                <option value="8">8px</option>
                <option value="16">16px</option>
            </select>
        </div>
        <input
            type="color"
            style="margin: .4rem; height: 2rem;"
            bind:value={color}
            id="color-picker"
        />
        <div class="color-presets">
            <div>
                {#each topPresets as preset}
                    <button
                        style="background-color: {preset};"
                        on:click={() => {
                            color = preset;
                        }}
                    />
                {/each}
            </div>
            <div>
                {#each bottomPresets as preset}
                    <button
                        style="background-color: {preset};"
                        on:click={() => {
                            color = preset;
                        }}
                    />
                {/each}
            </div>
        </div>
        <button on:click={onclear}>{language.text.paint.clear}</button>
        <button on:click={onsave}>{language.text.paint.save}</button>
    </div>
    <canvas
        id="_canvas"
        width={cnvW}
        height={cnvH}
        on:mousedown={onmousedown}
        on:mousemove={onmousemove}
    />
</div>

<svelte:window on:mouseup={onmouseup} />

<style>
    .main {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #f5f6f7;
        overflow: hidden;
    }

    .top-section {
        display: flex;
        flex-direction: row;
        user-select: none;
        align-items: center;
    }

    .top-section > button {
        background-color: rgb(182, 182, 182);
        margin-left: 1.5rem;
        padding: 0.5rem;
        color: black;
        border: 1px solid black;
    }

    .top-section > button:hover {
        border-color: #c9e0f7;
    }

    .top-section > button:active {
        box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, 0.75);
    }

    label {
        font-family: SegoeUI;
    }
    .size-picker {
        margin: 1rem;
    }

    .color-presets {
        display: flex;
        flex-direction: column;
    }

    .color-presets > div {
        display: flex;
        flex-direction: row;
    }

    .color-presets > div > button {
        margin: 0.125rem;
        width: 1.25rem;
        height: 1.25rem;
        border: 1px solid grey;
        border-radius: 0;
    }

    .color-presets > div > button:hover {
        border-color: #c9e0f7;
    }

    canvas {
        position: absolute;
        top: 4rem;
        left: 0;
        border: 1px solid black;
        background: white;
    }
</style>
