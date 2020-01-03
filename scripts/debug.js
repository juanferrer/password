/* eslint-disable no-console */

let debug = {
    dev: true,
    log: m => {
        if (debug.dev) console.log(m);
    },
    warn: m => {
        alert(m);
    },
    error: m => {
        console.error(m);
    }
};
