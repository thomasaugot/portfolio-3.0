const isDev = process.env.NODE_ENV === "development"

export const logger = {
  log:      (...a: unknown[]) => isDev && console.log("[tom-dev]", ...a),
  warn:     (...a: unknown[]) => isDev && console.warn("[tom-dev]", ...a),
  error:    (...a: unknown[]) => isDev && console.error("[tom-dev]", ...a),
  debug:    (...a: unknown[]) => isDev && console.debug("[tom-dev]", ...a),
  group:    (l: string)       => isDev && console.group(l),
  groupEnd: ()                => isDev && console.groupEnd(),
  table:    (d: unknown)      => isDev && console.table(d),
}
