/* eslint-disable no-console */

let debug = {
    dev: true,
    log: m => {
        if (this.dev) console.log(m);
    },
    warn: m => {
        console.alert(m);
    },
    error: m => {
        console.error(m);
    }
};
