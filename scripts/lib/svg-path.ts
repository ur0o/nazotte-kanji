export interface Point {
  x: number;
  y: number;
}

const TOKEN_PATTERN =
  /[MmLlHhVvCcSsZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
const CURVE_SAMPLES = 16;

function cubicAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/**
 * SVG の path の d 属性を折れ線に変換する。
 * KanjiVG で使われる M/L/H/V/C/S/Z(大文字・小文字)に対応する。
 */
export function flattenPath(d: string): Point[] {
  const tokens = d.match(TOKEN_PATTERN) ?? [];
  const points: Point[] = [];
  let index = 0;
  let command = "";
  let current: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  let lastControl = null as Point | null;

  const isCommand = (token: string | undefined): boolean =>
    token !== undefined && /^[A-Za-z]$/.test(token);

  const readNumber = (): number => {
    const token = tokens[index];
    if (token === undefined || isCommand(token)) {
      throw new Error(`Unexpected end of path data: ${d}`);
    }
    index += 1;
    return Number(token);
  };

  const readPoint = (relative: boolean): Point => {
    const x = readNumber();
    const y = readNumber();
    return relative ? { x: current.x + x, y: current.y + y } : { x, y };
  };

  const addCubic = (p1: Point, p2: Point, p3: Point): void => {
    for (let i = 1; i <= CURVE_SAMPLES; i += 1) {
      points.push(cubicAt(current, p1, p2, p3, i / CURVE_SAMPLES));
    }
    lastControl = p2;
    current = p3;
  };

  while (index < tokens.length) {
    if (isCommand(tokens[index])) {
      command = tokens[index] ?? "";
      index += 1;
    } else if (command === "") {
      throw new Error(`Path data must start with a command: ${d}`);
    }
    const relative = command === command.toLowerCase();

    switch (command.toUpperCase()) {
      case "M": {
        current = readPoint(relative);
        start = current;
        points.push(current);
        lastControl = null;
        // M に続く座標の組は L として扱う
        command = relative ? "l" : "L";
        break;
      }
      case "L": {
        current = readPoint(relative);
        points.push(current);
        lastControl = null;
        break;
      }
      case "H": {
        const x = readNumber();
        current = { x: relative ? current.x + x : x, y: current.y };
        points.push(current);
        lastControl = null;
        break;
      }
      case "V": {
        const y = readNumber();
        current = { x: current.x, y: relative ? current.y + y : y };
        points.push(current);
        lastControl = null;
        break;
      }
      case "C": {
        const p1 = readPoint(relative);
        const p2 = readPoint(relative);
        const p3 = readPoint(relative);
        addCubic(p1, p2, p3);
        break;
      }
      case "S": {
        const reflected: Point = lastControl
          ? {
              x: 2 * current.x - lastControl.x,
              y: 2 * current.y - lastControl.y,
            }
          : current;
        const p2 = readPoint(relative);
        const p3 = readPoint(relative);
        addCubic(reflected, p2, p3);
        break;
      }
      case "Z": {
        current = start;
        points.push(current);
        lastControl = null;
        command = "";
        break;
      }
      default:
        throw new Error(`Unsupported path command "${command}": ${d}`);
    }
  }

  return points;
}
