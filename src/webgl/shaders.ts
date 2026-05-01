import { OS2_FRAGMENT_SHADER_SOURCE } from "./os2-shader.js";
import { OS3_FRAGMENT_SHADER_SOURCE } from "./os3-shader.js";

export const VERTEX_SHADER_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = (aPosition + 1.0) * 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export function getFragmentShaderSource(isOs3Effect: boolean) {
  return isOs3Effect ? OS3_FRAGMENT_SHADER_SOURCE : OS2_FRAGMENT_SHADER_SOURCE;
}
