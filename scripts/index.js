/* global $, debug, doI18N, languages */

const Themes = Object.freeze({
    LIGHT: "theme-light",
    DARK: "theme-dark"
});

const GameAreaHeights = Object.freeze({
    BUTTON: "15%",
    NEWGAME: "35%",
    SETTINGS: "100%",
    GAMEPLAY: "100%",
    INTERMEDIATE: "100%",
    SCORE: "100%",
});

const AnimationTimer = 600;

const MaxNumber = 1000;
const MinNumber = 1;

let words = {};
let wordsLoaded = false;

let settings = {
    languageCode: "en",
    theme: Themes.DARK,

    time: 60,
    amountOfWords: 5,
    amountOfRounds: 5,
    extraPointOnCompletion: false,
};


// Perform initial setup
loadSettings();
doI18N("en");
populateLanguageSelect();
changeTheme(settings.theme);

// Get language
settings.languageCode = "en";

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
}

/** Populate language-select with the available translations */
function populateLanguageSelect() {
    for (let lang in languages) {
        $("#language-select").append(`<option value="${lang}">${languages[lang]}</option>`);
    }
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
            $.getJSON(`data/${settings.languageCode.toLowerCase()}.json`, data => {
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
}

/**
 * After a delay, change the height of the specified area
 * @param {Number} height
 */
function openGameArea(areaClass, height) {
    setTimeout(() => { $(areaClass).css("height", height); }, AnimationTimer);
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

// #endregion

// #region Event handlers

$("#theme-button").click(() => {
    changeTheme((settings.theme === Themes.DARK ? Themes.LIGHT : Themes.DARK));
});

/** Using function to have access to this */
$("#language-select").change(function () {
    settings.languageCode = this.value;
    wordsLoaded = false;
    updateSettings();
    doI18N(settings.languageCode);
});

$("#start-new-game-button").click(() => {
    openGameArea(".new-game-area", GameAreaHeights.NEWGAME);
    $(".button-area").css("height", "0");

    // Since this is asynchronous, we can start the load here
    loadWords();
});

$("#settings-button").click(() => {
    openGameArea(".settings-area", GameAreaHeights.SETTINGS);
    $(".button-area").css("height", "0");
});

$(".back-button").click(() => {
    openGameArea(".button-area", GameAreaHeights.BUTTON);
    $(".new-game-area").css("height", "0");
    $(".settings-area").css("height", "0");
});

$("#play-again-button").click(() => {
    reset();
});

/** Using function to have access to this */
$("#language-select").change(function () {
    settings.languageCode = this.value;
    updateSettings();
    doI18N(settings.languageCode);
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
    updateCounters();
});

$("#extra-point-checkbox").change(e => {
    settings.extraPointOnCompletion = e.currentTarget.checked;
});


// #endregion
