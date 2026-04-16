import type { ReactNode } from "react";
import type { BgEffectPreset, Bound } from "./types.js";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function mixColors(start: number[], end: number[], t: number) {
  return Array.from({ length: 16 }, (_, index) => lerp(start[index] ?? 0, end[index] ?? 0, t));
}

export function getColorsByStage(preset: BgEffectPreset, index: number) {
  switch (index % 4) {
    case 0:
      return preset.colors2;
    case 1:
      return preset.colors1;
    case 2:
      return preset.colors2;
    case 3:
      return preset.colors3;
    default:
      return preset.colors2;
  }
}

export function getBound(drawHeight: number, totalHeight: number, totalWidth: number): Bound {
  const safeHeight = totalHeight || 1;
  const safeWidth = totalWidth || 1;
  const heightRatio = drawHeight / safeHeight;

  if (safeWidth <= safeHeight) {
    return { x: 0, y: 1 - heightRatio, width: 1, height: heightRatio };
  }

  const aspectRatio = safeWidth / safeHeight;
  const contentCenterY = 1 - heightRatio / 2;
  return {
    x: 0,
    y: contentCenterY - aspectRatio / 2,
    width: 1,
    height: aspectRatio,
  };
}

export function resolveContent(
  content: ReactNode | (() => ReactNode) | undefined,
  children: ReactNode,
) {
  if (typeof content === "function") {
    return content();
  }

  return content ?? children;
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Unknown shader compile error.";
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Failed to create WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Unknown program link error.";
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error(info);
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

export function createFullscreenBuffer(gl: WebGLRenderingContext) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error("Failed to create WebGL buffer.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  return buffer;
}

export function stepSpring(
  current: number,
  velocity: number,
  target: number,
  deltaTime: number,
  stiffness = 35,
  dampingRatio = 0.9,
) {
  const safeDelta = Math.min(Math.max(deltaTime, 0), 1 / 15);
  const damping = 2 * dampingRatio * Math.sqrt(stiffness);
  const acceleration = (target - current) * stiffness - velocity * damping;
  const nextVelocity = velocity + acceleration * safeDelta;
  const nextValue = current + nextVelocity * safeDelta;

  if (Math.abs(target - nextValue) < 0.001 && Math.abs(nextVelocity) < 0.001) {
    return { value: target, velocity: 0 };
  }

  return { value: nextValue, velocity: nextVelocity };
}
