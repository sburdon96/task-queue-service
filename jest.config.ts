import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.json',
        }],
      },
    testMatch: ['**/?(*.)+(spec).ts'],
    clearMocks: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
};

export default config;
