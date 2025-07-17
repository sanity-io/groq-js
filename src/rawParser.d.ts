export declare function recognize(input: string): boolean

export type Mark = {
  name: string
  position: number
}

export declare function parse(input: string):
  | {
      type: 'success'
      marks: Mark[]
    }
  | {
      type: 'error'
      position: number
    }

export declare const PRECEDENCE_CONSTANTS: {
  readonly PREC_PAIR: number
  readonly PREC_OR: number
  readonly PREC_AND: number
  readonly PREC_COMP: number
  readonly PREC_ORDER: number
  readonly PREC_ADD: number
  readonly PREC_SUB: number
  readonly PREC_MUL: number
  readonly PREC_DIV: number
  readonly PREC_MOD: number
  readonly PREC_POW: number
  readonly PREC_POS: number
  readonly PREC_NOT: number
  readonly PREC_NEG: number
}
