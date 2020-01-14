/* eslint-disable no-console */

let debug = {
    isDev: true,
    isWeb: true,
    log: m => {
        if (debug.isDev) console.log(m);
    },
    warn: m => {
        alert(m);
    },
    error: m => {
        console.error(m);
    }
};
