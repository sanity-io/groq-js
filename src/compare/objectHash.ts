const trueHash = 0xf0c4fc789543e
const falseHash = 0x8c78e1f1efb42
const undefinedHash = 0x109c6207d8a085
const nullHash = 0x9778b7c419728

const unknownNamespace = 0x1540223a27e038
const arrayNamespace = 0x4ad7403b40fc9
const objectEntryNamespace = 0x1d5edabd14a3a8
const objectKeyNamespace = 0x163199b6204b42
const objectInitialAcc = 0xe6662e6f07dc6
const setInitialAcc = 0x681b9b0a187b0
const setNamespace = 0x1b017cc8f5b31f

// https://stackoverflow.com/a/52171480/5776910
function cyrb53(input: string | number[], seed = 0) {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed

  for (let i = 0, ch; i < input.length; i++) {
    ch = typeof input === 'string' ? input.charCodeAt(i) : input[i]
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

function hashUnknown(obj: unknown): number {
  if (typeof obj === 'number') return cyrb53([], obj)
  if (typeof obj === 'string') return cyrb53(obj)
  if (typeof obj === 'boolean') return obj ? trueHash : falseHash

  if (obj === undefined) return undefinedHash

  if (typeof obj !== 'object') return cyrb53(typeof obj, unknownNamespace)
  if (obj === null) return nullHash

  if (Array.isArray(obj)) return cyrb53(obj.map(hashUnknown), arrayNamespace)

  return Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .reduce<number>(
      (acc, [key, value]) =>
        cyrb53([cyrb53(key, objectKeyNamespace), hashUnknown(value), acc], objectEntryNamespace),
      objectInitialAcc
    )
}

export function objectHash(obj: unknown) {
  return hashUnknown(obj).toString(16)
}

export function unorderedHash(items: Iterable<unknown>) {
  return Array.from(items)
    .map(hashUnknown)
    .sort((a, b) => a - b)
    .reduce<number>((acc, next) => cyrb53([next, acc], setNamespace), setInitialAcc)
    .toString(16)
}
