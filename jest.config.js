module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^phaser$': '<rootDir>/node_modules/phaser/dist/phaser.js'
  },
  moduleDirectories: ['node_modules', 'tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts']
};
