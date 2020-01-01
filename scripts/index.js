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

// #endregion

// #region Event handlers
$("#start-button").click(() => {
    $.getJSON(`data/${settings.languageCode.toLowerCase()}.json`, data => {
        let words = data.words;

        debug.log();
    });


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
    theme: Themes.DARK
};


// Get language
if (debug.dev) settings.languageCode = "en";
else settings.languageCode = "en";

// Perform I18N
doI18N("en");

