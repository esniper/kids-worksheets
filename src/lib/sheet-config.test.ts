import { describe, expect, it } from "vitest";
import { parseMixParams, parseWorksheetParams } from "./sheet-config";

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

  it("clamps digits to 1-3", () => {
    expect(
      parseWorksheetParams("add", {
        mode: "big",
        x: "9",
        y: "0",
        carry: "mix",
        count: "20",
      }),
    ).toEqual({ mode: "big", xDigits: 3, yDigits: 1, carry: "mix", count: 20 });
  });

  it("keeps bottom <= top for subtraction", () => {
    expect(
      parseWorksheetParams("sub", {
        mode: "big",
        x: "1",
        y: "3",
        carry: "mix",
        count: "20",
      }),
    ).toEqual({ mode: "big", xDigits: 1, yDigits: 1, carry: "mix", count: 20 });
  });

  it("allows bottom > top for addition since order is interchangeable", () => {
    expect(
      parseWorksheetParams("add", {
        mode: "big",
        x: "1",
        y: "3",
        carry: "mix",
        count: "20",
      }),
    ).toEqual({ mode: "big", xDigits: 1, yDigits: 3, carry: "mix", count: 20 });
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

describe("parseMixParams", () => {
  it("returns null when no section has any ops", () => {
    expect(parseMixParams({})).toBeNull();
    expect(parseMixParams({ drill: "", big: "" })).toBeNull();
    expect(parseMixParams({ drill: "division", big: "mul" })).toBeNull();
  });

  it("parses a full mix config", () => {
    expect(
      parseMixParams({
        drill: "add,sub,mul",
        dcount: "36",
        from: "3",
        to: "9",
        big: "add,sub",
        bcount: "30",
        ax: "1",
        ay: "3",
        acarry: "yes",
        sx: "3",
        sy: "2",
        sborrow: "no",
      }),
    ).toEqual({
      drill: { ops: ["add", "sub", "mul"], count: 36, tables: { from: 3, to: 9 } },
      big: {
        count: 30,
        specs: [
          { op: "add", xDigits: 1, yDigits: 3, carry: "yes" },
          { op: "sub", xDigits: 3, yDigits: 2, carry: "no" },
        ],
      },
    });
  });

  it("allows one section on its own", () => {
    expect(parseMixParams({ drill: "add" })).toEqual({
      drill: { ops: ["add"], count: 24, tables: { from: 2, to: 12 } },
      big: null,
    });
    expect(parseMixParams({ big: "sub" })).toEqual({
      drill: null,
      big: { count: 20, specs: [{ op: "sub", xDigits: 2, yDigits: 1, carry: "mix" }] },
    });
  });

  it("dedupes ops, drops unknown ones, and keeps canonical order", () => {
    expect(parseMixParams({ drill: "mul,add,mul,division" })?.drill?.ops).toEqual([
      "add",
      "mul",
    ]);
    expect(parseMixParams({ big: "sub,add,mul" })?.big?.specs.map((s) => s.op)).toEqual([
      "add",
      "sub",
    ]);
  });

  it("clamps the table range to 2-12 and orders it", () => {
    expect(parseMixParams({ drill: "mul", from: "1", to: "99" })?.drill?.tables).toEqual(
      { from: 2, to: 12 },
    );
    expect(parseMixParams({ drill: "mul", from: "9", to: "3" })?.drill?.tables).toEqual(
      { from: 3, to: 9 },
    );
  });

  it("falls back to defaults for junk counts and options", () => {
    const config = parseMixParams({
      drill: "add",
      dcount: "17",
      big: "add",
      bcount: "999",
      ax: "abc",
      ay: "-2",
      acarry: "huge",
    });
    expect(config?.drill?.count).toBe(24);
    expect(config?.big?.count).toBe(20);
    expect(config?.big?.specs[0]).toEqual({
      op: "add",
      xDigits: 2,
      yDigits: 1,
      carry: "mix",
    });
  });

  it("applies per-op digit rules", () => {
    // subtraction keeps bottom <= top and coerces the impossible 1-1 borrow
    const sub = parseMixParams({ big: "sub", sx: "1", sy: "3", sborrow: "yes" });
    expect(sub?.big?.specs[0]).toEqual({
      op: "sub",
      xDigits: 1,
      yDigits: 1,
      carry: "mix",
    });
    // addition operands stay interchangeable
    const add = parseMixParams({ big: "add", ax: "1", ay: "3" });
    expect(add?.big?.specs[0]).toEqual({
      op: "add",
      xDigits: 1,
      yDigits: 3,
      carry: "mix",
    });
  });
});
