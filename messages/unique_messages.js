/**
 * this file contains messages (outputs to user) based on language
 */

exports.alreadyTaken = (lang) => {
    if (lang == 'fr') {
        return `deja utilise`
    }
    else if (lang == 'ar') {
        return `arabic`
    }
    else {
        return `already taken`
    }
}

