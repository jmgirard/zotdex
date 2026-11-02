// What a name at the top of a repo must look like to say nothing about source code, in
// lowercase. A dotfile or dot-folder, and a name with one of these stems, extensions, or
// whole forms, is not source.
const NOT_SOURCE_STEMS = new Set(["readme", "license", "licence", "copying", "notice", "changelog", "changes"]);
const NOT_SOURCE_EXTENSIONS = new Set(["xpi", "md", "txt", "rdf", "png", "jpg", "jpeg", "gif", "svg", "webp"]);
const NOT_SOURCE_NAMES = new Set(["docs", "doc", "images", "image", "img", "assets", "screenshots", "dist", "build", "releases", "update", "updates"]);
const UPDATE_FILE = /^update.*\.json$/;

function isSource(given: string): boolean {
  const name = given.toLowerCase();
  if (name.startsWith(".") || NOT_SOURCE_NAMES.has(name) || UPDATE_FILE.test(name)) return false;
  const dot = name.lastIndexOf(".");
  const [stem, extension] = dot === -1 ? [name, ""] : [name.slice(0, dot), name.slice(dot + 1)];
  return !NOT_SOURCE_STEMS.has(stem) && !NOT_SOURCE_EXTENSIONS.has(extension);
}

// Whether any of a repo's top-level file and folder names can be source code. It reads no
// code and no folder, so a repo that keeps its code in `build` gives false.
export function holdsSource(names: string[]): boolean {
  return names.some(isSource);
}
