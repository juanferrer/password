/* globals $, debug */

let i18n = {};

/**
 * Perform I18N in the whole page for the specified language code
 * @param {String} languageCode [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
 */
function doI18N(languageCode) {
    if (!languageCode) languageCode = "en";
    $.getJSON(`i18n/${languageCode.toLowerCase()}.json`, I18N => {
        // Cache whatever language the user selected
        i18n = I18N;

        //$("#title").html(i18n["title"]);
    });
}

// Every time a new translation is added, the name of the language needs to
// be added to this object in the following form:
// language-code: native-name
// (e.g. en: "English", es: "Español")
let languages = {
    en: "English",
    es: "Español",
    ru: "Русский",
};
