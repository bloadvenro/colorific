export function mixColors(base: string, added: string): string {
  const parse = (hex: string) => {
    const normalized = hex.replace('#', '');
    return [0, 2, 4].map((start) =>
      Number.parseInt(normalized.slice(start, start + 2), 16),
    );
  };

  const baseRgb = parse(base);
  const addedRgb = parse(added);
  const mixed = baseRgb.map((channel, index) =>
    Math.round((channel + addedRgb[index]) / 2),
  );
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
