<script lang="ts">
    import ChosenPanel from "./chosenPanel";
    import CalendarPanel from "./panels/CalendarPanel.svelte";

    function onClick() {
        ChosenPanel.update((data) => {
            data.name = data.name === "calendar" ? "" : "calendar";
            return data;
        });
    }

    let timeText = "";
    let dateText = "";
    function updateDateTime() {
        let currDate = new Date();
        let hour = currDate.getHours();
        let minute = currDate.getMinutes();
        let ampm = hour >= 12 ? "PM" : "AM";
        hour = hour > 12 ? hour - 12 : hour;
        let fullminute = minute < 10 ? "0" + minute : "" + minute;

        let month = currDate.getMonth();
        let dayOfMonth = currDate.getDate();
        let year = currDate.getFullYear();

        timeText = `${hour}:${fullminute} ${ampm}`;
        dateText = `${month}/${dayOfMonth}/${year}`;
    }

    updateDateTime();

    setInterval(updateDateTime, 1000);
</script>

<button on:click={onClick}>
    <div class="date-control">
        <div class="date-control-time">{timeText}</div>
        <div class="date-control-date">{dateText}</div>
    </div>
</button>
<CalendarPanel />

<style>
    button {
        position: absolute;
        right: calc(13px + max(30px, 4vh));
        height: 100%;
        width: 6.5vh;
        min-width: 45px;
        background: none;
        border: none;
    }

    button:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    .date-control {
        left: 0px;
        top: 0px;
        height: 100%;
        width: 100%;
        display: grid;
        text-align: center;
        color: white;
        font-size: calc(0.4vw + 0.5vh);
        font-family: SegoeUI;
        user-select: none;
        z-index: 999;
    }

    .date-control-time {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .date-control-date {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 0.5vh;
    }
</style>
