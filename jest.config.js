module.exports = {
    transform: {
        "^.+\\.jsx?$": "babel-jest",
        '\\.(jpg|jpeg)$':
        '<rootDir>/fileTransformer.js',
    },
    testEnvironment: 'jsdom'
}