import type {FilterNode, SelectorNode} from '../nodeTypes'
import {fromJS, type Value} from '../values'
import {evaluate} from './evaluate'
import {valueAtPath} from './keyPath'
import type {Scope} from './scope'

export async function evaluateSelector(
  node: SelectorNode,
  value: Value,
  scope: Scope,
): Promise<Array<string>> {
  const {base} = node
  switch (base.type) {
    case 'Group':
      if (base.base.type !== 'Selector') throw new Error('Selector group must contain a selector')
      return await evaluateSelector(base.base, value, scope)
    case 'Tuple':
      const tuplePaths: Array<string> = []
      for (const member of base.members) {
        if (member.type !== 'Selector') throw new Error('Selector tuple must contain a selector')
        tuplePaths.push(...(await evaluateSelector(member, value, scope)))
      }
      return tuplePaths
    case 'AccessAttribute':
      const pathParts: Array<string[]> = [[base.name]]
      let pathCount = 1
      let selector = base.base
      while (selector) {
        if (selector.type !== 'Selector') {
          break
        }

        const paths = await evaluateSelector(selector, value, scope)
        pathParts.unshift(paths)
        pathCount *= paths.length

        selector = selector.base
      }

      const pathList: Array<string[]> = []
      for (let i = 0; i < pathCount; i++) {
        const current = pathParts.map((parts) => parts[i % parts.length])
        pathList.push(current)
      }

      return pathList.map((parts) => parts.join('.'))
    case 'FuncCall': {
      if (base.name !== 'anywhere') throw new Error(`Invalid function in selector: ${base.name}`)
      if (base.args.length !== 1) throw new Error('Invalid arguments for anywhere')
      
      const expr = base.args[0]

      const result = await evaluate(expr, scope)

      const pathList: string[] = []
      if (result.isArray()) {
        const arr: any[] = await result.get()
        for (let i=0; i < arr.length; i++) {
          pathList.push(`[${i}]`)
        }
      } else {
        const value = await result.get()
        if (typeof value === 'object') {
          for (const key of Object.keys(value)) {
            pathList.push(key)
          }
        }

        // other types don't make sense here, return an empty array
      }
      
      return pathList
    }
    case 'Selector':
      const {expr} = node
      if (typeof expr === 'undefined') throw new Error('Selector sub-expression must be defined')

      const paths = await evaluateSelector(base, value, scope)
      const nestedPaths: string[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath, {throwOnReferenceError: false})

        if (
          expr.type === 'AccessAttribute' ||
          expr.type === 'ArrayCoerce' ||
          expr.type === 'Filter'
        ) {
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
              console.log('filter', {i, matched, item})
              if (matched.length > 0) nestedPaths.push(`${keyPath}[${i}]`)
            }
          }
        } else if (expr.type === 'Group') {
          const inner = expr.base
          if (inner.type !== 'Selector') throw new Error('Selector group must contain a selector')
          const innerResult = await evaluateSelector(inner, fromJS(innerValue), scope)
          for (const innerKeyPath of innerResult) {
            nestedPaths.push(`${keyPath}.${innerKeyPath}`)
          }
        } else if (expr.type === 'Tuple') {
          for (const inner of expr.members) {
            if (inner.type !== 'Selector')
              throw new Error('Selector tuple must contain only selectors')
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
