/**
 * Minimal logger so the agent can be run as a library without a
 * dependency on a framework logger. The host app can pass its own
 * logger via setLogger().
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const consoleLogger: Logger = {
  debug: (...args) => console.debug("[agent:debug]", ...args),
  info: (...args) => console.info("[agent:info]", ...args),
  warn: (...args) => console.warn("[agent:warn]", ...args),
  error: (...args) => console.error("[agent:error]", ...args),
};

let currentLogger: Logger = consoleLogger;

export function setLogger(logger: Logger): void {
  currentLogger = logger;
}

export function getLogger(): Logger {
  return currentLogger;
}
