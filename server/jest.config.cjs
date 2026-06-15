module.exports = {
  projects: ["<rootDir>"],
  reporters: ["default", "jest-junit"],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/build/"],
  coverageReporters: ["lcov"],
  transform: {
    "^.+\\.ts?$": ["ts-jest", {
      tsconfig: {
        module: "commonjs",
        moduleResolution: "node",
        target: "es2017",
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        strict: true,
        skipLibCheck: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        isolatedModules: true,
        forceConsistentCasingInFileNames: true,
        outDir: "build",
        rootDir: "..",
        types: ["jest", "node"],
        lib: ["esnext"],
      },
    }],
  },
  testPathIgnorePatterns: ["/node-modules/", "/build/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
