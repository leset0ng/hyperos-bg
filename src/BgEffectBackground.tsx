import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { getPreset } from "./webgl/presets.js";
import { getFragmentShaderSource, VERTEX_SHADER_SOURCE } from "./webgl/shaders.js";
import type { BgEffectColors, ColorScheme, DeviceType } from "./webgl/types.js";
import {
  clamp,
  createFullscreenBuffer,
  createProgram,
  getBound,
  getColorsByStage,
  mixColors,
  resolveContent,
  stepSpring,
} from "./webgl/utils.js";

interface RenderLoopControls {
  start: () => void;
  stop: () => void;
}

export interface BgEffectBackgroundProps extends Omit<ComponentPropsWithoutRef<"div">, "content"> {
  dynamicBackground?: boolean;
  /**
   * Suspends the render loop while keeping the WebGL context, program and
   * buffers alive, so resuming does not pay for a shader recompile.
   *
   * The animation clock is frozen while paused, so the background resumes
   * exactly where it stopped instead of jumping forward by the paused
   * duration. The canvas keeps showing the last rendered frame.
   *
   * Useful when the background is mounted but not actually visible, e.g. on an
   * inactive tab of a keep-alive router or an off-screen preview: without this
   * the component keeps running a full-rate `requestAnimationFrame` loop.
   */
  paused?: boolean;
  isFullSize?: boolean;
  effectBackground?: boolean;
  isOs3Effect?: boolean;
  deviceType?: DeviceType;
  colorScheme?: ColorScheme;
  colors?: Partial<BgEffectColors>;
  alpha?: () => number;
  bgStyle?: CSSProperties;
  content?: ReactNode | (() => ReactNode);
}

export function BgEffectBackground({
  dynamicBackground = true,
  paused = false,
  isFullSize = false,
  effectBackground = true,
  isOs3Effect = false,
  deviceType = "PAD",
  colorScheme = "light",
  colors,
  alpha = () => 1,
  content,
  children,
  className,
  style,
  bgStyle,
  ...props
}: BgEffectBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // `paused` is deliberately kept out of the setup effect's dependencies:
  // toggling it must not tear the WebGL context down and build it again.
  const pausedRef = useRef(paused);
  const loopRef = useRef<RenderLoopControls | null>(null);

  const preset = useMemo(() => {
    const base = getPreset(deviceType, colorScheme, isOs3Effect);
    if (!colors) {
      return base;
    }
    return {
      ...base,
      colors1: colors.colors1 ?? base.colors1,
      colors2: colors.colors2 ?? base.colors2,
      colors3: colors.colors3 ?? base.colors3,
    };
  }, [colorScheme, colors, deviceType, isOs3Effect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = wrapperRef.current;

    if (!canvas || !host) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      return;
    }

    let program: WebGLProgram | null = null;
    let positionBuffer: WebGLBuffer | null = null;
    let frameId = 0;

    try {
      program = createProgram(gl, VERTEX_SHADER_SOURCE, getFragmentShaderSource(isOs3Effect));
      positionBuffer = createFullscreenBuffer(gl);
    } catch (error) {
      console.error("BgEffectBackground WebGL init failed:", error);
      return;
    }

    const aPosition = gl.getAttribLocation(program, "aPosition");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uAnimTime = gl.getUniformLocation(program, "uAnimTime");
    const uBound = gl.getUniformLocation(program, "uBound");
    const uTranslateY = gl.getUniformLocation(program, "uTranslateY");
    const uPoints = gl.getUniformLocation(program, "uPoints");
    const uColors = gl.getUniformLocation(program, "uColors");
    const uAlphaMulti = gl.getUniformLocation(program, "uAlphaMulti");
    const uNoiseScale = gl.getUniformLocation(program, "uNoiseScale");
    const uPointOffset = gl.getUniformLocation(program, "uPointOffset");
    const uPointRadiusMulti = gl.getUniformLocation(program, "uPointRadiusMulti");
    const uSaturateOffset = gl.getUniformLocation(program, "uSaturateOffset");
    const uLightOffset = gl.getUniformLocation(program, "uLightOffset");
    // `resize` runs synchronously below, before `render` and `clock` exist, so
    // the repaint it needs while paused has to be guarded until setup is done.
    let initialized = false;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Assigning canvas.width clears the drawing buffer. While the loop is
      // running the next frame refills it; while paused nothing would, so the
      // canvas would go blank on any resize.
      if (initialized && frameId === 0) {
        render(clock());
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniform1f(uTranslateY, 0);
    gl.uniform3fv(uPoints, new Float32Array(preset.points));
    gl.uniform1f(uNoiseScale, preset.noiseScale ?? 1.5);
    gl.uniform1f(uPointOffset, preset.pointOffset);
    gl.uniform1f(uPointRadiusMulti, preset.pointRadiusMulti ?? 1);
    gl.uniform1f(uSaturateOffset, preset.saturateOffset);
    gl.uniform1f(uLightOffset, preset.lightOffset);

    const startTime = performance.now();
    const colorStageInterval = preset.colorInterpPeriod * 500;
    let currentStage = 0;
    let targetStage = 0;
    let stageVelocity = 0;
    let lastFrameTime = startTime;
    let nextStageTime = startTime + colorStageInterval;

    // Milliseconds spent paused so far; subtracted from the raw rAF timestamp
    // so the animation clock freezes instead of fast-forwarding on resume.
    let pausedElapsed = 0;
    let pausedSince: number | null = null;

    /** Animation clock: real time minus paused time, frozen while paused. */
    const clock = () => (pausedSince ?? performance.now()) - pausedElapsed;

    const render = (now: number) => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      const drawHeight = isFullSize ? height : height * 0.78;
      const bound = getBound(drawHeight, height, width);
      const elapsedMs = dynamicBackground ? now - startTime : 0;
      const elapsedSeconds = elapsedMs / 1000;
      const deltaTime = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      if (dynamicBackground) {
        while (now >= nextStageTime) {
          targetStage += 1;
          nextStageTime += colorStageInterval;
        }

        const nextStageState = stepSpring(currentStage, stageVelocity, targetStage, deltaTime);
        currentStage = nextStageState.value;
        stageVelocity = nextStageState.velocity;
      } else {
        currentStage = 0;
        targetStage = 0;
        stageVelocity = 0;
        nextStageTime = now + colorStageInterval;
      }

      const base = Math.floor(currentStage);
      const fraction = currentStage - base;
      const start = getColorsByStage(preset, base);
      const end = getColorsByStage(preset, base + 1);
      const colors = mixColors(start, end, fraction);
      const alphaValue = effectBackground ? clamp(alpha(), 0, 1) : 0;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uResolution, width, height);
      gl.uniform1f(uAnimTime, elapsedSeconds);
      gl.uniform4f(uBound, bound.x, bound.y, bound.width, bound.height);
      gl.uniform4fv(uColors, new Float32Array(colors));
      gl.uniform1f(uAlphaMulti, alphaValue);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (rafTime: number) => {
      render(rafTime - pausedElapsed);
      frameId = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (frameId !== 0) {
        return;
      }
      if (pausedSince !== null) {
        pausedElapsed += performance.now() - pausedSince;
        pausedSince = null;
      }
      frameId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (frameId === 0) {
        return;
      }
      cancelAnimationFrame(frameId);
      frameId = 0;
      pausedSince = performance.now();
    };

    loopRef.current = { start: startLoop, stop: stopLoop };
    initialized = true;

    if (pausedRef.current) {
      // Mounted already paused: still paint one frame, otherwise the canvas
      // would stay empty until something resumes it.
      pausedSince = performance.now();
      render(clock());
    } else {
      startLoop();
    }

    return () => {
      loopRef.current = null;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
      if (positionBuffer) {
        gl.deleteBuffer(positionBuffer);
      }
      if (program) {
        gl.deleteProgram(program);
      }
    };
  }, [
    alpha,
    colorScheme,
    deviceType,
    dynamicBackground,
    effectBackground,
    isFullSize,
    isOs3Effect,
    preset,
  ]);

  useEffect(() => {
    pausedRef.current = paused;

    const loop = loopRef.current;
    if (!loop) {
      return;
    }

    if (paused) {
      loop.stop();
    } else {
      loop.start();
    }
  }, [paused]);

  const resolvedContent = resolveContent(content, children);

  return (
    <div
      ref={wrapperRef}
      data-slot="bg-effect-background"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        background: effectBackground ? (colorScheme === "dark" ? "black" : "white") : "transparent",
        ...style,
      }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          ...bgStyle,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {resolvedContent}
      </div>
    </div>
  );
}
