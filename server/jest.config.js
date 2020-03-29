module.exports = {
  projects: ["src"],
  reporters: ["default", "jest-junit"],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/build/"],
  coverageReporters: ["lcov"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
