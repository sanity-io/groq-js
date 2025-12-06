export interface ParseOptions {
  params?: Record<string, unknown>
  mode?: 'normal' | 'delta'

  /**
   * If true, the parser will allow functions that are not defined in the built-in function sets.
   * Mainly useful for allowing custom functions to be used in combination with TypeGen.
   * @internal
   */
  allowUnknownFunctions?: boolean
}
