import { FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  console.log('Starting global setup for Playwright tests');

  process.env.TEST_ENV = 'e2e';

  console.log('Global setup complete');
}

export default globalSetup;
