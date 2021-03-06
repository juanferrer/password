/* global $, debug, doI18N, languages */

const Themes = Object.freeze({
    LIGHT: "theme-light",
    DARK: "theme-dark"
});

const GameAreaHeights = Object.freeze({
    BUTTON: "20%",
    NEWGAME: "60%",
    SETTINGS: "100%",
    GAMEPLAY: "100%",
    INTERMEDIATE: "100%",
    SCORE: "100%",
});

const GameAreaIDs = Object.freeze({
    BUTTON: "#button-area",
    NEWGAME: "#new-game-area",
    SETTINGS: "#settings-area",
    GAMEPLAY: "#gameplay-area",
    INTERMEDIATE: "#intermediate-area",
    SCORE: "#score-area",
});

const AnimationTime = 600;

const MaxNumber = 1000;
const MinNumber = 1;

let settings = {
    languageCode: "en",
    theme: Themes.DARK,

    time: 60,
    amountOfWords: 5,
    amountOfRounds: 5,
    extraPointOnCompletion: false,
};


let words = {};
let wordsLoaded = false;
let countdownTime = settings.time;
let currentRound = 0;
let timerInterval;
let teamIndex = 0;
/**
 * @typedef {Object} Team
 * @property {Number} index
 * @property {String} name
 * @property {Number} score
 */

/** @type {Team[]} */
let teams = [];

window.onload = () => {
    // Perform initial setup
    loadSettings();
    populateLanguageSelect();
    doI18N(settings.languageCode);
    changeLanguage(settings.languageCode);
    changeTheme(settings.theme);

    if (!debug.isWeb) {
        $(".small-links").show();
    }
};

// #region Functions

/** Load the settings from local storage */
function loadSettings() {
    let jsonSettings = localStorage.getItem("passwordSettings");
    try {
        if (jsonSettings) {
            settings = JSON.parse(jsonSettings);
        }
    } catch (e) {
        debug.log("String is not valid JSON");
        // No point storing it then
        localStorage.removeItem("passwordSettings");
        // Use the current definition of settings (above)
    }

    $("#rounds-counter-display").attr("data-value", settings.amountOfRounds);
    $("#words-counter-display").attr("data-value", settings.amountOfWords);
    $("#time-counter-display").attr("data-value", settings.time);
    $("#extra-point-checkbox")[0].checked = settings.extraPointOnCompletion;
    updateCounters();
}

/** Populate language-select with the available translations */
function populateLanguageSelect() {
    for (let lang in languages) {
        $("#language-select").append(`<option value="${lang}">${languages[lang]}</option>`);
        $("#custom-language-select").append(`<div value="${lang}">${languages[lang]}</div>`);
    }

    // Now, add eventy handlers for them
    $("#custom-language-select div").mousedown(e => {
        changeLanguage(e.currentTarget.getAttribute("value"));
    });
}

/** Store the settings for later use */
function updateSettings() {
    localStorage.setItem("passwordSettings", JSON.stringify(settings));
}

/**
 * Change the theme of the app
 * @param {string} newTheme theme-light or theme-dark
 */
function changeTheme(newTheme) {
    if ($("body").hasClass(settings.theme)) {
        $("body").removeClass(settings.theme);
    }
    $("body").addClass(newTheme);
    settings.theme = newTheme;
    // Store new theme
    updateSettings();
}

/**
 * Load words from data/*.json
 * @return {Promise}
 */
function loadWords() {
    return new Promise((resolve, reject) => {
        if (!wordsLoaded) {
            $.getJSON(`data/${settings.languageCode.toLowerCase()}.min.json`, data => {
                words = data.words;
                wordsLoaded = true;
                resolve();
            }).fail(() => {
                reject();
            });
        } else {
            resolve();
        }
    });
}

/**
 * Get an array with n words and remove them from the available list
 * @param {Number} n
 * @returns {string[]} Array of n words
 */
function getWordsToPlay(n) {
    let playWords = [];
    let playWordsIndices = [];

    // Get n unique random integers between 0 and n
    for (let i = 0; i < n; ++i) {
        let int;
        do {
            int = getRandomInt(0, words.length - 1);
        } while (playWordsIndices.includes(int) && words.length > n); // Repeat if already in array
        playWordsIndices.push(int);
        //playWords.push(words[int]);
    }

    // Got the indices and the words, now splice the array and put the words in a new array
    for (let i = words.length - 1; i >= 0; --i) {
        if (playWordsIndices.includes(i)) {
            playWords.push(words.splice(i, 1)[0]);
        }
    }

    debug.log(playWords);

    return playWords;
}

/**
 * Get an int between min and max
 * @param {Number} max
 */
function getRandomInt(min, max) {
    let minC = Math.ceil(min);
    let maxF = Math.floor(max);
    return Math.floor(Math.random() * (maxF - minC + 1)) + minC;
}

/**
 * Prepare for another game
 */
function reset() {
    wordsLoaded = false;
    settings.words = [];
    loadWords();
    teams.forEach(t => {
        t.score = 0;
    });
    currentRound = 0;
    teamIndex = 0;
}

/**
 * After a delay, change the height of the specified area
 * @param {Number} height
 */
function openGameArea(areaClass, height) {
    setTimeout(() => { $(areaClass).css("height", height); }, AnimationTime);
}

/**
 * Add or substract a number from the specified counter
 * @param {HTMLElement} counterButton
 * @param {Number} modifier
 */
function modifyCounter(counterButton, modifier) {
    let display = $(`#${counterButton.getAttribute("data-display")}`);
    let number = parseInt(display.attr("data-value"));
    // Also check the face value, it may have been manually edited:
    let displayNumber = parseInt(display.html());
    let step = parseInt(display.attr("data-step"));
    if (displayNumber !== number) number = displayNumber;
    if (isNaN(number)) {
        number = MinNumber;
        step = 0;
    }

    let finalNumber = number + (modifier * step);

    if (finalNumber < MinNumber) finalNumber = MinNumber;
    if (finalNumber > MaxNumber) finalNumber = MaxNumber;

    display.attr("data-value", finalNumber);
    updateCounters();

    // Also, update the settings
    settings[display.attr("data-setting")] = finalNumber;
    updateSettings();
}

/** Update the counter's display */
function updateCounters() {

    $(".counter-button").each((index, counterButton) => {
        let display = $(`#${counterButton.getAttribute("data-display")}`);
        let number = parseInt(display.attr("data-value"));

        if (counterButton.classList.contains("counter-increment-button")) {
            if (number >= 999 || isNaN(number)) {
                counterButton.setAttribute("disabled", true);
            } else {
                counterButton.removeAttribute("disabled");
            }
        }

        if (counterButton.classList.contains("counter-decrement-button")) {
            if (number <= 1 || isNaN(number)) {
                counterButton.setAttribute("disabled", true);
            } else {
                counterButton.removeAttribute("disabled");
            }
        }
    });

    // Update each counter display
    $(".counter-display").each((index, display) => {
        display.innerHTML = $(display).attr("data-value");
    });
}

/** Ensure the teams array has all the teams with the right names */
function updateTeamNames() {
    // Clear it, just in case
    teams = [];

    let teamNames = $(".teams-list").children().toArray().map(x => x.innerHTML);

    // Now create a team for each name
    teamNames.forEach((t, i) => {
        teams.push({ index: i, name: t, score: 0 });
    });
}

/**
 * Strikethrough word and mark it as solved in the list
 * @param {MouseEvent} e
 */
function wordSolved(e) {
    e.currentTarget.classList.toggle("solved-word");
    let adding = e.currentTarget.classList.contains("solved-word");
    let parent = e.currentTarget.parentElement;
    let currentSolved = parseInt(parent.getAttribute("data-solved"));
    if (adding)++currentSolved;
    else --currentSolved;

    parent.setAttribute("data-solved", currentSolved);
}

/** Decide what to do when interval time runs out */
function intervalTimeout() {
    --countdownTime;
    $(".gameplay-area-timer-number").html(countdownTime);
    if (countdownTime == 0) {
        // Should finish here
        clearInterval(timerInterval);
        $(".gameplay-area-timer-circle circle").removeClass("timer-countdown-animation");
        $(".gameplay-area-timer-circle circle").addClass("timer-reset-animation");

        // Add score to the current team
        let wordListElement = $(".gameplay-area-word-list");
        let solved = parseInt(wordListElement.attr("data-solved"));
        if (settings.extraPointOnCompletion && solved === wordListElement.children().length) {
            // It completed all items and we're supposed to award an extra point when all
            // are completed
            ++solved;
        }
        teams[teamIndex].score += solved;

        // And clear current points
        wordListElement.attr("data-solved", "0");

        // Populate lists with team names and scores
        $(".team-scores-list").empty();
        teams.forEach(t => {
            let e = document.createElement("LI");
            e.innerHTML = `${t.name}: ${t.score}`;
            $(".team-scores-list").append(e);
        });

        // If we're at the last round and the last team just went, open score screen
        // Otherwise, prepare for next team
        if ((currentRound === settings.amountOfRounds - 1) && (teamIndex === teams.length - 1)) {
            openGameArea(GameAreaIDs.SCORE, GameAreaHeights.SCORE);
            $(GameAreaIDs.GAMEPLAY).css("height", "0");

            // Populate name of winner
            let topScore = 0;
            let winnerIndex;
            teams.forEach((t, i) => {
                if (t.score > topScore) {
                    topScore = t.score;
                    winnerIndex = i;
                }
            });
            $(".winner-team-name").html(teams[winnerIndex].name);

        } else {
            openGameArea(GameAreaIDs.INTERMEDIATE, GameAreaHeights.INTERMEDIATE);
            $(GameAreaIDs.GAMEPLAY).css("height", "0");

            // Populate name of next team
            ++teamIndex;
            if (teamIndex > teams.length - 1) {
                ++currentRound;
                teamIndex = 0;
            }
            $(".intermediate-area-next-team").html(teams[teamIndex].name);
        }
    }
}

/**
 * Update language-select value and trigger a change event
 * @param {String} lang
 */
function changeLanguage(lang) {
    // Manually trigger change in language-select
    settings.languageCode = lang;
    $("#language-select").val(settings.languageCode);
    $("#language-select")[0].dispatchEvent(new Event("change"));
}

// #endregion

// #region Event handlers

$("#theme-button").click(() => {
    changeTheme((settings.theme === Themes.DARK ? Themes.LIGHT : Themes.DARK));
});

$("#language-button").click(() => {
    //$(".custom-language-select").width(150);
    $("#custom-language-select").toggleClass("open");
});

$("#language-button").blur(() => {
    $("#custom-language-select").removeClass("open");
});

/** Using function to have access to this */
$("#language-select").change(function () {
    settings.languageCode = this.value;
    wordsLoaded = false;
    updateSettings();
    doI18N(settings.languageCode);

    // Reorder custom-language-select so that the active language is at the top
    let eToMove = $(`#custom-language-select div[value=${settings.languageCode}]`)[0];
    let parent = eToMove.parentElement;
    parent.insertBefore(eToMove, parent.childNodes[0]);
});

$("#start-new-game-button").click(() => {
    openGameArea(GameAreaIDs.NEWGAME, GameAreaHeights.NEWGAME);
    $(GameAreaIDs.BUTTON).css("height", "0");

    // Since this is asynchronous, we can start the load here
    loadWords();
});

$(".settings-button").click(() => {
    openGameArea(GameAreaIDs.SETTINGS, GameAreaHeights.SETTINGS);
    $(GameAreaIDs.BUTTON).css("height", "0");
    $(GameAreaIDs.SCORE).css("height", "0");
});

$(".back-button").click(() => {
    openGameArea(GameAreaIDs.BUTTON, GameAreaHeights.BUTTON);
    $(GameAreaIDs.NEWGAME).css("height", "0");
    $(GameAreaIDs.SETTINGS).css("height", "0");
    $(GameAreaIDs.INTERMEDIATE).css("height", "0");

    updateSettings();
    reset();
});

$(".counter-increment-button").click(e => {
    // Before updating
    modifyCounter(e.currentTarget, 1);
});

$(".counter-decrement-button").click(e => {
    modifyCounter(e.currentTarget, -1);
});

/** Only allow number keys*/
$(".counter-display").keypress(e => {
    // It's either not a number (out of number range) or the resulting number would end up being too long
    if (e.which < 48 || e.which > 57) {
        e.preventDefault();
    }
});

$(".counter-display").blur(e => {
    let n = parseInt(e.currentTarget.innerHTML);
    if (n < MinNumber || isNaN(n)) n = MinNumber;
    if (n > MaxNumber) n = MaxNumber;
    e.currentTarget.setAttribute("data-value", n);

    // Also, update the settings
    settings[e.currentTarget.getAttribute("data-setting")] = n;
    updateCounters();
});

$("#extra-point-checkbox").change(e => {
    settings.extraPointOnCompletion = e.currentTarget.checked;
});

$("#new-game-team-name-add-button").click(e => {
    let teamList = $(".teams-list")[0];
    let newTeam = document.createElement("LI");
    newTeam.innerHTML = e.currentTarget.previousElementSibling.value;
    newTeam.setAttribute("contenteditable", "");
    newTeam.classList.add("team-name-item");

    // Add a way to handle the modification of team names
    newTeam.addEventListener("blur", function (e) {
        if (e.currentTarget.innerHTML === "") {
            e.currentTarget.parentElement.removeChild(e.currentTarget);
        }

        updateTeamNames();
    });

    // If nothing was written, add nothing
    if (newTeam.innerHTML !== "") {
        teamList.appendChild(newTeam);
        e.currentTarget.previousElementSibling.value = "";
        updateTeamNames();
    }
});

$("#new-game-button").click(() => {

    if (teams.length === 0) {
        // They just wanted to get in the game with a single team, improvise a name
        teams.push({ index: 0, name: "The Unnamed", score: 0 });
    }

    openGameArea(GameAreaIDs.INTERMEDIATE, GameAreaHeights.INTERMEDIATE);
    $(GameAreaIDs.NEWGAME).css("height", "0");

    // Populate name of team
    $(".intermediate-area-next-team").html(teams[teamIndex].name);

    // Populate list with team names and scores
    $(".team-scores-list").empty();
    teams.forEach(t => {
        let e = document.createElement("LI");
        e.innerHTML = `${t.name}: ${t.score}`;
        $(".team-scores-list").append(e);
    });
});

$(".gameplay-area-word-list li").click(wordSolved);

$("#continue-button").click(() => {
    openGameArea(GameAreaIDs.GAMEPLAY, GameAreaHeights.GAMEPLAY);
    $(GameAreaIDs.INTERMEDIATE).css("height", "0");

    // Populate name of team
    $(".gameplay-area-team-name").html(teams[teamIndex].name);

    // Populate word list
    let words = getWordsToPlay(settings.amountOfWords);
    let wordList = $(".gameplay-area-word-list");
    wordList.empty();

    words.forEach(w => {
        let e = document.createElement("LI");
        e.innerHTML = w;

        // Add a click event to list items
        e.addEventListener("click", wordSolved);
        wordList.append(e);
    });

    // Start timer
    countdownTime = settings.time;
    $(":root").css("--countdown-time", `${countdownTime}s`);

    $(".gameplay-area-timer-circle circle").removeClass("timer-reset-animation");
    $(".gameplay-area-timer-circle circle").addClass("timer-countdown-animation");
    $(".gameplay-area-timer-number").html(countdownTime);
    timerInterval = setInterval(intervalTimeout, 1000);
});

$("#play-again-button").click(() => {
    reset();
    openGameArea(GameAreaIDs.INTERMEDIATE, GameAreaHeights.INTERMEDIATE);
    $(GameAreaIDs.SCORE).css("height", "0");
});

// #endregion
