import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BgEffectBackground } from "../src/index.js";
import type { BgEffectColors } from "../src/index.js";
import "./styles.css";

const GITHUB_REPO_URL = "https://github.com/leset0ng/hyperos-bg";
const NPM_PACKAGE_URL = "https://www.npmjs.com/package/hyperos-bg";

type DeviceType = "PHONE" | "PAD";
type ColorScheme = "light" | "dark";
type RgbaColor = [number, number, number, number];

type CustomPalette = {
  name: string;
  swatches: RgbaColor[];
  colors: BgEffectColors;
};

function toColorStage(swatches: RgbaColor[]): number[] {
  return swatches.flatMap((color) => [...color]);
}

function makePalette(name: string, swatches: RgbaColor[]): CustomPalette {
  const stage = toColorStage(swatches);
  return { name, swatches, colors: { colors1: stage, colors2: stage, colors3: stage } };
}

const CUSTOM_PALETTES: CustomPalette[] = [
  makePalette("Aurora", [
    [0.55, 0.36, 0.96, 0.9],
    [0.93, 0.28, 0.6, 0.9],
    [0.23, 0.51, 0.96, 0.9],
    [0.96, 0.62, 0.04, 0.9],
  ]),
  makePalette("Mint", [
    [0.06, 0.72, 0.51, 0.9],
    [0.2, 0.83, 0.6, 0.9],
    [0.02, 0.71, 0.83, 0.9],
    [0.05, 0.65, 0.91, 0.9],
  ]),
  makePalette("Sunset", [
    [0.98, 0.45, 0.09, 0.9],
    [0.98, 0.75, 0.14, 0.9],
    [0.94, 0.27, 0.27, 0.9],
    [0.93, 0.28, 0.6, 0.9],
  ]),
  makePalette("Glacier", [
    [0.22, 0.74, 0.97, 0.9],
    [0.51, 0.55, 0.97, 0.9],
    [0.65, 0.71, 0.99, 0.9],
    [0.49, 0.83, 0.99, 0.9],
  ]),
];

const toSnippetStage = (stage: number[]) => {
  const lines: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const color = stage
      .slice(i * 4, i * 4 + 4)
      .map((value) => value.toFixed(2))
      .join(", ");
    lines.push(`      ${color}, // blob ${i + 1}`);
  }
  return lines.join("\n");
};

function getSystemColorScheme(): ColorScheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function App() {
  const [deviceType, setDeviceType] = useState<DeviceType>("PAD");
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getSystemColorScheme());
  const [followsSystem, setFollowsSystem] = useState(true);
  const [isOs3Effect, setIsOs3Effect] = useState(true);
  const [dynamicBackground, setDynamicBackground] = useState(true);
  const [effectBackground, setEffectBackground] = useState(true);
  const [isFullSize, setIsFullSize] = useState(false);
  const [alphaValue, setAlphaValue] = useState(0.96);
  const [customColors, setCustomColors] = useState<BgEffectColors | null>(null);
  const [copied, setCopied] = useState(false);

  const summary = useMemo(
    () =>
      [
        deviceType,
        colorScheme,
        isOs3Effect ? "OS3" : "OS2",
        dynamicBackground ? "dynamic" : "static",
      ].join(" · "),
    [colorScheme, deviceType, dynamicBackground, isOs3Effect],
  );

  const jsxSnippet = useMemo(() => {
    const lines = [
      "<BgEffectBackground",
      `  dynamicBackground={${dynamicBackground}}`,
      `  effectBackground={${effectBackground}}`,
      `  isOs3Effect={${isOs3Effect}}`,
      `  isFullSize={${isFullSize}}`,
      `  deviceType="${deviceType}"`,
      `  colorScheme="${colorScheme}"`,
      `  alpha={() => ${alphaValue.toFixed(2)}}`,
    ];
    if (customColors) {
      lines.push(
        "  colors={{",
        `    colors1: [\n${toSnippetStage(customColors.colors1)}\n    ],`,
        `    colors2: [\n${toSnippetStage(customColors.colors2)}\n    ],`,
        `    colors3: [\n${toSnippetStage(customColors.colors3)}\n    ],`,
        "  }}",
      );
    }
    lines.push("  bgStyle={{ opacity: 1 }}", "/>");
    return lines.join("\n");
  }, [
    alphaValue,
    colorScheme,
    customColors,
    deviceType,
    dynamicBackground,
    effectBackground,
    isFullSize,
    isOs3Effect,
  ]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsxSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (followsSystem) setColorScheme(mq.matches ? "dark" : "light");
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [followsSystem]);

  const applyManual = (next: ColorScheme) => {
    setFollowsSystem(false);
    setColorScheme(next);
  };

  const applySystem = () => {
    setFollowsSystem(true);
    setColorScheme(getSystemColorScheme());
  };

  const reset = () => {
    setDeviceType("PAD");
    setFollowsSystem(true);
    setColorScheme(getSystemColorScheme());
    setIsOs3Effect(true);
    setDynamicBackground(true);
    setEffectBackground(true);
    setIsFullSize(false);
    setAlphaValue(0.96);
    setCustomColors(null);
  };

  return (
    <div className={`demo-page theme-${colorScheme}`}>
      <div className="demo-orb demo-orb--one" />
      <div className="demo-orb demo-orb--two" />

      <main className="demo-shell">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-kicker">React Component</span>
            <h1>HyperOS Background</h1>
            <p>
              Silky WebGL backgrounds inspired by HyperOS. Drop-in canvas animation for React apps.
            </p>
          </div>

          <div className="hero-actions">
            <button className="ghost-button" type="button" onClick={reset}>
              Reset presets
            </button>
            <div className="hero-note">{summary}</div>
          </div>
        </section>

        <section className="studio-grid">
          <section className="preview-column">
            <div className="preview-frame">
              <BgEffectBackground
                className="preview-background"
                dynamicBackground={dynamicBackground}
                isFullSize={isFullSize}
                effectBackground={effectBackground}
                colorScheme={colorScheme}
                isOs3Effect={isOs3Effect}
                deviceType={deviceType}
                colors={customColors ?? undefined}
                alpha={() => alphaValue}
                style={{ borderRadius: "var(--radius-md)" }}
                bgStyle={{ opacity: 1 }}
                content={() => (
                  <div className="preview-card">
                    <h2>HyperOS Background</h2>
                  </div>
                )}
              />
            </div>
          </section>

          <aside className="control-column">
            <div className="control-section">
              <div className="section-heading">
                <span>Device</span>
                <strong>Shape preset</strong>
              </div>
              <div className="segmented-grid">
                <button
                  className={deviceType === "PHONE" ? "is-active" : undefined}
                  type="button"
                  onClick={() => setDeviceType("PHONE")}
                >
                  PHONE
                </button>
                <button
                  className={deviceType === "PAD" ? "is-active" : undefined}
                  type="button"
                  onClick={() => setDeviceType("PAD")}
                >
                  PAD
                </button>
              </div>
            </div>

            <div className="control-section">
              <div className="section-heading">
                <span>Theme</span>
                <strong>Surface mood</strong>
              </div>
              <div className="segmented-grid segmented-grid--3">
                <button
                  className={!followsSystem && colorScheme === "light" ? "is-active" : undefined}
                  type="button"
                  onClick={() => applyManual("light")}
                >
                  Light
                </button>
                <button
                  className={!followsSystem && colorScheme === "dark" ? "is-active" : undefined}
                  type="button"
                  onClick={() => applyManual("dark")}
                >
                  Dark
                </button>
                <button
                  className={followsSystem ? "is-active" : undefined}
                  type="button"
                  onClick={applySystem}
                >
                  System
                </button>
              </div>
            </div>

            <div className="control-stack">
              <label className="toggle-row">
                <span>
                  <strong>OS3 Effect</strong>
                  <small>Use the newer OS3 preset and shader.</small>
                </span>
                <input
                  checked={isOs3Effect}
                  type="checkbox"
                  onChange={(e) => setIsOs3Effect(e.currentTarget.checked)}
                />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Dynamic Background</strong>
                  <small>Animate color transitions between stages.</small>
                </span>
                <input
                  checked={dynamicBackground}
                  type="checkbox"
                  onChange={(e) => setDynamicBackground(e.currentTarget.checked)}
                />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Effect Background</strong>
                  <small>Toggle the shader on or off.</small>
                </span>
                <input
                  checked={effectBackground}
                  type="checkbox"
                  onChange={(e) => setEffectBackground(e.currentTarget.checked)}
                />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Full Size</strong>
                  <small>Stretch to full height instead of 78% crop.</small>
                </span>
                <input
                  checked={isFullSize}
                  type="checkbox"
                  onChange={(e) => setIsFullSize(e.currentTarget.checked)}
                />
              </label>
            </div>

            <div className="control-section control-section--range">
              <div className="section-heading">
                <span>Intensity</span>
                <strong>Alpha</strong>
              </div>
              <div className="range-shell">
                <input
                  max="1"
                  min="0"
                  step="0.01"
                  type="range"
                  value={alphaValue}
                  onChange={(e) => setAlphaValue(Number(e.currentTarget.value))}
                />
                <output>{alphaValue.toFixed(2)}</output>
              </div>
            </div>

            <div className="control-section control-section--palette">
              <div className="section-heading">
                <span>Custom</span>
                <strong>Colors</strong>
              </div>
              <div className="palette-grid">
                {CUSTOM_PALETTES.map((palette) => {
                  const active = customColors === palette.colors;
                  return (
                    <button
                      key={palette.name}
                      aria-pressed={active}
                      className={`palette-chip${active ? " is-active" : ""}`}
                      type="button"
                      onClick={() => setCustomColors(active ? null : palette.colors)}
                    >
                      <span className="palette-dots">
                        {palette.swatches.map((color, index) => (
                          <span
                            key={index}
                            className="palette-dot"
                            style={{
                              background: `rgb(${Math.round(color[0] * 255)}, ${Math.round(
                                color[1] * 255,
                              )}, ${Math.round(color[2] * 255)})`,
                            }}
                          />
                        ))}
                      </span>
                      <small>{palette.name}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="code-card-wrap">
              <button
                className="code-copy"
                type="button"
                onClick={handleCopy}
                aria-label="Copy code"
              >
                {copied ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre className="code-card">{jsxSnippet}</pre>
            </div>
          </aside>
        </section>

        <footer className="demo-footer">
          <div className="info-panel">
            <div className="section-heading">
              <span>Install</span>
              <strong>Package setup</strong>
            </div>
            <div className="info-card">
              <code>pnpm add hyperos-bg</code>
              <small>Also available with npm install hyperos-bg</small>
            </div>
          </div>

          <div className="info-actions">
            <a className="info-action" href={NPM_PACKAGE_URL} target="_blank" rel="noreferrer">
              Open npm package
            </a>
            <a
              className="info-action info-action--ghost"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
