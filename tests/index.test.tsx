import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { BgEffectBackground } from "../src/index.ts";

test("renders bg effect wrapper", () => {
  const html = renderToStaticMarkup(
    <BgEffectBackground
      dynamicBackground={false}
      effectBackground={false}
      colorScheme="light"
      bgStyle={{}}
    />,
  );

  expect(html).toContain('data-slot="bg-effect-background"');
  expect(html).toContain("<canvas");
});

test("renders content prop", () => {
  const html = renderToStaticMarkup(
    <BgEffectBackground
      dynamicBackground={false}
      effectBackground={false}
      deviceType="PAD"
      colorScheme="dark"
      bgStyle={{}}
      content={() => <span>Hello</span>}
    />,
  );

  expect(html).toContain("Hello");
});

test("renders with custom colors prop", () => {
  const colors = {
    colors1: [
      0.55, 0.36, 0.96, 0.9, 0.93, 0.28, 0.6, 0.9, 0.23, 0.51, 0.96, 0.9, 0.96, 0.62, 0.04, 0.9,
    ],
    colors2: [
      0.55, 0.36, 0.96, 0.9, 0.93, 0.28, 0.6, 0.9, 0.23, 0.51, 0.96, 0.9, 0.96, 0.62, 0.04, 0.9,
    ],
    colors3: [
      0.55, 0.36, 0.96, 0.9, 0.93, 0.28, 0.6, 0.9, 0.23, 0.51, 0.96, 0.9, 0.96, 0.62, 0.04, 0.9,
    ],
  };

  const html = renderToStaticMarkup(
    <BgEffectBackground
      dynamicBackground={false}
      effectBackground={false}
      deviceType="PHONE"
      colorScheme="light"
      isOs3Effect
      colors={colors}
      bgStyle={{}}
    />,
  );

  expect(html).toContain('data-slot="bg-effect-background"');
  expect(html).toContain("<canvas");
});
