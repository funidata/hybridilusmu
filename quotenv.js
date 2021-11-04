/**
 * Checks a string for problems.
 *
 * @param {string} str String to check
 * @returns {boolean} True if good, false if bad.
 */
const checkStr = (str) => {
    if (!str) {
        return false;
    }
    if (str.startsWith('"') || str.startsWith("'")) {
        return false;
    }
    if (str.endsWith('"') || str.endsWith("'")) {
        return false;
    }
    return true;
};

/**
 * Checks the given environment variables for unruly characters.
 *
 * @param {Array.<string>} varsToCheck The environment variables we're to check for problems
 * @returns {Object.<string, Array.<string>>} An object like { bad: ['FO', 'BA'], missing: ['ZO'] }
 */
const checkEnvSilent = (varsToCheck) => {
    const bad = [];
    const missing = [];
    for (let i = 0; i < varsToCheck.length; i += 1) {
        const chk = process.env[varsToCheck[i]];
        if (!chk) {
            missing.push(varsToCheck[i]);
            continue; // eslint-disable-line
        }
        if (!checkStr(chk)) {
            bad.push(varsToCheck[i]);
        }
    }
    return { bad, missing };
};

/**
 * Checks the given environment variables for unruly characters and logs
 * any encountered problems with console.log()
 *
 * @param {Array.<string>} varsToCheck The environment variables we're to check for problems
 * @returns {boolean} True if everything is alright, false if any problems were encountered.
 */
const checkEnv = (varsToCheck) => {
    const logAffected = (arr) => {
        console.log('  Affected environment variables:');
        arr.forEach((v) => {
            console.log(`    ${v}`);
        });
    };
    const envProblems = checkEnvSilent(varsToCheck);
    if (envProblems.missing.length > 0) {
        console.log('Some environment variables were missing. Things may break.');
        logAffected(envProblems.missing);
    }
    if (envProblems.bad.length > 0) {
        console.log('Some problematic environment variable values were detected.');
        console.log('Things _WILL_ break.');
        console.log('Please bear in mind that Docker does not play well with');
        console.log('quotation marks around variable definitions.');
        console.log('See e.g. https://docs.docker.com/compose/env-file/');
        logAffected(envProblems.bad);
    }
};

module.exports = {
    checkEnv,
    checkEnvSilent,
};
