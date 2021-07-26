<script lang="ts">
    type Mail = {
        initials: string;
        initialsColor: string;
        sender: string;
        title: string;
        preview: string;
        sentDate: Date;
        mailImgPath: string | null;
    };

    let mails = new Array<Mail>();
    mails.push({
        initials: "N",
        initialsColor: "#e75e78",
        sender: "Netflix",
        title: "What's playing next, Gumbee?",
        preview: "Watch one of our top picks for you.",
        sentDate: new Date(),
        mailImgPath: "./images/netflix-mail1.jpg",
    });
    mails.push({
        initials: "N",
        initialsColor: "#e75e78",
        sender: "Netflix",
        title: "Top suggestions for Guyug",
        preview: "Watch one of our top picks for you.",
        sentDate: new Date(),
        mailImgPath: "./images/netflix-mail2.jpg",
    });

    let mailImgPath: string | null = null;

    function onMailClick(idx: number) {
        mailImgPath = mails[idx].mailImgPath;
    }
</script>

<div class="main" draggable="false">
    <img src="./images/mail-background.jpg" alt="mountain" draggable="false" />
    <div class="dashboard">
        <div class="accounts">
            <div class="account-text">
                <img src="./vectors/user.svg" alt="user" height="20vh" />
                <p>Accounts</p>
            </div>

            <div class="account-section">
                <p style="font-family: SegoeUISemiBold;">Hotmail</p>
                <p style="font-family: SegoeUILight;">guyugmonkh@hotmail.com</p>
            </div>
        </div>

        <div class="folders">
            <div class="folders-text">
                <img src="./vectors/folder.svg" alt="folder" height="20vh" />
                <p>Folders</p>
            </div>

            <div
                style="border-left: 0.25rem solid rgb(185, 216, 255); margin-top: 1rem;"
            >
                <p style="color: rgb(185, 216, 255);">Inbox</p>
            </div>
            <div><p>Drafts</p></div>
            <div><p>Sent</p></div>
            <div><p>Archive</p></div>
            <div><p>Deleted</p></div>
            <div><p>Outbox</p></div>
            <div><p>Conversation History</p></div>
            <div><p>Junk</p></div>
            <div><p>RSS Feeds</p></div>
        </div>
    </div>

    <div class="mail-list">
        <div class="mail-list-header">
            <div class="mail-list-header-top">
                <div class="search-bar">
                    <input type="text" placeholder="Search" />
                    <button />
                </div>
            </div>
            <div class="mail-list-header-bottom">
                <div
                    style="margin-left: 1rem; border-bottom: 0.125rem solid rgb(185, 216, 255);"
                >
                    <p style="color: rgb(185, 216, 255);">Focused</p>
                </div>
                <div><p>Other</p></div>
            </div>
        </div>
        <div class="mail-list-mails">
            {#each mails as mail, i}
                <div class="mail-section" on:click={() => onMailClick(i)}>
                    <div class="mail-initials">
                        <p style="background-color: {mail.initialsColor};">
                            {mail.initials}
                        </p>
                    </div>
                    <div class="mail-info">
                        <p>{mail.sender}</p>
                        <p>{mail.title}</p>
                        <p style="color: hsl(0, 0%, 70%);">
                            {mail.preview}
                        </p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <div class="mail-view">
        {#if mailImgPath != null}
            <img src={mailImgPath} alt="mail" />
        {/if}
    </div>
</div>

<style>
    .main {
        height: 100%;
        width: 100%;
        position: absolute;
        overflow: hidden;
    }

    .main > img {
        object-fit: cover;
        max-height: 100%;
        min-width: 100%;
        user-select: none;
    }

    p {
        color: white;
        font-family: SegoeUISemilight;
    }

    div {
        user-select: none;
    }

    .dashboard {
        height: 100%;
        width: 15vw;
        left: 0;
        top: 0;
        position: absolute;
        overflow-y: scroll;
        scrollbar-color: #888 transparent;
        scrollbar-width: thin;
        background: rgba(38, 38, 38, 0.9);
        backdrop-filter: blur(2px);
    }

    .accounts {
        display: flex;
        flex-direction: column;
    }

    .account-text {
        margin-top: 1rem;
        margin-left: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .account-text > p {
        margin-left: 1rem;
        font-family: SegoeUISemiBold;
        font-size: 1.25rem;
    }

    .account-section {
        margin-top: 1rem;
        margin-left: 4px;
        border-left: 0.25rem solid rgb(185, 216, 255);
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        border-top: 1px solid transparent;
        border-bottom: 1px solid transparent;
    }

    .account-section:hover {
        border-top: 1px solid #555;
        border-bottom: 1px solid #555;
    }

    .account-section > p {
        margin-left: 10%;
        color: rgb(185, 216, 255);
    }

    .folders {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
    }

    .folders-text {
        margin-left: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .folders-text > p {
        margin-left: 1rem;
        font-family: SegoeUISemiBold;
        font-size: 1.25rem;
    }

    .folders > div:not(:first-child) {
        margin-left: 4px;
        padding: 0.5rem 0;
        box-sizing: border-box;
    }

    .folders > div:not(:first-child):hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    .folders > div:not(:first-child) > p {
        margin-left: calc(1rem + 10%);
        font-family: SegoeUISemiBold;
    }

    .mail-list {
        height: 100%;
        width: 15vw;
        left: 15vw;
        top: 0;
        position: absolute;
        overflow-y: scroll;
        scrollbar-color: #888 transparent;
        scrollbar-width: thin;
        border-left: 1px solid black;
        border-right: 1px solid black;
        background: #262626;
    }

    .mail-list-header {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 12vh;
        display: flex;
        flex-direction: column;
    }

    .mail-list-mails {
        position: absolute;
        left: 0;
        top: 12vh;
        width: 100%;
        height: max-content;
        display: flex;
        flex-direction: column;
    }

    .mail-list-header-top {
        margin-left: 1rem;
        margin-bottom: 2rem;
    }

    .search-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .search-bar > input {
        height: 3vh;
        width: 70%;
        border-radius: 0;
        border: 1px solid hsl(0, 0%, 40%);
        font-size: 1rem;
        color: hsl(0, 0%, 40%);
        background-color: transparent;
    }

    .search-bar > input:focus {
        background: black;
        color: white;
        outline: none;
    }

    .search-bar > button {
        width: 3rem;
        height: 3rem;
        background-color: transparent;
        background-image: url(../vectors/refresh-mail.svg);
        background-position: center;
        background-repeat: no-repeat;
        background-size: 70%;
    }

    .search-bar > button:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    .mail-list-header-bottom {
        position: absolute;
        bottom: 1rem;
        display: flex;
        flex-direction: row;
    }

    .mail-list-header-bottom > div {
        padding: 0.5rem;
    }

    .mail-list-header-bottom > div:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    .mail-list-header-bottom > div > p {
        font-size: 1.25rem;
    }

    .mail-list-mails > div:first-child {
        margin-top: 0;
    }

    .mail-section {
        border-top: 1px solid black;
        display: flex;
        flex-direction: row;
    }

    .mail-section:hover {
        background-color: hsla(0, 0%, 80%, 0.15);
    }

    .mail-initials > p {
        margin-left: 1rem;
        margin-top: 1rem;
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        padding: 0.25rem;
        text-align: center;
    }

    .mail-info {
        margin-left: 0.5rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .mail-info > p {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .mail-view {
        height: 100%;
        width: calc(100% - 30vw);
        left: 30vw;
        top: 0;
        position: absolute;
        overflow-y: scroll;
        scrollbar-color: #888 transparent;
        scrollbar-width: thin;
    }

    .mail-view > img {
        max-width: 100%;
        display: block;
        margin: auto;
    }

    ::-webkit-scrollbar {
        width: 0.25rem;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: #888;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
</style>
