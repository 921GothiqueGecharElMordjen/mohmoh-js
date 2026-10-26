export const PACKET_TABLE = Object.freeze({
  "sp": 1,
  "c": 2,
  "33": 3,
  "7": 4,
  "2": 5,
  "5": 6,
  "13c": 7,
  "6": 8,
  "ch": 9,
  "pp": 10,
  "8": 11,
  "9": 12,
  "10": 13,
  "11": 14,
  "12": 15,
  "14": 16,
  "rmd": 17,
  "io-init": 18,
  "id": 19,
  "us": 20,
  "mm": 21,
  "ac": 22,
  "ad": 23,
  "sa": 24,
  "st": 25,
  "an": 26,
  "p": 27,
  "1": 28,
  "4": 29,
  "h": 30,
  "t": 31,
  "a": 32,
  "16": 33,
  "17": 34,
  "15": 35,
  "3": 36,
  "11": 37,
  "9k": 38,
  "ss": 39
});

export const REVERSE_PACKET_TABLE = Object.freeze(Object.fromEntries(
  Object.entries(PACKET_TABLE).map(([code, id]) => [String(id), code])
));

export function mapInbound(code) {
  if (code == null) return null;
  const value = String(code).trim();
  if (value === "") return null;
  if (Object.hasOwn(PACKET_TABLE, value)) return value;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return REVERSE_PACKET_TABLE[String(numeric)] ?? numeric;
  }
  return value;
}

export function mapOutbound(code) {
  if (code == null) return null;
  const value = String(code).trim();
  if (value === "") return null;
  if (Object.hasOwn(REVERSE_PACKET_TABLE, value)) return value;
  return PACKET_TABLE[value] ?? Number(value) || value;
}

export function normalizeOpcode(code) {
  const mapped = mapOutbound(code);
  return mapped == null ? null : String(mapped);
}

export const protocol = {
  PACKET_TABLE,
  REVERSE_PACKET_TABLE,
  mapInbound,
  mapOutbound,
  normalizeOpcode
};

export default protocol;
