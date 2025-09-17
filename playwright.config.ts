import { defineConfig, devices } from '@playwright/test';
import path from "path";

const _testResultsDir = path.resolve("./test-results");
const _codeCoverageDir = path.resolve("./coverage/playwright");

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/screenshots/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  // timout on CI needed a bit more for the first test run which waits for 'npm start'
  timeout: process.env.CI ? 60_000 : 30_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'], // Default Playwright test report
    ['list'], // console
    [
      // See https://github.com/cenfun/monocart-reporter => needed for test-coverage
      "monocart-reporter",
      {
        name: "Playwright Code-Coverage",
        outputFile: path.resolve(_testResultsDir, "monocart-report.html"), // not realy needed, but it's not optional.
        coverage: {
          outputDir: _codeCoverageDir, // all code coverage reports will be created in this dir.
          //reportPath: codeCoverageDir, // code coverage html report filepath which shows up in the monocart report under global attachments.
          reports: [
            [
              "v8", // a HTML reporter for the coverage
              {
                outputFile: "index.html", // v8 sub dir and html file name, relative to coverage.outputDir.
                inline: true, // inline all scripts required for the V8 html report into a single HTML file.
                metrics: ["lines"], // metrics is an Array<"bytes" | "functions" | "branches" | "lines">
              },
            ],
            [
              "console-summary", // for the console
              {
                metrics: ["lines"],
              },
            ],
            [
              "cobertura", // I'm not suie if needed
              {
                file: "coverage-playright.cobertura.xml",
              },
            ],
            [
              "lcovonly", // will be needed for sonar 
              {
                file: "coverage-playright.lcov.info",
              },
            ],
            [
              "json", // will be needed for sonar 
              {
                file: "coverage-playright.json",
              },
            ],
          ],
          sourceFilter: (sourcePath: string) => {
            // Only include files that are under the src folder.
            // Configure this filter accordingly to your app.
            //console.log('sourcePath: ' + sourcePath);
            return sourcePath.search(/src\//u) !== -1;
          },
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4200',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
