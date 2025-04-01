import {type NamespaceSet} from '../../types'
import * as array from './array'
import * as dateTime from './dateTime'
import * as delta from './delta'
import * as diff from './diff'
import * as global from './global'
import * as math from './math'
import * as pt from './pt'
import * as releases from './releases'
import * as sanity from './sanity'
import * as string from './string'

import {order, score} from './pipe'

export const pipeFunctions = {order, score}

export const namespaces: NamespaceSet = {
  array,
  dateTime,
  delta,
  diff,
  global,
  math,
  pt,
  releases,
  sanity,
  string,
}
