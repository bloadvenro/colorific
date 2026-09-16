'use client';

import { Button, ColorPicker, Tooltip } from '@mantine/core';
import { RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { mixColors } from '../lib/color';

const SWATCHES = [
  '#ff4d6d',
  '#ff8a3d',
  '#ffd23f',
  '#69db7c',
  '#38bdf8',
  '#635bff',
  '#bd5cff',
];

function Pipette({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pipette"
      viewBox="0 0 190 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="rotate(-12 95 110)">
        <path
          d="M88 47h48v31l-13 15v56c0 13-10 23-23 23H79c-13 0-23-10-23-23V93L43 78V47h45Z"
          fill="#fff"
          stroke="#17233f"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <path
          d="M62 109h55v40c0 10-8 17-17 17H79c-9 0-17-7-17-17v-40Z"
          fill={color}
        />
        <path
          d="M67 47V29c0-11 9-20 20-20h22c11 0 20 9 20 20v18"
          fill="#fff"
          stroke="#17233f"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="m76 171 14 35 14-35"
          fill="#fff"
          stroke="#17233f"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <path
          d="M69 109h41"
          stroke="#17233f"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <circle cx="80" cy="127" r="6" fill="white" opacity=".72" />
      </g>
    </svg>
  );
}

export default function Home() {
  const [pickedColor, setPickedColor] = useState('#ff4d6d');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [dropColor, setDropColor] = useState('#ff4d6d');
  const [dropKey, setDropKey] = useState(0);
  const [mixCount, setMixCount] = useState(0);
  const colorName = useMemo(
    () => backgroundColor.toUpperCase(),
    [backgroundColor],
  );

  const addDrop = () => {
    setDropColor(pickedColor);
    setDropKey((key) => key + 1);
    setBackgroundColor((current) => mixColors(current, pickedColor));
    setMixCount((count) => count + 1);
  };

  const reset = () => {
    setBackgroundColor('#ffffff');
    setMixCount(0);
  };

  return (
    <main className="playground" style={{ backgroundColor }}>
      <header className="brand" aria-label="Colorific">
        <span className="brand-mark" aria-hidden="true">
          C
        </span>
        <span>COLORIFIC!</span>
      </header>

      <section className="picker-panel" aria-label="Choose a color">
        <div className="picker-heading">
          <div>
            <span className="step-label">1. PICK A COLOR</span>
            <strong>{pickedColor.toUpperCase()}</strong>
          </div>
          <span
            className="selected-swatch"
            style={{ background: pickedColor }}
          />
        </div>
        <ColorPicker
          className="color-picker"
          format="hex"
          fullWidth
          hueLabel="Choose a hue"
          saturationLabel="Choose a shade"
          value={pickedColor}
          onChange={setPickedColor}
          swatches={SWATCHES}
          swatchesPerRow={7}
        />
      </section>

      <section className="stage" aria-labelledby="play-title">
        <p className="eyebrow">MAKE A NEW COLOR</p>
        <h1 id="play-title">Mix some magic!</h1>
        <p className="instruction">
          Pick a color, then tap the pipette to add one colorful drop.
        </p>

        <div className="drop-stage">
          <button
            className="pipette-button"
            type="button"
            onClick={addDrop}
            aria-label={`Add a ${pickedColor} drop`}
          >
            <Pipette color={pickedColor} />
            <span>2. TAP TO DROP!</span>
          </button>

          <div className="splash-zone" aria-hidden="true">
            {dropKey > 0 && (
              <div
                className="drop-animation"
                key={dropKey}
                style={{ '--drop': dropColor } as React.CSSProperties}
              >
                <span className="falling-drop" />
                <span className="ripple ripple-one" />
                <span className="ripple ripple-two" />
                <span className="ripple ripple-three" />
              </div>
            )}
            <span
              className="target-dot"
              style={{ background: backgroundColor }}
            />
          </div>
        </div>

        <div className="result-card" aria-live="polite">
          <span
            className="result-dot"
            style={{ background: backgroundColor }}
          />
          <div>
            <small>
              {mixCount === 0
                ? 'YOUR CANVAS'
                : `${mixCount} ${mixCount === 1 ? 'DROP' : 'DROPS'} MIXED`}
            </small>
            <strong>{colorName}</strong>
          </div>
        </div>
      </section>

      <Tooltip label="Start over with white" position="left">
        <Button
          className="reset-button"
          color="dark"
          leftSection={<RotateCcw size={18} strokeWidth={2.5} />}
          onClick={reset}
          radius="xl"
          size="md"
          variant="white"
        >
          Start over
        </Button>
      </Tooltip>

      <p className="mix-note">Every new drop blends 50/50 with your canvas.</p>
    </main>
  );
}
