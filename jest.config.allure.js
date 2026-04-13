module.exports = {
    preset: 'babel-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['allure-jest'],
    reporters: [
      'default',
      ['allure-jest', {
        resultsDir: './allure-results',
        cleanResultsDir: true,
      }]
    ],
  };