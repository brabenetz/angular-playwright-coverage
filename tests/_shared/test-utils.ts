import { expect, Locator, Page, test } from '@playwright/test';
import * as fs from 'fs';

// recursive typescript Type for Json read from json files:
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

type ScreenshotOptions = {
  locator?: Locator,
  masks?: Locator[],
  skipWaitForLoad?: boolean,
}

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonArray = Array<JsonValue>;
export type Json = JsonObject | JsonArray;

export class TestUtils {
  private static mockFilesRootPath = 'wiremock/files/__files';

  /**
   * Helper Method to read binary file from project-root-path '/tests/data'.
   */
  public static readFile(filename: string): Buffer {
    const bitmap = fs.readFileSync(`${TestUtils.mockFilesRootPath}/${filename}`);
    return Buffer.from(bitmap);
  }

  /**
   * Helper Method to read json file from project-root-path '/tests/data' and parse it to an object.
   * @return Object or Array
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  public static readObjectFromFile(filename: string): Json {
    const fileContent = TestUtils.readFile(filename).toString();
    return <Json>JSON.parse(fileContent);
  }

  /**
   * Return a css property by locator element.
   * Example Usage:
   * <pre>
   *   expect.soft(await TestUtils.getCssPropertyValue(getByTestIds(page, 'some-icon'), 'color')).toEqual('rgb(0, 82, 158)');
   * </pre>
   */
  public static async getCssPropertyValue(locator: Locator, property: string): Promise<string> {
    return await locator.evaluate((element, args) => window.getComputedStyle(element).getPropertyValue(args.property), { property });
  }

  /**
   * Make Screenshots, and when env.SCREENSHOT_VALIDATION is set, also make a screenshot-compare.
   */
  public static async makePageScreenshot(page: Page, name: string, options: ScreenshotOptions = {}): Promise<void> {
    await test.step('Make Screenshot', async () => {
      const locator = options?.locator || page;

      if (!(options?.skipWaitForLoad)) {
        await TestUtils.waitForLoad(page);
      }

      const screenshot = await locator.screenshot({
        fullPage: true,
        animations: 'disabled',
      });

      test.info().attachments.push({
        name,
        contentType: 'image/png',
        body: screenshot,
      });

      // make screen-compare update BEFORE library updates (angular, bootstrap, styling). After the update you will see every pixel change
      if (process.env.SCREENSHOT_VALIDATION === 'true') {
        // full validation of current page (only local, should warn if something changes)
        // Is also useful to track changes over git.
        await expect.soft(locator).toHaveScreenshot({
          fullPage: true,
          animations: 'disabled',
          // stylePath: './tests/lib/screenshots-without-hover.css', // deactivate tooltips, and other hover elements.
          mask: options.masks ? [...options.masks] : [],
        });
      }
    });
  }

  public static async waitForLoad(page: Page): Promise<void> {
    try {
      // wait for backend-calls are finished:
      await page.waitForLoadState('networkidle');
      // wait that no material-spinner is shown anymore:
      // await page.waitForSelector('mat-spinner', { state: 'hidden', timeout: 5000 });
    } catch (error) {
      console.warn('Spinner did not fade out within the expected time.');
    }
  }
}
