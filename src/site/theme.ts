// The layout builds a classic script from each function's source text, so each one calls and
// reads nothing from outside its body except built-ins and browser globals. The key names this
// site, since the owner's other GitHub Pages sites share its origin's localStorage.

// Sets the saved scheme on <html>. It runs in <head>, so the page first paints in that scheme.
// With no saved scheme, or with blocked storage, the system setting decides.
export function applySavedTheme(): void {
  try {
    const saved = localStorage.getItem("zotero-plugin-index-theme");
    if (saved === "light" || saved === "dark") document.documentElement.setAttribute("data-theme", saved);
  } catch {
    // Blocked storage has no saved scheme.
  }
}

// Wires and shows the top bar's button. It runs right after the button, so the button shows
// with the first paint of the top bar. A press flips the scheme and saves it, and flipping back
// to the system's scheme clears the saved choice. Blocked storage leaves a press working on
// this page only.
export function wireThemeButton(): void {
  const key = "zotero-plugin-index-theme";
  const root = document.documentElement;
  const button = document.querySelector("[data-theme-toggle]")!;
  const system = matchMedia("(prefers-color-scheme: dark)");
  const systemScheme = () => (system.matches ? "dark" : "light");
  const otherScheme = () => ((root.getAttribute("data-theme") ?? systemScheme()) === "dark" ? "light" : "dark");
  const draw = () => {
    const other = otherScheme();
    const words = `Switch to ${other} mode`;
    button.setAttribute("aria-label", words);
    button.setAttribute("title", words);
    button.setAttribute("data-gives", other);
  };
  // A press whose save failed holds only on this page, so a later read must not undo it.
  let unsaved = false;
  // Another page or tab can change the saved scheme, and Back can restore this page as it was.
  const reread = () => {
    if (!unsaved) {
      try {
        const saved = localStorage.getItem(key);
        if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
        else root.removeAttribute("data-theme");
      } catch {
        // A failed read leaves the scheme as it is.
      }
    }
    draw();
  };
  button.addEventListener("click", () => {
    const other = otherScheme();
    const follow = other === systemScheme();
    if (follow) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", other);
    try {
      if (follow) localStorage.removeItem(key);
      else localStorage.setItem(key, other);
      unsaved = false;
    } catch {
      unsaved = true;
    }
    draw();
  });
  system.addEventListener("change", draw);
  addEventListener("pageshow", reread);
  addEventListener("storage", reread);
  draw();
  button.removeAttribute("hidden");
}
