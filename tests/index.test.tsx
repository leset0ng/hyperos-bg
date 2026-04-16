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
