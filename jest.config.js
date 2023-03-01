require('dotenv').config();
const {pathsToModuleNameMapper} = require('ts-jest/utils');
const {compilerOptions} = require('./tsconfig');

module.exports = {
    automock: false,
    collectCoverage: true,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'}),
    modulePaths: ['__test__'],
    preset: 'ts-jest/presets/js-with-ts',
    setupFiles: ['jest-date-mock', './__test__/setup.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/.cache/', '/cypress', '__test__/setup.ts'],
    testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.(jsx?|ts?|tsx?)$',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {presets: ['next/babel']}]
    },
    verbose: true
};
