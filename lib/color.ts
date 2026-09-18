type ColorChannels = [number, number, number];

function parseColor(color: string): ColorChannels {
  const normalized = color.trim();
  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1);
    return [0, 2, 4].map((start) =>
      Number.parseInt(hex.slice(start, start + 2), 16),
    ) as ColorChannels;
  }

  const rgb = normalized.match(
    /^rgb\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*\)$/i,
  );
  if (!rgb) throw new Error(`Unsupported color format: ${color}`);
  return rgb.slice(1, 4).map(Number) as ColorChannels;
}

function formatHex(channels: ColorChannels): string {
  return `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

// RYB interpolation follows familiar paint mixing, where yellow and blue make green.
function rgbToRyb([redValue, greenValue, blueValue]: ColorChannels) {
  let red = redValue;
  let green = greenValue;
  let blue = blueValue;
  const white = Math.min(red, green, blue);
  red -= white;
  green -= white;
  blue -= white;
  const maxRgb = Math.max(red, green, blue);
  let yellow = Math.min(red, green);
  red -= yellow;
  green -= yellow;

  if (blue > 0 && green > 0) {
    blue /= 2;
    green /= 2;
  }

  yellow += green;
  blue += green;
  const maxRyb = Math.max(red, yellow, blue);
  if (maxRyb > 0) {
    const scale = maxRgb / maxRyb;
    red *= scale;
    yellow *= scale;
    blue *= scale;
  }

  return [red + white, yellow + white, blue + white] as ColorChannels;
}

function rybToRgb([redValue, yellowValue, blueValue]: ColorChannels) {
  let red = redValue;
  let yellow = yellowValue;
  let blue = blueValue;
  const white = Math.min(red, yellow, blue);
  red -= white;
  yellow -= white;
  blue -= white;
  const maxRyb = Math.max(red, yellow, blue);
  let green = Math.min(yellow, blue);
  yellow -= green;
  blue -= green;

  if (blue > 0 && green > 0) {
    blue *= 2;
    green *= 2;
  }

  red += yellow;
  green += yellow;
  const maxRgb = Math.max(red, green, blue);
  if (maxRgb > 0) {
    const scale = maxRyb / maxRgb;
    red *= scale;
    green *= scale;
    blue *= scale;
  }

  return [red + white, green + white, blue + white] as ColorChannels;
}

export function mixPaintColors(
  base: string,
  added: string,
  addedWeight = 0.5,
): string {
  if (addedWeight >= 1) return added.toLowerCase();
  if (addedWeight <= 0) return base.toLowerCase();

  const baseRyb = rgbToRyb(parseColor(base));
  const addedRyb = rgbToRyb(parseColor(added));
  const mixed = baseRyb.map(
    (channel, index) =>
      channel * (1 - addedWeight) + addedRyb[index] * addedWeight,
  ) as ColorChannels;
  return formatHex(rybToRgb(mixed));
}

function relativeLuminance(color: string): number {
  const [red, green, blue] = parseColor(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

export function getContrastForeground(color: string): '#000000' | '#ffffff' {
  // At this luminance, black and white have equal WCAG contrast ratios.
  return relativeLuminance(color) > 0.179 ? '#000000' : '#ffffff';
}
