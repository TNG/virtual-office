module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/[^/]+/node_modules/)?(?:uuid|chai)/)",
  ],
  transform: {
    "^.+\\.[jt]sx?$": ["ts-jest", {
      tsconfig: "tsconfig.test.json",
      diagnostics: {
        errorCodes: ["TS1343"],
      },
    }],
  },
};
