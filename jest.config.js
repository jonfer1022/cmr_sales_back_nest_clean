module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/main.ts',
    '!src/app.module.ts',
    '!src/**/*.module.{js,jsx,ts,tsx}',
    '!src/**/*.interface.{js,jsx,ts,tsx}',
    '!src/**/*.dto.{js,jsx,ts,tsx}',
    '!src/**/*.entity.{js,jsx,ts,tsx}',
    '!src/**/*.type.{js,jsx,ts,tsx}',
    '!src/**/prisma.*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
