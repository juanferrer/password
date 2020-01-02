/* global $, debug, doI18N */

// #region Functions

/** Load the settings from local storage */
function loadSettings() {
    let jsonSettings = localStorage.getItem("mafiaSettings");
    try {
        if (jsonSettings) {
            settings = JSON.parse(jsonSettings);
        }
    } catch (e) {
        debug.log("String is not valid JSON");
        // No point storing it then
        localStorage.removeItem("mafiaSettings");
        // Use the current definition of settings (above)
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
 */
function loadWords() {
    let d = $.Deferred();


    $.getJSON(`data/${settings.languageCode.toLowerCase()}.json`, data => {
        words = data.words;
        settings.wordsLoaded = true;
        d.resolve();
    }).fail(d => {
        d.reject();
    });

    return d.promise();
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
    settings.wordsLoaded = false;
    settings.words = [];
}

// #endregion

// #region Event handlers
$("#start-button").click(() => {
    if (!settings.wordsLoaded) {
        loadWords().then(() => getWordsToPlay(settings.amountOfWords)).catch(e => debug.log(e));
    } else {
        getWordsToPlay(settings.amountOfWords);
    }
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

// #endregion

const Themes = Object.freeze({
    LIGHT: "theme-light",
    DARK: "theme-dark"
});

let settings = {
    languageCode: "en",
    theme: Themes.DARK,
    time: 60,
    amountOfWords: 5,
    extraPointOnCompletion: false,
    wordsLoaded: false,
};

let words = {};


// Get language
if (debug.dev) settings.languageCode = "en";
else settings.languageCode = "en";

// Perform I18N
doI18N("en");

