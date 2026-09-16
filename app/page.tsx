'use client';

import { Button, ColorPicker, Tooltip } from '@mantine/core';
import { Moon, RotateCcw, Sun } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { darkenForNight, mixColors } from '../lib/color';

const SWATCHES = [
  '#ff4d6d',
  '#ff8a3d',
  '#ffd23f',
  '#69db7c',
  '#38bdf8',
  '#635bff',
  '#bd5cff',
];

const copy = {
  en: {
    chooseColor: 'Choose a color',
    pickerStep: '1. PICK A COLOR',
    hue: 'Choose a hue',
    shade: 'Choose a shade',
    eyebrow: 'MAKE A NEW COLOR',
    title: 'Mix some magic!',
    instruction: 'Pick a color, then tap the pipette to add one colorful drop.',
    addDrop: (color: string) => `Add a ${color} drop`,
    tap: '2. TAP TO DROP!',
    canvas: 'YOUR CANVAS',
    reset: 'Start over',
    resetHint: 'Start over with white',
    note: 'Every new drop blends 50/50 with your canvas.',
    day: 'Use day mode',
    night: 'Use night mode',
    english: 'Switch to English',
    russian: 'Switch to Russian',
    settings: 'Display settings',
    language: 'Language',
    theme: 'Theme',
  },
  ru: {
    chooseColor: 'Выбери цвет',
    pickerStep: '1. ВЫБЕРИ ЦВЕТ',
    hue: 'Выбери оттенок',
    shade: 'Выбери яркость цвета',
    eyebrow: 'СОЗДАЙ НОВЫЙ ЦВЕТ',
    title: 'Смешай немного магии!',
    instruction:
      'Выбери цвет, затем нажми на пипетку, чтобы добавить яркую каплю.',
    addDrop: (color: string) => `Добавить каплю цвета ${color}`,
    tap: '2. НАЖМИ И КАПНИ!',
    canvas: 'ТВОЙ ХОЛСТ',
    reset: 'Начать заново',
    resetHint: 'Начать заново с белого цвета',
    note: 'Каждая новая капля смешивается с холстом 50/50.',
    day: 'Включить дневной режим',
    night: 'Включить ночной режим',
    english: 'Переключить на английский',
    russian: 'Переключить на русский',
    settings: 'Настройки отображения',
    language: 'Язык',
    theme: 'Тема',
  },
} as const;

type Language = keyof typeof copy;
type Theme = 'day' | 'night';

function mixedDropLabel(count: number, language: Language) {
  if (language === 'en')
    return `${count} ${count === 1 ? 'DROP' : 'DROPS'} MIXED`;
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} КАПЕЛЬ СМЕШАНО`;
  if (last === 1) return `${count} КАПЛЯ СМЕШАНА`;
  if (last >= 2 && last <= 4) return `${count} КАПЛИ СМЕШАНЫ`;
  return `${count} КАПЕЛЬ СМЕШАНО`;
}

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
          fill="var(--panel)"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <path
          d="M62 109h55v40c0 10-8 17-17 17H79c-9 0-17-7-17-17v-40Z"
          fill={color}
        />
        <path
          d="M67 47V29c0-11 9-20 20-20h22c11 0 20 9 20 20v18"
          fill="var(--panel)"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="m76 171 14 35 14-35"
          fill="var(--panel)"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <path
          d="M69 109h41"
          stroke="currentColor"
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
  const [isDropping, setIsDropping] = useState(false);
  const [language, setLanguage] = useState<Language>('ru');
  const [theme, setTheme] = useState<Theme>('day');
  const dropSoundRef = useRef<HTMLAudioElement>(null);

  const text = copy[language];
  const displayedColor = useMemo(
    () =>
      theme === 'night' ? darkenForNight(backgroundColor) : backgroundColor,
    [backgroundColor, theme],
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const startDrop = () => {
    if (isDropping) return;
    setDropColor(pickedColor);
    setDropKey((key) => key + 1);
    setIsDropping(true);
  };

  const applyDrop = () => {
    const dropSound = dropSoundRef.current;
    if (dropSound) {
      dropSound.currentTime = 0;
      void dropSound.play().catch(() => undefined);
    }
    setBackgroundColor((current) => mixColors(current, dropColor));
    setMixCount((count) => count + 1);
  };

  const reset = () => {
    setBackgroundColor('#ffffff');
    setMixCount(0);
    setIsDropping(false);
  };

  return (
    <main
      className="playground"
      data-language={language}
      data-theme={theme}
      lang={language}
      style={{ backgroundColor: displayedColor }}
    >
      <header className="brand" aria-label="Colorific">
        <span className="brand-mark" aria-hidden="true">
          C
        </span>
        <span>COLORIFIC!</span>
      </header>

      <nav className="toolbar" aria-label={text.settings}>
        <div className="icon-switch" aria-label={text.language}>
          <button
            type="button"
            aria-label={text.english}
            aria-pressed={language === 'en'}
            onClick={() => setLanguage('en')}
          >
            🇬🇧
          </button>
          <button
            type="button"
            aria-label={text.russian}
            aria-pressed={language === 'ru'}
            onClick={() => setLanguage('ru')}
          >
            🇷🇺
          </button>
        </div>
        <div className="icon-switch" aria-label={text.theme}>
          <button
            type="button"
            aria-label={text.day}
            aria-pressed={theme === 'day'}
            onClick={() => setTheme('day')}
          >
            <Sun aria-hidden="true" size={20} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            aria-label={text.night}
            aria-pressed={theme === 'night'}
            onClick={() => setTheme('night')}
          >
            <Moon aria-hidden="true" size={19} strokeWidth={2.8} />
          </button>
        </div>
      </nav>

      <section className="picker-panel" aria-label={text.chooseColor}>
        <div className="picker-heading">
          <div>
            <span className="step-label">{text.pickerStep}</span>
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
          hueLabel={text.hue}
          saturationLabel={text.shade}
          value={pickedColor}
          onChange={setPickedColor}
          swatches={SWATCHES}
          swatchesPerRow={7}
        />
      </section>

      <section className="stage" aria-labelledby="play-title">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1 id="play-title">{text.title}</h1>
        <p className="instruction">{text.instruction}</p>

        <div className="drop-stage">
          <button
            className="pipette-button"
            type="button"
            disabled={isDropping}
            onClick={startDrop}
            aria-label={text.addDrop(pickedColor)}
          >
            <Pipette color={pickedColor} />
            <span>{text.tap}</span>
          </button>

          <div className="splash-zone" aria-hidden="true">
            {isDropping && (
              <div
                className="drop-animation"
                key={dropKey}
                style={{ '--drop': dropColor } as React.CSSProperties}
              >
                <span className="falling-drop" onAnimationEnd={applyDrop} />
                <span className="ripple ripple-one" />
                <span className="ripple ripple-two" />
                <span
                  className="ripple ripple-three"
                  onAnimationEnd={() => setIsDropping(false)}
                />
              </div>
            )}
            <span
              className="target-dot"
              style={{ background: displayedColor }}
            />
          </div>
        </div>

        <div className="result-card" aria-live="polite">
          <span className="result-dot" style={{ background: displayedColor }} />
          <div>
            <small>
              {mixCount === 0
                ? text.canvas
                : mixedDropLabel(mixCount, language)}
            </small>
            <strong>{displayedColor.toUpperCase()}</strong>
          </div>
        </div>
      </section>

      <Tooltip label={text.resetHint} position="left">
        <Button
          className="reset-button"
          color="dark"
          leftSection={<RotateCcw size={18} strokeWidth={2.5} />}
          onClick={reset}
          radius="xl"
          size="md"
          variant="white"
        >
          {text.reset}
        </Button>
      </Tooltip>

      <p className="mix-note">{text.note}</p>
      <audio ref={dropSoundRef} src="/waterdrop.mp3" preload="auto">
        <track kind="captions" src="/waterdrop.vtt" srcLang="zxx" />
      </audio>
    </main>
  );
}
