import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';
export default defineConfig({
  ...base,
  testMatch: 'community.spec.js',
  timeout: 60_000,
  outputDir: '../artifacts/community/results',
  reporter: [['list'], ['html', { outputFolder: '../artifacts/community/report', open: 'never' }]]
});
