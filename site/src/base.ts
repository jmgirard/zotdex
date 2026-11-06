// The site's path on its host: the root, as GitHub Pages serves a custom domain there
// (D-068, D-069). The templates read it from here, not from import.meta.env.BASE_URL, because a
// BASE_URL variable in the environment (Vitest sets one) replaces that value.
export const BASE = "/";

// The host that serves BASE. A page's public address is this plus the page's path.
export const ORIGIN = "https://zotdex.jmgirard.com";
