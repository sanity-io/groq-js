const RFC3339_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([-+]\d{2}:\d{2}))$/

export function parseRFC3339(str: string): Date | null {
  if (RFC3339_REGEX.test(str)) {
    return new Date(str)
  }
  return null
}

export function formatRFC3339(d: Date): string {
  const year = addLeadingZero(d.getUTCFullYear(), 4)
  const month = addLeadingZero(d.getUTCMonth() + 1, 2)
  const day = addLeadingZero(d.getUTCDate(), 2)
  const hour = addLeadingZero(d.getUTCHours(), 2)
  const minute = addLeadingZero(d.getUTCMinutes(), 2)
  const second = addLeadingZero(d.getUTCSeconds(), 2)

  let fractionalSecond = ''
  const millis = d.getMilliseconds()
  if (millis != 0) {
    fractionalSecond = `.${addLeadingZero(millis, 3)}`
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${fractionalSecond}Z`
}

type Stringer = {
  toString(): string
}

function addLeadingZero(num: Stringer, targetLength: number) {
  let str = num.toString()
  while (str.length < targetLength) {
    str = `0${str}`
  }
  return str
}
