import { describe, expect, it } from "vitest";
import { parseKanjiVg } from "./kanjivg.ts";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109">
<g id="kvg:StrokePaths_05341">
  <g id="kvg:05341" kvg:element="十">
    <path id="kvg:05341-s2" kvg:type="㇑" d="M53,10v90"/>
    <path id="kvg:05341-s1" d="M10,50h90" kvg:type="㇐"/>
  </g>
</g>
<g id="kvg:StrokeNumbers_05341"><text transform="matrix(1 0 0 1 5 45)">1</text></g>
</svg>`;

describe("parseKanjiVg", () => {
  it("各画を書き順に並べて取り出す", () => {
    expect(parseKanjiVg(svg)).toEqual([
      { number: 1, type: "㇐", d: "M10,50h90" },
      { number: 2, type: "㇑", d: "M53,10v90" },
    ]);
  });

  it("画の種類がない画も取り出す", () => {
    const strokes = parseKanjiVg('<path id="kvg:04e00-s1" d="M10,50h90"/>');
    expect(strokes).toEqual([{ number: 1, type: undefined, d: "M10,50h90" }]);
  });

  it("書き順の番号が欠けていたらエラーにする", () => {
    expect(() =>
      parseKanjiVg('<path id="kvg:04e00-s2" d="M10,50h90"/>'),
    ).toThrow();
  });
});
