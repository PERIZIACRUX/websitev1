import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@crux-perizia/shared$": "<rootDir>/../shared/src",
    "^server-only$": "<rootDir>/tests/setup.ts",
    "^jose$": "<rootDir>/tests/__mocks__/jose.js"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};

export default config;
