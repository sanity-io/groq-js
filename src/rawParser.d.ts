export declare function recognize(input: string): boolean
export declare function parse(
  input: string
):
  | {
      type: string
      position: number
      marks?: undefined
    }
  | {
      type: string
      marks: any[]
      position?: undefined
    }
