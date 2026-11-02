import { createContext, runInContext } from "node:vm";
import { applySavedTheme, wireThemeButton } from "../../src/site/theme.ts";

export const THEME_KEY = "zotero-plugin-index-theme";
export const SOURCE_SCRIPTS = { head: `(${applySavedTheme})();`, button: `(${wireThemeButton})();` };

type Scheme = "light" | "dark";
// "getter" throws on reading localStorage, "methods" throws on each of its methods, and
// "writes" throws only on the two that change it.
type Blocked = "getter" | "methods" | "writes" | undefined;

// The theme scripts run against stand-ins for <html>, the button, the system setting, storage,
// and the window.
export function themePage(
  { system, saved, blocked, headOnly }: { system: Scheme; saved?: string; blocked?: Blocked; headOnly?: boolean },
  scripts = SOURCE_SCRIPTS,
) {
  const attributes = (start: Record<string, string>) => ({
    values: start,
    getAttribute(name: string) {
      return this.values[name] ?? null;
    },
    setAttribute(name: string, value: string) {
      this.values[name] = value;
    },
    removeAttribute(name: string) {
      delete this.values[name];
    },
  });
  const root = attributes({});
  const clicks: (() => void)[] = [];
  const button = { ...attributes({ hidden: "" }), addEventListener: (_: "click", listener: () => void) => clicks.push(listener) };
  const media = { matches: system === "dark", listeners: [] as (() => void)[], addEventListener: (_: "change", listener: () => void) => media.listeners.push(listener) };
  const windowListeners: Record<string, () => void> = {};
  const stored = new Map(saved === undefined ? [] : [[THEME_KEY, saved]]);
  const state = { blocked, reads: 0 };
  const storage = {
    getItem(name: string) {
      state.reads++;
      if (state.blocked === "methods") throw new Error("blocked");
      return stored.get(name) ?? null;
    },
    setItem(name: string, value: string) {
      if (state.blocked === "methods" || state.blocked === "writes") throw new Error("blocked");
      stored.set(name, value);
    },
    removeItem(name: string) {
      if (state.blocked === "methods" || state.blocked === "writes") throw new Error("blocked");
      stored.delete(name);
    },
  };
  const sandbox = {
    document: {
      documentElement: root,
      querySelector: (selector: string) => {
        if (selector !== "[data-theme-toggle]") throw new Error(`the script asks for ${selector}`);
        return button;
      },
    },
    matchMedia: (query: string) => {
      if (query !== "(prefers-color-scheme: dark)") throw new Error(`the script asks for ${query}`);
      return media;
    },
    addEventListener: (type: string, listener: () => void) => (windowListeners[type] = listener),
    get localStorage() {
      if (state.blocked === "getter") {
        state.reads++;
        throw new Error("blocked");
      }
      return storage;
    },
  };
  const context = createContext(sandbox);
  runInContext(scripts.head, context);
  if (!headOnly) runInContext(scripts.button, context);
  return {
    theme: () => root.getAttribute("data-theme"),
    saved: () => stored.get(THEME_KEY) ?? null,
    keys: () => [...stored.keys()],
    reads: () => state.reads,
    label: () => button.getAttribute("aria-label"),
    title: () => button.getAttribute("title"),
    gives: () => button.getAttribute("data-gives"),
    hidden: () => button.getAttribute("hidden") !== null,
    press: () => clicks.forEach((listener) => listener()),
    setSystem: (scheme: Scheme) => {
      media.matches = scheme === "dark";
      media.listeners.forEach((listener) => listener());
    },
    setSaved: (value: string | null) => {
      if (value === null) stored.delete(THEME_KEY);
      else stored.set(THEME_KEY, value);
    },
    setBlocked: (value: Blocked) => (state.blocked = value),
    fire: (type: "pageshow" | "storage") => windowListeners[type]!(),
  };
}
