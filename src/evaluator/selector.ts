import type {ExprNode, FilterNode, SelectorNode} from '../nodeTypes'
import {fromJS, type Value} from '../values'
import {evaluate} from './evaluate'
import {valueAtPath} from './keyPath'
import type {Scope} from './scope'

export async function evaluateSelector(
  node: SelectorNode,
  value: Value,
  scope: Scope,
): Promise<string[]> {
  switch (node.type) {
    case 'Group':
      return await evaluateSelector(node.base, value, scope)
    case 'Tuple':
      const tuplePaths: Array<string> = []
      for (const member of node.members) {
        tuplePaths.push(...(await evaluateSelector(member, value, scope)))
      }
      return tuplePaths
    case 'AccessAttribute':
      const pathParts: Array<string[]> = [[node.name]]
      let pathCount = 1
      let selector = node.base
      if (selector) {
        const accessPaths = await evaluateSelector(selector, value, scope)
        pathParts.unshift(accessPaths)
        pathCount *= accessPaths.length
      }

      const pathList: Array<string[]> = []
      for (let i = 0; i < pathCount; i++) {
        const current = pathParts.map((parts) => parts[i % parts.length])
        pathList.push(current)
      }

      return pathList.map((parts) => parts.join('.'))
    case 'ArrayCoerce': {
      const paths = await evaluateSelector(node.base, value, scope)

      const nestedPaths: string[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath, {throwOnReferenceError: false})
        if (Array.isArray(innerValue)) {
          for (let i = 0; i <= innerValue.length; i++) {
            nestedPaths.push(`${keyPath}[${i}]`)
          }
        }
      }

      return nestedPaths
    }
    case 'Filter': {
      const paths = await evaluateSelector(node.base, value, scope)

      // create a special filter to use the current value by making the base `this`
      const filter: FilterNode = {
        ...node,
        base: {type: 'This'},
      }

      const nestedPaths: string[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath, {throwOnReferenceError: false})
        if (Array.isArray(innerValue)) {
          for (let i = 0; i < innerValue.length; i++) {
            const item = innerValue[i]
            const nestedScope = scope.createNested(fromJS([item]))
            const result = await evaluate(filter, nestedScope)
            const matched = await result.get()
            if (matched.length > 0) nestedPaths.push(`${keyPath}[${i}]`)
          }
        }
      }

      return nestedPaths
    }
    case 'SelectorFuncCall': {
      // if the argument is an opcall, make a filter based on it otherwise use the expression as is
      const expr: ExprNode =
        node.arg.type !== 'OpCall'
          ? node.arg
          : {
              type: 'Filter',
              base: {type: 'This'},
              expr: node.arg,
            }

      const result = await evaluate(expr, scope)

      const pathList: string[] = []
      if (result.isArray()) {
        const arr: any[] = await result.get()
        for (let i = 0; i < arr.length; i++) {
          pathList.push(`[${i}]`)
        }
      } else {
        const value = await result.get()
        if (value && typeof value === 'object') {
          for (const key of Object.keys(value)) {
            pathList.push(key)
          }
        }

        // other types don't make sense here, return an empty array
      }

      return pathList
    }
    case 'SelectorNested':
      const {base, nested: expr} = node

      const paths = await evaluateSelector(base, value, scope)
      const nestedPaths: string[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath, {throwOnReferenceError: false})

        if (
          expr.type === 'AccessAttribute' ||
          expr.type === 'ArrayCoerce' ||
          expr.type === 'Filter'
        ) {
          console.log(`SelectorNested: ${expr.type}`)
          if (expr.type === 'ArrayCoerce' && Array.isArray(innerValue)) {
            for (let i = 0; i <= innerValue.length; i++) {
              nestedPaths.push(`${keyPath}[${i}]`)
            }
          } else if (expr.type === 'AccessAttribute' && innerValue) {
            // we return a path here even if `expr.name` is not an attribute of `innerValue`
            nestedPaths.push(`${keyPath}.${expr.name}`)
          } else if (expr.type === 'Filter' && Array.isArray(innerValue)) {
            // create a special filter to use the current value by making the base `this`
            const filter: FilterNode = {
              ...expr,
              base: {type: 'This'},
            }

            for (let i = 0; i < innerValue.length; i++) {
              const item = innerValue[i]
              const nestedScope = scope.createNested(fromJS([item]))
              const result = await evaluate(filter, nestedScope)
              const matched = await result.get()
              if (matched.length > 0) nestedPaths.push(`${keyPath}[${i}]`)
            }
          }
        } else if (expr.type === 'Group') {
          const inner = expr.base
          const innerResult = await evaluateSelector(inner, fromJS(innerValue), scope)
          for (const innerKeyPath of innerResult) {
            nestedPaths.push(`${keyPath}.${innerKeyPath}`)
          }
        } else if (expr.type === 'Tuple') {
          for (const inner of expr.members) {
            const innerResult = await evaluateSelector(inner, fromJS(innerValue), scope)
            for (const innerKeyPath of innerResult) {
              nestedPaths.push(`${keyPath}.${innerKeyPath}`)
            }
          }
        }
      }
      return nestedPaths
  }
}
