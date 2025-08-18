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

      return pathList.map((parts) => parts.filter((s) => s.length > 0).join('.'))
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
      return anywhere(node.arg, scope.createHidden(value))
    }
    case 'SelectorNested':
      const {base, nested: expr} = node

      const paths = await evaluateSelector(base, value, scope)
      const nestedPaths: string[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath, {throwOnReferenceError: false})

        if (expr.type === 'ArrayCoerce') {
          const arrayPaths = await evaluateSelector(expr, fromJS(innerValue), scope)
          for (let i = 0; i < arrayPaths.length; i++) {
            nestedPaths.push(`${keyPath}.${arrayPaths[i]}`)
          }
        } else if (expr.type === 'AccessAttribute') {
          const accessPaths = await evaluateSelector(expr, fromJS(innerValue), scope)
          for (let i = 0; i < accessPaths.length; i++) {
            nestedPaths.push(`${keyPath}.${accessPaths[i]}`)
          }
        } else if (expr.type === 'Filter') {
          const arrayPaths = await evaluateSelector(expr, fromJS(innerValue), scope)
          for (let i = 0; i < arrayPaths.length; i++) {
            nestedPaths.push(`${keyPath}.${arrayPaths[i]}`)
          }
        } else if (expr.type === 'Group') {
          const innerResult = await evaluateSelector(expr.base, fromJS(innerValue), scope)
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

async function anywhere(expr: ExprNode, scope: Scope, base: string[] = []): Promise<string[]> {
  const value = scope.value

  const pathList: string[] = []
  if (value.isArray()) {
    const arr: any[] = await value.get()
    for (let i = 0; i < arr.length; i++) {
      const subPaths = await anywhere(expr, scope.createHidden(fromJS(arr[i])), [...base, `[${i}]`])
      pathList.push(...subPaths)
    }
  } else if (value.type === 'object') {
    const result = await evaluate(expr, scope)
    if (result.type === 'boolean' && result.data === true) {
      pathList.push(base.join('.'))
    }

    for (const key of Object.keys(value.data)) {
      const subPaths = await anywhere(expr, scope.createHidden(fromJS(value.data[key])), [
        ...base,
        key,
      ])
      pathList.push(...subPaths)
    }
  }

  return pathList
}
