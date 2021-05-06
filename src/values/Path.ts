function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function pathRegExp(pattern: string) {
  const re = []
  for (const part of pattern.split('.')) {
    if (part === '*') {
      re.push('[^.]+')
    } else if (part === '**') {
      re.push('.*')
    } else {
      re.push(escapeRegExp(part))
    }
  }

  return new RegExp(`^${re.join('.')}$`)
}

export class Path {
  private pattern: string
  private patternRe: RegExp

  constructor(pattern: string) {
    this.pattern = pattern
    this.patternRe = pathRegExp(pattern)
  }

  matches(str: string): boolean {
    return this.patternRe.test(str)
  }

  toJSON(): string {
    return this.pattern
  }
}
