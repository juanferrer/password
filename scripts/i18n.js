/* globals $ */

let i18n = {};

/**
 * Perform I18N in the whole page for the specified language code
 * @param {String} languageCode [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
 */
function doI18N(languageCode) { // eslint-disable-line no-unused-vars
    if (!languageCode) languageCode = "en";
    $.getJSON(`i18n/${languageCode.toLowerCase()}.json`, I18N => {
        // Cache whatever language the user selected
        i18n = I18N;

        $("#title").html(i18n["title"]);
        $("#start-new-game-button").html(i18n["start-new-game-button"]);
        $("#settings-button").html(i18n["settings-button"]);
        $("#new-game-team-name-input").attr("placeholder", i18n["new-game-team-name-input"]);
        $("#new-game-button").html(i18n["new-game-button"]);
        $("#new-game-back-button").html(i18n["back-button"]);
        $("#rounds-number-input-label").html(i18n["rounds-number-input-label"]);
        $("#time-number-input-label").html(i18n["time-number-input-label"]);
        $("#word-number-input-label").html(i18n["word-number-input-label"]);
        $("#extra-point-checkbox-label").html(i18n["extra-point-checkbox-label"]);
        $("#settings-back-button").html(i18n["back-button"]);
        $("#intermediate-area-instruction").html(i18n["intermediate-area-instruction"]);
        $("#continue-button").html(i18n["continue-button"]);
        $("#exit-button").html(i18n["exit-button"]);
        $("#winner-label").html(i18n["winner-label"]);
        $("#play-again-button").html(i18n["play-again-button"]);
        $("#score-settings-button").html(i18n["settings-button"]);
    });
}

// Every time a new translation is added, the name of the language needs to
// be added to this object in the following form:
// language-code: native-name
// (e.g. en: "English", es: "Español")
let languages = { // eslint-disable-line no-unused-vars
    en: "English",
    es: "Español",
};
