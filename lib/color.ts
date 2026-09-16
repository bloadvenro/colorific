type ColorChannels = [number, number, number];

function parseHex(hex: string): ColorChannels {
  const normalized = hex.replace('#', '');
  return [0, 2, 4].map((start) =>
    Number.parseInt(normalized.slice(start, start + 2), 16),
  ) as ColorChannels;
}

function formatHex(channels: ColorChannels): string {
  return `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

export function mixColors(
  base: string,
  added: string,
  addedWeight = 0.5,
): string {
  const baseRgb = parseHex(base);
  const addedRgb = parseHex(added);
  const mixed = baseRgb.map((channel, index) =>
    Math.round(channel * (1 - addedWeight) + addedRgb[index] * addedWeight),
  ) as ColorChannels;
  return formatHex(mixed);
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

  const baseRyb = rgbToRyb(parseHex(base));
  const addedRyb = rgbToRyb(parseHex(added));
  const mixed = baseRyb.map(
    (channel, index) =>
      channel * (1 - addedWeight) + addedRyb[index] * addedWeight,
  ) as ColorChannels;
  return formatHex(rybToRgb(mixed));
}

export function darkenForNight(color: string): string {
  return mixColors('#071127', color, 0.28);
}
