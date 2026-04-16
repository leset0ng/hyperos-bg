import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BgEffectBackground } from "../src/index.js";
import "./styles.css";

type DeviceType = "PHONE" | "PAD";
type ColorScheme = "light" | "dark";

function getSystemColorScheme(): ColorScheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function App() {
  const [deviceType, setDeviceType] = useState<DeviceType>("PAD");
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getSystemColorScheme);
  const [isOs3Effect, setIsOs3Effect] = useState(true);
  const [dynamicBackground, setDynamicBackground] = useState(true);
  const [effectBackground, setEffectBackground] = useState(true);
  const [isFullSize, setIsFullSize] = useState(false);
  const [alphaValue, setAlphaValue] = useState(0.96);

  const summary = useMemo(
    () =>
      [
        deviceType,
        colorScheme,
        isOs3Effect ? "OS3 shader" : "OS2 shader",
        dynamicBackground ? "dynamic" : "static",
      ].join(" · "),
    [colorScheme, deviceType, dynamicBackground, isOs3Effect],
  );

  const jsxSnippet = useMemo(
    () =>
      [
        "<BgEffectBackground",
        `  dynamicBackground={${dynamicBackground}}`,
        `  effectBackground={${effectBackground}}`,
        `  isOs3Effect={${isOs3Effect}}`,
        `  isFullSize={${isFullSize}}`,
        `  deviceType="${deviceType}"`,
        `  colorScheme="${colorScheme}"`,
        `  alpha={() => ${alphaValue.toFixed(2)}}`,
        "  bgStyle={{ opacity: 1 }}",
        "/>",
      ].join("\n"),
    [
      alphaValue,
      colorScheme,
      deviceType,
      dynamicBackground,
      effectBackground,
      isFullSize,
      isOs3Effect,
    ],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateColorScheme = () => {
      setColorScheme(mediaQuery.matches ? "dark" : "light");
    };

    updateColorScheme();
    mediaQuery.addEventListener("change", updateColorScheme);

    return () => {
      mediaQuery.removeEventListener("change", updateColorScheme);
    };
  }, []);

  const reset = () => {
    setDeviceType("PAD");
    setColorScheme(getSystemColorScheme());
    setIsOs3Effect(true);
    setDynamicBackground(true);
    setEffectBackground(true);
    setIsFullSize(false);
    setAlphaValue(0.96);
  };

  return (
    <div className={`demo-page theme-${colorScheme}`}>
      <div className="demo-orb demo-orb--one" />
      <div className="demo-orb demo-orb--two" />

      <main className="demo-shell">
        <section className="hero-panel">
          <div className="hero-copy">
            <h1>HyperOS Background</h1>
          </div>

          <div className="hero-actions">
            <button className="ghost-button" type="button" onClick={reset}>
              Reset presets
            </button>
            <div className="hero-note">{summary}</div>
          </div>
        </section>

        <section className="studio-grid">
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
              <div className="segmented-grid">
                <button
                  className={colorScheme === "light" ? "is-active" : undefined}
                  type="button"
                  onClick={() => setColorScheme("light")}
                >
                  Light
                </button>
                <button
                  className={colorScheme === "dark" ? "is-active" : undefined}
                  type="button"
                  onClick={() => setColorScheme("dark")}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="control-stack">
              <label className="toggle-row">
                <span>
                  <strong>OS3 Effect</strong>
                  <small>Use the newer preset and shadow-rich shader path.</small>
                </span>
                <input
                  checked={isOs3Effect}
                  type="checkbox"
                  onChange={(event) => setIsOs3Effect(event.currentTarget.checked)}
                />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Dynamic Background</strong>
                  <small>Enable stage-based animated color transitions.</small>
                </span>
                <input
                  checked={dynamicBackground}
                  type="checkbox"
                  onChange={(event) => setDynamicBackground(event.currentTarget.checked)}
                />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Effect Background</strong>
                  <small>Turn off the shader contribution but keep the host layout.</small>
                </span>
                <input
                  checked={effectBackground}
                  type="checkbox"
                  onChange={(event) => setEffectBackground(event.currentTarget.checked)}
                />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Full Size</strong>
                  <small>Stretch the draw region instead of keeping the 0.78 crop.</small>
                </span>
                <input
                  checked={isFullSize}
                  type="checkbox"
                  onChange={(event) => setIsFullSize(event.currentTarget.checked)}
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
                  onChange={(event) => setAlphaValue(Number(event.currentTarget.value))}
                />
                <output>{alphaValue.toFixed(2)}</output>
              </div>
            </div>

            <pre className="code-card">{jsxSnippet}</pre>
          </aside>

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
                alpha={() => alphaValue}
                style={{ borderRadius: 40 }}
                bgStyle={{ opacity: 1, filter: isOs3Effect ? "saturate(1.02)" : "saturate(0.94)" }}
                content={() => (
                  <div className="preview-card">
                    <div className="preview-copy">
                      <h2>HyperOS Background</h2>
                    </div>
                  </div>
                )}
              />
            </div>
          </section>
        </section>
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
