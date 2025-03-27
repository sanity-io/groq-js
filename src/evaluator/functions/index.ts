import type {NamespaceSet} from '../types'
import * as array from './array'
import * as dateTime from './dateTime'
import * as delta from './delta'
import * as diff from './diff'
import * as global from './global'
import * as math from './math'
export * as pipeFunctions from './pipe'
import * as pt from './pt'
import * as releases from './releases'
import * as sanity from './sanity'
import * as string from './string'

export const namespaces: NamespaceSet = {
  global,
  string,
  array,
  pt,
  delta,
  diff,
  sanity,
  math,
  dateTime,
  releases,
}
