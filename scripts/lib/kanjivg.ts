export interface KanjiVgStroke {
  /** 書き順(1始まり) */
  number: number;
  /** kvg:type の値 */
  type: string | undefined;
  d: string;
}

const PATH_PATTERN = /<path\b([^>]*?)\/?>/g;
const ATTRIBUTE_PATTERN = /([\w:-]+)="([^"]*)"/g;

function parseAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>();
  for (const match of source.matchAll(ATTRIBUTE_PATTERN)) {
    const [, name, value] = match;
    if (name !== undefined && value !== undefined) attributes.set(name, value);
  }
  return attributes;
}

/** KanjiVG の SVG から各画を書き順に並べて取り出す */
export function parseKanjiVg(svg: string): KanjiVgStroke[] {
  const strokes: KanjiVgStroke[] = [];
  for (const match of svg.matchAll(PATH_PATTERN)) {
    const attributes = parseAttributes(match[1] ?? "");
    const id = attributes.get("id") ?? "";
    const d = attributes.get("d");
    const number = /-s(\d+)$/.exec(id)?.[1];
    if (d === undefined || number === undefined) continue;
    strokes.push({
      number: Number(number),
      type: attributes.get("kvg:type"),
      d,
    });
  }
  strokes.sort((a, b) => a.number - b.number);
  strokes.forEach((stroke, index) => {
    if (stroke.number !== index + 1) {
      throw new Error(
        `Stroke numbers are not continuous: ${strokes.map((s) => s.number)}`,
      );
    }
  });
  return strokes;
}
