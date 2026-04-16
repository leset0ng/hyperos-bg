import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BgEffectBackground } from "../src/index.js";
import "./styles.css";

function App() {
  const [deviceType, setDeviceType] = useState<"PHONE" | "PAD">("PAD");
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
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
        isOs3Effect ? "os3" : "os2",
        dynamicBackground ? "dynamic" : "static",
      ].join(" · "),
    [colorScheme, deviceType, dynamicBackground, isOs3Effect],
  );

  return (
    <div className="preview-shell">
      <div className="preview-layout">
        <aside className="control-panel">
          <div className="control-panel__header">
            <span className="preview-badge">Demo Controls</span>
            <h1>BgEffectBackground</h1>
            <p>切换不同参数，直接观察 WebGL 背景在设备类型、明暗模式和动画状态下的表现。</p>
          </div>

          <div className="control-group">
            <span className="control-label">Device Type</span>
            <div className="segmented-control">
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

          <div className="control-group">
            <span className="control-label">Color Scheme</span>
            <div className="segmented-control">
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

          <div className="control-grid">
            <label className="toggle-card">
              <input
                checked={isOs3Effect}
                type="checkbox"
                onChange={(event) => setIsOs3Effect(event.currentTarget.checked)}
              />
              <span>
                <strong>OS3 Effect</strong>
                <small>切换 OS2 / OS3 的视觉预设</small>
              </span>
            </label>

            <label className="toggle-card">
              <input
                checked={dynamicBackground}
                type="checkbox"
                onChange={(event) => setDynamicBackground(event.currentTarget.checked)}
              />
              <span>
                <strong>Dynamic Background</strong>
                <small>开启颜色插值和流动动画</small>
              </span>
            </label>

            <label className="toggle-card">
              <input
                checked={effectBackground}
                type="checkbox"
                onChange={(event) => setEffectBackground(event.currentTarget.checked)}
              />
              <span>
                <strong>Effect Background</strong>
                <small>关闭后只保留底色，不绘制光效</small>
              </span>
            </label>

            <label className="toggle-card">
              <input
                checked={isFullSize}
                type="checkbox"
                onChange={(event) => setIsFullSize(event.currentTarget.checked)}
              />
              <span>
                <strong>Full Size</strong>
                <small>控制 shader 绘制区域是否铺满</small>
              </span>
            </label>
          </div>

          <label className="range-card">
            <span className="control-label">Alpha</span>
            <div className="range-row">
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
          </label>
        </aside>

        <section className="preview-stage">
          <BgEffectBackground
            className="preview-background"
            dynamicBackground={dynamicBackground}
            isFullSize={isFullSize}
            effectBackground={effectBackground}
            colorScheme={colorScheme}
            isOs3Effect={isOs3Effect}
            deviceType={deviceType}
            alpha={() => alphaValue}
            style={{ borderRadius: 32 }}
            bgStyle={{ opacity: 1 }}
            content={() => (
              <div className="preview-card">
                <span className="preview-badge">{summary}</span>
                <h2>HyperOS Background</h2>
              </div>
            )}
          />
        </section>
      </div>
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
