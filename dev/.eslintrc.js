module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'airbnb-base',
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        indent: ['error', 4],
        'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
        'no-console': 'off',
        'no-empty': ['error', { allowEmptyCatch: true }],
        'max-len': ['error', { code: 130 }],
    },
};
