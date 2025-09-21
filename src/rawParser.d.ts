export declare function recognize(input: string): boolean

export type Mark = {
  name: string
  position: number
}
export type CustomFunctions = Record<
  string,
  {
    marks: Mark[]
  }
>

export declare function parse(input: string):
  | {
      type: 'success'
      marks: Mark[]
      customFunctions: CustomFunctions
    }
  | {
      type: 'error'
      position: number
      message: string
    }
