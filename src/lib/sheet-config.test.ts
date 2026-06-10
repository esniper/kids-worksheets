import { describe, expect, it } from "vitest";
import { parseWorksheetParams } from "./sheet-config";

describe("parseWorksheetParams", () => {
  it("returns null when mode is missing or unknown", () => {
    expect(parseWorksheetParams("add", {})).toBeNull();
    expect(parseWorksheetParams("add", { mode: "bogus" })).toBeNull();
  });

  it("parses drill mode", () => {
    expect(parseWorksheetParams("add", { mode: "drill" })).toEqual({
      mode: "drill",
    });
  });

  it("parses a full big-numbers config", () => {
    expect(
      parseWorksheetParams("sub", {
        mode: "big",
        x: "3",
        y: "2",
        carry: "no",
        count: "30",
      }),
    ).toEqual({ mode: "big", xDigits: 3, yDigits: 2, carry: "no", count: 30 });
  });

  it("clamps digits to 1-3 and keeps bottom <= top", () => {
    expect(
      parseWorksheetParams("add", {
        mode: "big",
        x: "9",
        y: "0",
        carry: "mix",
        count: "20",
      }),
    ).toEqual({ mode: "big", xDigits: 3, yDigits: 1, carry: "mix", count: 20 });
    expect(
      parseWorksheetParams("add", {
        mode: "big",
        x: "1",
        y: "3",
        carry: "mix",
        count: "20",
      }),
    ).toEqual({ mode: "big", xDigits: 1, yDigits: 1, carry: "mix", count: 20 });
  });

  it("falls back to defaults for missing or junk values", () => {
    expect(parseWorksheetParams("add", { mode: "big" })).toEqual({
      mode: "big",
      xDigits: 2,
      yDigits: 1,
      carry: "mix",
      count: 20,
    });
    expect(
      parseWorksheetParams("add", {
        mode: "big",
        x: "abc",
        y: "xyz",
        carry: "huge",
        count: "17",
      }),
    ).toEqual({ mode: "big", xDigits: 2, yDigits: 1, carry: "mix", count: 20 });
  });

  it("coerces impossible single-digit borrow to mix", () => {
    expect(
      parseWorksheetParams("sub", {
        mode: "big",
        x: "1",
        y: "1",
        carry: "yes",
        count: "12",
      }),
    ).toEqual({ mode: "big", xDigits: 1, yDigits: 1, carry: "mix", count: 12 });
    // same shape is fine for addition: 5 + 6 carries
    expect(
      parseWorksheetParams("add", {
        mode: "big",
        x: "1",
        y: "1",
        carry: "yes",
        count: "12",
      }),
    ).toEqual({ mode: "big", xDigits: 1, yDigits: 1, carry: "yes", count: 12 });
  });
});
