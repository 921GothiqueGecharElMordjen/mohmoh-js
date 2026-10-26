import fs from "node:fs";
import path from "node:path";

const DEFAULTS = {
  PORT: { default: 8080, type: "number" },
  HOST: { default: "0.0.0.0", type: "string" },
  MAX_PLAYERS: { default: 10, type: "number" },
  MAX_CONNECTIONS_PER_IP: { default: 4, type: "number" },
  MAX_PACKETS_PER_SEC: { default: 60, type: "number" },
  PACKET_BURST: { default: 120, type: "number" },
  ADMIN_PASSWORD: { default: "", type: "string" },
  ADMIN_PREFIX: { default: "/", type: "string" },
  DAY_MS: { default: 600000, type: "number" },
  NIGHT_MS: { default: 300000, type: "number" },
  LOG_LEVEL: { default: "info", type: "string" }
};

export function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim();
    out[key.trim()] = value.replace(/^['"]|['"]$/g, "");
  }
  return out;
}

function coerceValue(key, rawValue) {
  const { type, default: def } = DEFAULTS[key] ?? { default: rawValue, type: typeof rawValue };
  if (rawValue === undefined || rawValue === "") {
    return def;
  }
  if (type === "number") {
    const num = Number(rawValue);
    if (!Number.isFinite(num)) {
      throw new Error(`Invalid environment value for ${key}: expected number, received "${rawValue}".`);
    }
    return num;
  }
  if (type === "boolean") {
    const normalized = rawValue.toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    throw new Error(`Invalid environment value for ${key}: expected boolean, received "${rawValue}".`);
  }
  return String(rawValue);
}

export function loadRuntimeEnv(envPath = path.resolve(import.meta.dirname, "..", ".env")) {
  const fileValues = parseEnvFile(envPath);
  const resolved = {};

  for (const [key, meta] of Object.entries(DEFAULTS)) {
    const envValue = process.env[key] ?? fileValues[key] ?? meta.default;
    resolved[key] = coerceValue(key, envValue);
  }

  if (resolved.PORT <= 0 || resolved.PORT > 65535) {
    throw new Error(`Invalid PORT value: ${resolved.PORT}. It must be between 1 and 65535.`);
  }
  if (resolved.MAX_PLAYERS <= 0) {
    throw new Error("MAX_PLAYERS must be greater than 0.");
  }
  if (resolved.MAX_CONNECTIONS_PER_IP <= 0) {
    throw new Error("MAX_CONNECTIONS_PER_IP must be greater than 0.");
  }
  if (resolved.MAX_PACKETS_PER_SEC <= 0) {
    throw new Error("MAX_PACKETS_PER_SEC must be greater than 0.");
  }
  if (resolved.PACKET_BURST <= 0) {
    throw new Error("PACKET_BURST must be greater than 0.");
  }
  if (resolved.DAY_MS <= 0 || resolved.NIGHT_MS <= 0) {
    throw new Error("DAY_MS and NIGHT_MS must be greater than 0.");
  }
  return resolved;
}

export default loadRuntimeEnv;
