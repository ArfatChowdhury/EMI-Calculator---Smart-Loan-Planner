module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-native/all',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        'react-native/no-unused-styles': 'warn',
        'react-native/no-inline-styles': 'warn',
        'no-undef': 'error',
    }
};