<script>
    import lazyLoad from "../../lazyLoad";
    import Language from "../../../languages/chosen";
    import { get } from "svelte/store";
    let language = get(Language);

    Language.subscribe((data) => {
        language = data;
    });
</script>

<div class="aboutme" draggable="false">
    <img use:lazyLoad={"./images/profile.jpg"} alt="profile" />
    <div class="right-side">
        <p>
            {language.text.profile.topText}
        </p>
        <ul>
            {language.text.profile.acheivements}
            <li>
                2019:
                <a
                    href="https://itpec.org/about/itpec-common-exam.html"
                    target="_blank">ITPEC</a
                >
                {language.text.profile.acheivementITPEC}
            </li>
            <li>
                2020:
                {language.text.profile.acheivementGraduate}
                <br />
                <a
                    href="https://github.com/gumbernator/Mongolian-ALPR"
                    target="_blank">{language.text.profile.acheivementThesis}</a
                >
            </li>
            <li>
                2020: {language.text.profile.acheivementUnitelFirst}
                <a href="https://www.unitel.mn/unitel/" target="_blank"
                    >Unitel</a
                >
                {language.text.profile.acheivementUnitelLast}
            </li>
        </ul>

        <ul>
            {language.text.profile.languages}
            <li>Python, Java, Kotlin, C#, SQL, Javascript, Typescript</li>
            <li />
            {language.text.profile.technologies}
            <li>
                Rest API, Oracle DB, Linux, .NET, Svelte, HTML, CSS, Tensorflow,
                Android
            </li>
        </ul>
    </div>
</div>

<style>
    .aboutme {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: row;
        background-color: white;
        user-select: none;
    }

    .right-side {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        scrollbar-color: #222 transparent;
        scrollbar-width: 20;
    }

    img {
        height: 100%;
        width: auto;
        display: block;
        background: transparent;
    }

    p {
        font-size: 1rem;
        font-family: SegoeUILight;
        font-weight: normal;
        color: black;
        margin: 1rem;
    }

    ul,
    a,
    li {
        font-size: 1rem;
        font-family: SegoeUILight;
        color: black;
        font-weight: normal;
        list-style-type: none;
    }

    ul {
        margin: 1rem;
        font-weight: 700;
    }

    li {
        margin-left: 1rem;
        margin-top: 1rem;
    }

    a {
        color: blue;
    }

    ::-webkit-scrollbar {
        width: 0.5rem;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: #222;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #444;
    }
</style>
