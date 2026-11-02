import { describe, expect, test } from "vitest";
import { THEME_KEY, themePage } from "./support/theme-page.ts";

describe("the head theme script", () => {
  test.each([
    ["light", "dark"],
    ["dark", "light"],
  ] as const)("sets the saved scheme %s on <html> on a %s system", (saved, system) => {
    expect(themePage({ system, saved, headOnly: true }).theme()).toBe(saved);
  });

  test.each([undefined, "", "Dark", "system"])("sets no scheme for the saved value %j", (saved) => {
    expect(themePage({ system: "dark", saved, headOnly: true }).theme()).toBeNull();
  });

  test.each(["getter", "methods"] as const)("sets no scheme and throws nothing when the storage %s throws", (blocked) => {
    const page = themePage({ system: "dark", saved: "light", blocked, headOnly: true });
    expect(page.theme()).toBeNull();
    expect(page.reads()).toBe(1);
  });
});

describe("the theme button", () => {
  test("removes hidden when its script runs", () => {
    expect(themePage({ system: "light" }).hidden()).toBe(false);
  });

  test.each([
    // system, saved before the press, then data-theme and the saved value after it.
    ["light", undefined, "dark", "dark"],
    ["light", "light", "dark", "dark"],
    ["light", "dark", null, null],
    ["dark", undefined, "light", "light"],
    ["dark", "light", null, null],
    ["dark", "dark", "light", "light"],
  ] as const)("on a %s system with %s saved, a press sets %s and saves %s", (system, saved, theme, after) => {
    const page = themePage({ system, saved });
    page.press();
    expect(page.theme()).toBe(theme);
    expect(page.saved()).toBe(after);
    expect(page.keys().filter((key) => key !== THEME_KEY)).toEqual([]);
  });

  test("still flips the page when the storage throws", () => {
    const page = themePage({ system: "light", blocked: "methods" });
    page.press();
    expect(page.theme()).toBe("dark");
    expect(page.gives()).toBe("light");
    page.press();
    expect(page.theme()).toBeNull();
    expect(page.gives()).toBe("dark");
  });

  const expectGives = (page: ReturnType<typeof themePage>, scheme: "light" | "dark") => {
    expect(page.label()).toBe(`Switch to ${scheme} mode`);
    expect(page.title()).toBe(`Switch to ${scheme} mode`);
    expect(page.gives()).toBe(scheme);
  };

  test.each([
    ["light", undefined, "dark"],
    ["light", "dark", "light"],
    ["dark", undefined, "light"],
    ["dark", "light", "dark"],
  ] as const)("names the other scheme at load on a %s system with %s saved", (system, saved, gives) => {
    expectGives(themePage({ system, saved }), gives);
  });

  test("names the other scheme after each press", () => {
    const page = themePage({ system: "light" });
    page.press();
    expectGives(page, "light");
    page.press();
    expectGives(page, "dark");
  });

  test("follows a change of the system scheme when no choice is saved, and keeps a saved choice", () => {
    const following = themePage({ system: "light" });
    following.setSystem("dark");
    expectGives(following, "light");
    const kept = themePage({ system: "light", saved: "dark" });
    kept.setSystem("dark");
    kept.setSystem("light");
    expect(kept.theme()).toBe("dark");
    expectGives(kept, "light");
  });

  test.each(["pageshow", "storage"] as const)("takes a saved value that changed before a %s event", (event) => {
    const page = themePage({ system: "light" });
    page.setSaved("dark");
    page.fire(event);
    expect(page.theme()).toBe("dark");
    expectGives(page, "light");
    page.setSaved(null);
    page.fire(event);
    expect(page.theme()).toBeNull();
    expectGives(page, "dark");
  });

  test.each(["pageshow", "storage"] as const)("keeps the scheme when the read at a %s event throws", (event) => {
    const page = themePage({ system: "light" });
    page.press();
    page.setBlocked("methods");
    const reads = page.reads();
    page.fire(event);
    expect(page.reads()).toBe(reads + 1);
    expect(page.theme()).toBe("dark");
    expectGives(page, "light");
  });

  test.each(["pageshow", "storage"] as const)("keeps a press whose save failed through a %s event, until a later save works", (event) => {
    const page = themePage({ system: "light", blocked: "writes" });
    page.press();
    expect(page.saved()).toBeNull();
    page.fire(event);
    expect(page.theme()).toBe("dark");
    expectGives(page, "light");
    page.setBlocked(undefined);
    page.press();
    page.setSaved("dark");
    page.fire(event);
    expect(page.theme()).toBe("dark");
  });
});
