import type {FormatOptions} from './index'

export interface FormatContext {
  indent: string
  currentIndent: number
}

export function createFormatContext(options: FormatOptions): FormatContext {
  return {
    indent: options.indent ?? '  ',
    currentIndent: 0,
  }
}

export class IndentationManager {
  constructor(private context: FormatContext) {
    // Initialize with context
  }

  indent(): void {
    this.context.currentIndent++
  }

  unindent(): void {
    this.context.currentIndent--
  }

  getIndentation(): string {
    return this.context.indent.repeat(this.context.currentIndent)
  }

  newLine(): string {
    return `\n${this.getIndentation()}`
  }

  space(): string {
    return ' '
  }
}
