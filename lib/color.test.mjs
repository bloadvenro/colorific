import assert from 'node:assert/strict';
import test from 'node:test';

import { getContrastForeground, mixPaintColors } from './color.ts';

test('yellow and blue mix into green like paint', () => {
  assert.equal(mixPaintColors('#ffff00', '#0000ff', 0.5), '#008000');
});

test('the first drop keeps its canonical picked color', () => {
  assert.equal(mixPaintColors('#ffffff', '#FF4D6D', 1), '#ff4d6d');
});

test('contrast foreground stays readable on light and dark canvas colors', () => {
  assert.equal(getContrastForeground('#ffffff'), '#000000');
  assert.equal(getContrastForeground('#ffd23f'), '#000000');
  assert.equal(getContrastForeground('#000000'), '#ffffff');
  assert.equal(getContrastForeground('#635bff'), '#ffffff');
  assert.equal(getContrastForeground('rgb(255, 255, 255)'), '#000000');
  assert.throws(
    () => getContrastForeground('rgba(0, 0, 0, 0.5)'),
    /Unsupported color format/,
  );
});
