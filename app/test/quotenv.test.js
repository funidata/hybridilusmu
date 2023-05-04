const util = require('util'); // node required but whatever
const assert = require('assert');
const quotenv = require('../src/tools/quotenv');

let output = [];

const origlogger = console.log;
const hookedlogger = (...args) => {
    output.push(util.format(...args));
    return origlogger.apply(console, args);
};

describe('quotenv tests', function quotenvTests() {
    this.beforeEach(() => {
        console.log = hookedlogger;
        output = [];
        process.env = [];
    });

    this.afterEach(() => {
        console.log = origlogger;
    });

    it('unquoted string is fine', () => {
        assert.equal(quotenv.checkStr('foo'), true);
    });

    it('semi-quoted string is fine', () => {
        assert.equal(quotenv.checkStr('foo"bar'), true);
        assert.equal(quotenv.checkStr("foo'bar"), true);
    });

    it('half-quoted string is erroneus', () => {
        assert.equal(quotenv.checkStr('"foo'), false);
        assert.equal(quotenv.checkStr('foo"'), false);
        assert.equal(quotenv.checkStr("foo'"), false);
        assert.equal(quotenv.checkStr("'foo"), false);
    });

    it('fully quoted string is erroneus', () => {
        assert.equal(quotenv.checkStr('"foobar"'), false);
        assert.equal(quotenv.checkStr("'foobar'"), false);
    });

    it('empty string is erroneus', () => {
        assert.equal(quotenv.checkStr(''), false);
    });

    it('missing vars are caught', () => {
        const obj = quotenv.checkEnvSilent(['FOO']);
        assert.equal(obj.missing.length, 1);
        assert.equal(obj.missing[0], 'FOO');
    });

    it('bad vars are caught', () => {
        process.env.FOO = '"yup"';
        const obj = quotenv.checkEnvSilent(['FOO']);
        assert.equal(obj.bad.length, 1);
        assert.equal(obj.bad[0], 'FOO');
    });

    it('missing vars are output', () => {
        quotenv.checkEnv(['FOO']);
        assert.notEqual(output.find((line) => line.includes('FOO')), undefined);
        assert.notEqual(output.find((line) => line.includes('missing')), undefined);
    });

    it('bad vars are output', () => {
        process.env.FOO = '"nope.avi"';
        quotenv.checkEnv(['FOO']);
        assert.notEqual(output.find((line) => line.includes('FOO')), undefined);
        assert.notEqual(output.find((line) => line.includes('problematic')), undefined);
    });

    it('good stuff results in no output', () => {
        process.env.FOO = 'yeah.png';
        quotenv.checkEnv(['FOO']);
        assert.equal(output.length, 0);
    });
});
