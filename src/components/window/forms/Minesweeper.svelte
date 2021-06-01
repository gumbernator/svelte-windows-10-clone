<script lang="ts">
    let rows = 18;
    let cols = 18;
    let fields: number[][] = [];
    let fieldStates: number[][] = [];
    let elapsedTime = 0;
    let imagePath = "./vectors/smile.svg";
    let lost = false;
    let timer: number;

    function onBtnClick(i: number, j: number, event: MouseEvent) {
        if (lost) {
            return;
        }
        if (fieldStates[i][j] == 1) {
            return;
        }
        if (event.button == 2) {
            fieldStates[i][j] = fieldStates[i][j] == 2 ? 0 : 2;
            if (checkIfWon()) {
                imagePath = "./vectors/heart.svg";
                clearInterval(timer);
                lost = true;
            }
            return;
        }
        if (fieldStates[i][j] == 2) {
            fieldStates[i][j] = 0;
            return;
        }
        if (fields[i][j] > 0) {
            fieldStates[i][j] = 1;
            return;
        }
        if (fields[i][j] == 0) {
            fieldStates[i][j] = 1;
            let locs = [
                [i - 1, j - 1],
                [i - 1, j],
                [i - 1, j + 1],
                [i, j - 1],
                [i, j + 1],
                [i + 1, j - 1],
                [i + 1, j],
                [i + 1, j + 1],
            ];
            locs = locs.filter((e) => {
                return e[0] >= 0 && e[1] >= 0 && e[0] < rows && e[1] < cols;
            });
            locs.forEach((e) => {
                onBtnClick(e[0], e[1], event);
            });
            return;
        }
        imagePath = "./vectors/sad.svg";
        clearInterval(timer);
        lost = true;
    }

    function onRefreshClick() {
        fields = [];
        fieldStates = [];
        elapsedTime = 0;
        imagePath = "./vectors/smile.svg";
        lost = false;
        clearInterval(timer);
        timer = setInterval(() => {
            elapsedTime++;
        }, 1000);

        for (let i = 0; i < rows; i++) {
            let rowField: number[] = [];
            let rowFieldState: number[] = [];
            for (let j = 0; j < cols; j++) {
                rowField.push(0);
                rowFieldState.push(0);
            }
            fields.push(rowField);
            fieldStates.push(rowFieldState);
        }

        for (let i = 0; i < fields.length; i++) {
            if ((i + 1) % 3 == 0) {
                continue;
            }
            for (let j = 0; j < fields[i].length; j++) {
                let r = Math.random();
                if (r < 0.2) {
                    fields[i][j] = -1;
                }
            }
        }
        for (let i = 0; i < fields.length; i++) {
            for (let j = 0; j < fields[i].length; j++) {
                if (fields[i][j] == -1) {
                    continue;
                }
                let count = 0;
                let locs = [
                    [i - 1, j - 1],
                    [i - 1, j],
                    [i - 1, j + 1],
                    [i, j - 1],
                    [i, j + 1],
                    [i + 1, j - 1],
                    [i + 1, j],
                    [i + 1, j + 1],
                ];
                locs = locs.filter((e) => {
                    return e[0] >= 0 && e[1] >= 0 && e[0] < rows && e[1] < cols;
                });

                locs.forEach((e) => {
                    if (fields[e[0]][e[1]] == -1) {
                        count++;
                    }
                });
                fields[i][j] = count;
            }
        }
    }

    function checkIfWon() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (fields[i][j] == -1 && fieldStates[i][j] != 2) {
                    return false;
                }
            }
        }
        return true;
    }

    onRefreshClick();
</script>

<div
    style="background: #7f7f7f; width: 100%; height: 100%; user-select: none;"
    on:contextmenu|preventDefault={(e) => {
        return false;
    }}
    draggable="false"
>
    <div class="top-section">
        <button class="refresher" on:click={onRefreshClick} />
        <img src={imagePath} alt="" />
        <div class="timer-container">
            <p>{elapsedTime}</p>
        </div>
    </div>
    <div class="bottom-section">
        <div class="fields">
            {#each [...Array(rows).keys()] as i}
                <div>
                    {#each [...Array(cols).keys()] as j}
                        {#if fieldStates[i][j] == 0}
                            <button
                                on:mousedown={(e) => onBtnClick(i, j, e)}
                                class="btn btn-inactive"
                            />
                        {:else if fieldStates[i][j] == 2}
                            <button
                                on:mousedown={(e) => onBtnClick(i, j, e)}
                                class="btn btn-marked"
                            />
                        {:else if fields[i][j] == 0}
                            <button
                                on:mousedown={(e) => onBtnClick(i, j, e)}
                                class="btn btn-active"
                            />
                        {:else}
                            <button
                                on:mousedown={(e) => onBtnClick(i, j, e)}
                                class="btn btn-active">{fields[i][j]}</button
                            >
                        {/if}
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .top-section {
        position: absolute;
        top: 0;
        width: 100%;
        height: 5vh;
        background-color: #c0c0c0;
    }

    .bottom-section {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: calc(100% - 5vh);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .fields {
        top: 0;
        left: 0;
        width: 50vh;
        height: 50vh;
        border: 1px solid transparent;
        background-color: #c0c0c0;
        display: flex;
        flex-direction: column;
    }

    .fields > div {
        flex: 1;
        display: flex;
        flex-direction: row;
    }

    .btn {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .btn-inactive {
        border: grey solid 2px;
        background: none;
    }

    .btn-active {
        border: transparent solid 2px;
        background: #c1c1c1;
    }

    .btn-marked {
        border: grey solid 2px;
        background: none;
        background-image: url(../vectors/flags.svg);
    }

    img {
        position: absolute;
        left: 30%;
        top: 10%;
        height: 80%;
        width: auto;
        border: grey solid 1px;
    }

    .refresher {
        position: absolute;
        left: 20%;
        top: 10%;
        width: 3vh;
        height: 3vh;
        background: #c0c0c0;
        border: grey solid 1px;
        background-image: url(../vectors/refresh.svg);
    }

    .refresher:active {
        transform: scale(0.9);
    }

    .timer-container {
        position: absolute;
        right: 30%;
        top: 10%;
        height: 80%;
        padding: 1rem;
        background: black;
        border: grey solid 1px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    p {
        width: 4ch;
        color: red;
        font-size: 1.5rem;
        font-family: Segoe UI;
        text-align: right;
    }
</style>
