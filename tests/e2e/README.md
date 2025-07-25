# E2E Tests for Tower Defense Game

This directory contains end-to-end tests for the Tower Defense game using Playwright.

## Running Tests

To run the tests, use the following commands:

```bash
# Run all tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

## Test Structure

- `game.spec.ts` - Basic tests for game loading and display
- `gameplay.spec.ts` - Tests for game interactions and mechanics
- `performance.spec.ts` - Tests for game performance
- `helpers.ts` - Utility functions for tests
- `global-setup.ts` - Global setup for tests

## Notes

- Tests will automatically start a local development server
- Test results are stored in the `test-results` directory (should be added to .gitignore)
- Screenshots and videos are captured on test failures
