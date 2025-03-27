import type {Value} from './nodeTypes'

export interface ParseOptions {
  params?: Record<string, Value>
  mode?: 'normal' | 'delta'
}
