const path = require('path');
const fs = require('fs');

/**
 * it can create a directory and sub directory automatically
 * use it like createDirectory('uploads') or createDirectory('uploads/users')
 */
exports.createDirectory = (targetDir, { isRelativeToScript = false } = {}) => {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = appRootPath + '/'

    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code == 'EEXIST') { // curDir already exists!
                return curDir;
            }
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code == 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }
            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir == path.resolve(targetDir)) {
                throw err; // Throw if it's just the last created dir.
            }
        }
        return curDir;
    }, initDir);
}


//get the name of the model based on route file
//how to use const modelName = require(`${appRootPath}/tools/files`).modelName(__filename)
exports.getName = (filename, casing, route) => {
    let myModel = ''
    myModel = filename.slice(filename.lastIndexOf('/') + 1, -3)
    if (route)
        myModel = filename.slice(filename.lastIndexOf('/') + 1, -9)
    if (casing && casing == 'low') return myModel
    myModel = myModel.charAt(0).toUpperCase() + myModel.substring(1)
    return myModel
}