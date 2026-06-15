module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
      diagnostics: {
        errorCodes: ["TS1343"],
      },
    },
  },
};
