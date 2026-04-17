import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BgEffectBackground } from "../src/index.js";
import "./styles.css";

const GITHUB_REPO_URL = "https://github.com/leset0ng/hyperos-bg";
const NPM_PACKAGE_URL = "https://www.npmjs.com/package/hyperos-bg";

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
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getSystemColorScheme());
  const [followsSystemColorScheme, setFollowsSystemColorScheme] = useState(true);
  const [isOs3Effect, setIsOs3Effect] = useState(true);
  const [dynamicBackground, setDynamicBackground] = useState(true);
  const [effectBackground, setEffectBackground] = useState(true);
  const [isFullSize, setIsFullSize] = useState(false);
  const [alphaValue, setAlphaValue] = useState(0.96);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);

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
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateColorScheme = () => {
      if (!followsSystemColorScheme) {
        return;
      }
      setColorScheme(mediaQuery.matches ? "dark" : "light");
    };

    updateColorScheme();
    mediaQuery.addEventListener("change", updateColorScheme);

    return () => {
      mediaQuery.removeEventListener("change", updateColorScheme);
    };
  }, [followsSystemColorScheme]);

  const applyManualColorScheme = (nextColorScheme: ColorScheme) => {
    setFollowsSystemColorScheme(false);
    setColorScheme(nextColorScheme);
  };

  const applySystemColorScheme = () => {
    setFollowsSystemColorScheme(true);
    setColorScheme(getSystemColorScheme());
  };

  const reset = () => {
    setDeviceType("PAD");
    setFollowsSystemColorScheme(true);
    setColorScheme(getSystemColorScheme());
    setIsOs3Effect(true);
    setDynamicBackground(true);
    setEffectBackground(true);
    setIsFullSize(false);
    setAlphaValue(0.96);
    setShowMore(false);
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
                alpha={() => alphaValue}
                style={{ borderRadius: 40 }}
                bgStyle={{ opacity: 1, filter: isOs3Effect ? "saturate(1.02)" : "saturate(0.94)" }}
                content={() => (
                  <div className="preview-card">
                    <div className="preview-copy">
                      <div className="preview-copy-inner">
                        <h2>HyperOS Background</h2>
                      </div>
                    </div>
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
                  className={
                    !followsSystemColorScheme && colorScheme === "light" ? "is-active" : undefined
                  }
                  type="button"
                  onClick={() => applyManualColorScheme("light")}
                >
                  Light
                </button>
                <button
                  className={
                    !followsSystemColorScheme && colorScheme === "dark" ? "is-active" : undefined
                  }
                  type="button"
                  onClick={() => applyManualColorScheme("dark")}
                >
                  Dark
                </button>
                <button
                  className={followsSystemColorScheme ? "is-active" : undefined}
                  type="button"
                  onClick={applySystemColorScheme}
                >
                  System
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

              <button
                className="more-options-trigger"
                type="button"
                onClick={() => setShowMore((s) => !s)}
                aria-expanded={showMore}
              >
                <span>More options</span>
                <svg
                  className={showMore ? "is-open" : undefined}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className={`more-options-panel ${showMore ? "is-open" : ""}`}>
                <label className="toggle-row toggle-row--subtle">
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

                <label className="toggle-row toggle-row--subtle">
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

            <div className="code-card-wrap">
              <button
                className="code-copy"
                type="button"
                onClick={handleCopy}
                aria-label="Copy code"
                title="Copy code"
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
