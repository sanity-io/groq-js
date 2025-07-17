/**
 * Escape a string for GROQ output
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
}

/**
 * Join array elements with separators, handling pretty vs compact mode
 */
export function joinWithSeparator(
  items: string[],
  separator: string,
  pretty: boolean,
  newLine: string = '\n',
): string {
  if (pretty && separator.includes(',')) {
    return items.join(separator + newLine)
  }
  return items.join(separator)
}

/**
 * Check if a string represents a valid GROQ identifier
 */
export function isValidIdentifier(str: string): boolean {
  // GROQ identifiers can contain letters, numbers, underscores, and some other characters
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str)
}
