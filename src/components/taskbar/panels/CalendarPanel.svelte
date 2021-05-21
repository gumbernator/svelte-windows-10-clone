<script lang="ts">
    import ChosenPanel from "../chosenPanel";
    import Language from "../../../languages/chosen";
    import { get } from "svelte/store";

    let className = "";
    let previouslyOpened = false;
    ChosenPanel.subscribe((data) => {
        if (data.name === "calendar") {
            className = "panel-open";
            previouslyOpened = true;
            return;
        }
        className = previouslyOpened ? "panel-close" : "";
    });

    let language = get(Language);

    Language.subscribe((data) => {
        language = data;
    });

    let upperTimerText = "";
    let upperHourTypeText = "";
    let upperDateText = "";
    let lowerMonthYearText = "";
    let now = new Date();
    let dateGrid: Date[][] = [
        [now, now, now, now, now, now, now],
        [now, now, now, now, now, now, now],
        [now, now, now, now, now, now, now],
        [now, now, now, now, now, now, now],
        [now, now, now, now, now, now, now],
        [now, now, now, now, now, now, now],
    ];

    function updateDates() {
        let runningDate = new Date(now.getFullYear(), now.getMonth(), 1);
        runningDate.setDate(runningDate.getDate() - runningDate.getDay());
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                dateGrid[i][j] = new Date(runningDate.getTime());
                runningDate.setDate(runningDate.getDate() + 1);
            }
        }
    }

    function updateTexts() {
        now = new Date();
        let year = now.getFullYear();
        let dayOfMonth = now.getDate();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        let ampm = hour >= 12 ? "PM" : "AM";

        let day = language.text.weekDays[now.getDay()];
        let month = language.text.months[now.getMonth()];

        hour = hour % 12;
        let fullhour = hour < 10 ? "0" + hour : "" + hour;
        let fullminute = minute < 10 ? "0" + minute : "" + minute;
        let sullsecond = second < 10 ? "0" + second : "" + second;

        upperTimerText = `${fullhour}:${fullminute}:${sullsecond}`;
        upperHourTypeText = ampm;
        upperDateText = `${day}, ${month} ${dayOfMonth}, ${year}`;
        lowerMonthYearText = `${month} ${year}`;
    }

    setInterval(() => {
        updateTexts();
    }, 100);

    updateDates();
    updateTexts();
</script>

<div class="calendar {className}" style="visibility: hidden;">
    <div class="upper">
        <div class="upper-time">
            <div>{upperTimerText}</div>
        </div>
        <div class="upper-hour-type">
            <div>{upperHourTypeText}</div>
        </div>
        <div class="upper-date">
            <div>{upperDateText}</div>
        </div>
    </div>
    <div class="lower">
        <div class="lower-month-year">
            <div>{lowerMonthYearText}</div>
        </div>
        <div class="lower-week-days">
            <div>{language.text.weekDaysShort.sunday}</div>
            <div>{language.text.weekDaysShort.monday}</div>
            <div>{language.text.weekDaysShort.tuesday}</div>
            <div>{language.text.weekDaysShort.wednesday}</div>
            <div>{language.text.weekDaysShort.thursday}</div>
            <div>{language.text.weekDaysShort.friday}</div>
            <div>{language.text.weekDaysShort.saturday}</div>
        </div>
        <div class="lower-days">
            {#each [...Array(7).keys()] as i}
                <div>
                    {#each [...Array(6).keys()] as j}
                        {#if dateGrid[j][i].getMonth() == now.getMonth()}
                            <button style="color: white;"
                                >{dateGrid[j][i].getDate()}</button
                            >
                        {:else}
                            <button style="color: grey;"
                                >{dateGrid[j][i].getDate()}</button
                            >
                        {/if}
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .calendar {
        position: absolute;
        right: 0px;
        bottom: var(--taskbar-height);
        width: 20vw;
        height: 45vh;
        border-left: 1px var(--system-color-2) solid;
        border-top: 1px var(--system-color-2) solid;
        background-color: rgba(30, 30, 30, 0.95);
        animation-duration: 200ms;
        animation-fill-mode: forwards;
        user-select: none;
        z-index: 998;
    }

    .panel-close {
        animation-name: calendarClose;
    }

    @keyframes calendarClose {
        from {
            bottom: var(--taskbar-height);
            opacity: 1;
            visibility: visible;
        }
        to {
            bottom: 0px;
            opacity: 0;
            visibility: hidden;
        }
    }

    .panel-open {
        animation-name: calendarOpen;
        animation-timing-function: ease-out;
    }

    @keyframes calendarOpen {
        from {
            bottom: 0px;
            opacity: 0.5;
            visibility: hidden;
        }
        to {
            bottom: var(--taskbar-height);
            opacity: 1;
            visibility: visible;
        }
    }

    .upper {
        position: absolute;
        top: 0px;
        width: 100%;
        height: 20%;
        border-bottom: 1px var(--system-color-2) solid;
    }

    .upper-time {
        position: absolute;
        left: 5%;
        top: 0px;
        width: 40%;
        height: 70%;
        color: white;
        font-size: calc(1.4vw + 1.4vh);
        font-family: SegoeUILight;
    }

    .upper-time > div {
        position: absolute;
        bottom: 0px;
        left: 0px;
    }

    .upper-hour-type {
        position: absolute;
        top: 0px;
        left: 40%;
        height: 70%;
        width: 60%;
        margin-left: 3%;
        color: var(--system-color-2);
        font-size: calc(0.8vw + 0.8vh);
        font-family: SegoeUI;
    }

    .upper-hour-type > div {
        position: absolute;
        left: 0px;
        bottom: 0px;
    }

    .upper-date {
        position: absolute;
        top: 70%;
        left: 5%;
        width: 50%;
        height: 30%;
        color: var(--system-color-2);
        font-size: calc(0.5vw + 0.5vh);
        font-family: SegoeUI;
    }

    .upper-date > div {
        position: absolute;
        left: 0px;
        top: 0px;
    }

    .lower {
        position: absolute;
        top: 20%;
        width: 100%;
        height: 80%;
    }

    .lower-month-year {
        position: absolute;
        left: 5%;
        top: 0px;
        width: 95%;
        height: 10%;
        color: white;
        font-size: calc(0.55vw + 0.55vh);
        font-family: SegoeUILight;
    }

    .lower-month-year > div {
        position: absolute;
        left: 0px;
        bottom: 0px;
    }

    .lower-week-days {
        position: absolute;
        left: 5%;
        right: 5%;
        top: 15%;
        display: flex;
        color: white;
        font-size: calc(0.5vw + 0.5vh);
        font-family: SegoeUILight;
    }

    .lower-week-days > div {
        flex-basis: 100%;
        text-align: center;
    }

    .lower-days {
        position: absolute;
        top: 25%;
        bottom: 5%;
        left: 5%;
        right: 5%;
        display: flex;
        flex-direction: row;
        color: white;
        font-size: calc(0.5vw + 0.5vh);
        font-family: SegoeUILight;
    }

    .lower-days > div {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .lower-days > div > button {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        border: transparent solid 2px;
        background: none;
    }

    .lower-days > div > button:hover {
        border-color: var(--system-color-2);
    }
</style>
