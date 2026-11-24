import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testMatch: ['course-checkout.spec.js', 'google-tab.spec.js'],
  timeout: 60_000,
  outputDir: '../artifacts/course-checkout/results',
  reporter: [['list'], ['html', { outputFolder: '../artifacts/course-checkout/report', open: 'never' }]]
});
