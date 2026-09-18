import { expect, test, type Locator, type Page } from '@playwright/test';

function hexToRgb(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}

function parseRgb(color: string): number[] {
  const channels = color
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported RGB color: ${color}`);
  }
  return channels;
}

function relativeLuminance(color: string): number {
  const [red, green, blue] = parseRgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const luminances = [relativeLuminance(first), relativeLuminance(second)];
  return (Math.max(...luminances) + 0.05) / (Math.min(...luminances) + 0.05);
}

async function addDrop(page: Page, color: string) {
  const dropButton = page.getByTestId('drop-button');

  await page.getByLabel(color, { exact: true }).click();
  await expect(dropButton).toHaveAttribute(
    'aria-label',
    new RegExp(color, 'i'),
  );
  await dropButton.click();
  await expect(dropButton).toBeDisabled();
  await expect(dropButton).toBeEnabled({ timeout: 5_000 });
}

async function getBackgroundColor(locator: Locator) {
  return locator.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
}

async function getCanvasSnapshot(page: Page) {
  const resultHex = (await page.getByTestId('result-hex').innerText()).trim();

  return {
    resultHex,
    canvasBackground: await getBackgroundColor(page.getByTestId('canvas')),
    targetDotColor: await page
      .getByTestId('target-dot')
      .evaluate((element) => (element as HTMLElement).style.backgroundColor),
    resultDotColor: await page
      .getByTestId('result-dot')
      .evaluate((element) => (element as HTMLElement).style.backgroundColor),
  };
}

test('theme changes chrome without changing the mixed canvas color', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('result-hex')).toHaveText('#FFFFFF');

  await addDrop(page, '#ffd23f');
  await expect(page.getByTestId('result-hex')).toHaveText('#FFD23F');

  await addDrop(page, '#635bff');
  await expect(page.getByTestId('result-hex')).not.toHaveText('#FFD23F');

  const baseline = await getCanvasSnapshot(page);
  const expectedRgb = hexToRgb(baseline.resultHex);
  expect(baseline.canvasBackground).toBe(expectedRgb);
  expect(baseline.targetDotColor).toBe(expectedRgb);
  expect(baseline.resultDotColor).toBe(expectedRgb);

  const pickerPanel = page.getByTestId('picker-panel');
  const dayPanelBackground = await getBackgroundColor(pickerPanel);

  await page.getByTestId('night-theme').click();
  await expect(page.getByTestId('night-theme')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect
    .poll(() => getBackgroundColor(pickerPanel))
    .not.toBe(dayPanelBackground);
  expect(await getCanvasSnapshot(page)).toEqual(baseline);

  await page.getByTestId('day-theme').click();
  await expect(page.getByTestId('day-theme')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect
    .poll(() => getBackgroundColor(pickerPanel))
    .toBe(dayPanelBackground);
  expect(await getCanvasSnapshot(page)).toEqual(baseline);
});

test('canvas foreground remains readable throughout a dark-color transition', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const saturation = page.locator(
    '.color-picker .mantine-ColorPicker-saturation',
  );
  const bounds = await saturation.boundingBox();
  if (!bounds) throw new Error('Saturation field is not visible');
  await saturation.click({
    position: { x: bounds.width / 2, y: bounds.height - 1 },
  });

  const dropButton = page.getByTestId('drop-button');
  await expect
    .poll(async () => {
      const currentLabel = await dropButton.getAttribute('aria-label');
      const currentHex = currentLabel?.match(/#[0-9a-f]{6}/i)?.[0];
      return currentHex
        ? Math.max(...parseRgb(hexToRgb(currentHex)))
        : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(16);
  const label = await dropButton.getAttribute('aria-label');
  const selectedHex = label?.match(/#[0-9a-f]{6}/i)?.[0];
  if (!selectedHex)
    throw new Error('Selected color is missing from drop label');
  expect(Math.max(...parseRgb(hexToRgb(selectedHex)))).toBeLessThan(16);

  await dropButton.click();
  await expect(page.getByTestId('result-hex')).toHaveText(
    selectedHex.toUpperCase(),
  );

  const samples = await page.getByTestId('canvas').evaluate(
    (canvas) =>
      new Promise<Array<{ background: string; foreground: string }>>(
        (resolve) => {
          const captured: Array<{
            background: string;
            foreground: string;
          }> = [];
          const startedAt = performance.now();
          const sample = () => {
            const styles = getComputedStyle(canvas);
            captured.push({
              background: styles.backgroundColor,
              foreground: styles.color,
            });

            if (performance.now() - startedAt < 1_100) {
              requestAnimationFrame(sample);
            } else {
              resolve(captured);
            }
          };
          requestAnimationFrame(sample);
        },
      ),
  );

  const finalBackground = hexToRgb(selectedHex);
  expect(
    samples.some(
      ({ background }) =>
        background !== 'rgb(255, 255, 255)' && background !== finalBackground,
    ),
  ).toBe(true);
  for (const { background, foreground } of samples) {
    expect(contrastRatio(background, foreground)).toBeGreaterThanOrEqual(4.5);
  }
});
