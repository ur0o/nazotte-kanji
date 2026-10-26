import { describe, expect, it } from "vitest";
import { addGuess, roundStatus, scoreLabel, type Round } from "./game.ts";

const round = (guesses: string[]): Round => ({
  kanji: "森",
  difficulty: "normal",
  guesses,
});

describe("roundStatus と scoreLabel", () => {
  it("回答中", () => {
    expect(roundStatus(round(["木"]))).toBe("playing");
    expect(scoreLabel(round(["木"]))).toBe("-/5");
  });

  it("何回目で正解したかをスコアにする", () => {
    expect(roundStatus(round(["木", "林", "森"]))).toBe("won");
    expect(scoreLabel(round(["木", "林", "森"]))).toBe("3/5");
  });

  it("5回とも外れたら不正解", () => {
    const lost = round(["一", "二", "三", "四", "五"]);
    expect(roundStatus(lost)).toBe("lost");
    expect(scoreLabel(lost)).toBe("×/5");
  });
});

describe("addGuess", () => {
  it("回答を加える", () => {
    expect(addGuess(round([]), "木").guesses).toEqual(["木"]);
  });

  it("回答が終わった後は加えない", () => {
    const won = round(["森"]);
    expect(addGuess(won, "木")).toBe(won);
  });
});
