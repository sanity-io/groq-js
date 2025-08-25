import type {ExprNode, FilterNode, SelectorNode} from '../nodeTypes'
import {fromJS, type Value} from '../values'
import {evaluate} from './evaluate'
import {valueAtPath} from './keyPath'
import type {Scope} from './scope'
import type {KeyPath} from './types'

export async function evaluateSelector(
  node: SelectorNode,
  value: Value,
  scope: Scope,
): Promise<KeyPath[]> {
  switch (node.type) {
    case 'Group':
      return await evaluateSelector(node.base, value, scope)
    case 'Tuple':
      const tuplePaths: Array<KeyPath> = []
      for (const member of node.members) {
        const memberPaths = await evaluateSelector(member, value, scope)
        tuplePaths.push(...memberPaths)
      }
      return tuplePaths
    case 'AccessAttribute':
      if (node.base) {
        const accessPaths = await evaluateSelector(node.base, value, scope)
        return accessPaths.map((path) => [...path, node.name])
      }

      return [[node.name]]
    case 'ArrayCoerce': {
      const paths = await evaluateSelector(node.base, value, scope)

      const arrayPaths: KeyPath[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath)

        if (Array.isArray(innerValue)) {
          for (let i = 0; i < innerValue.length; i++) {
            arrayPaths.push([...keyPath, i])
          }
        }
      }

      return arrayPaths
    }
    case 'Filter': {
      const paths = await evaluateSelector(node.base, value, scope)

      // create a special filter to use the current value by making the base `this`
      const filter: FilterNode = {
        ...node,
        base: {type: 'This'},
      }

      const arrayPaths: KeyPath[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath)
        if (Array.isArray(innerValue)) {
          for (let i = 0; i < innerValue.length; i++) {
            const item = innerValue[i]
            const nestedScope = scope.createNested(fromJS([item]))
            const result = await evaluate(filter, nestedScope)
            const matched = await result.get()
            if (matched.length > 0) arrayPaths.push([...keyPath, i])
          }
        }
      }

      return arrayPaths
    }
    case 'SelectorFuncCall': {
      return anywhere(node.arg, scope.createHidden(value))
    }
    case 'SelectorNested': {
      const {base, nested: expr} = node

      const paths = await evaluateSelector(base, value, scope)
      const nestedPaths: KeyPath[] = []
      for (const keyPath of paths) {
        const innerValue = await valueAtPath(value, keyPath)

        switch (expr.type) {
          case 'AccessAttribute':
          case 'ArrayCoerce':
          case 'Filter':
            const accessPaths = await evaluateSelector(expr, fromJS(innerValue), scope)
            for (let i = 0; i < accessPaths.length; i++) {
              nestedPaths.push([...keyPath, ...accessPaths[i]])
            }
            break

          case 'Group':
            const innerResult = await evaluateSelector(expr.base, fromJS(innerValue), scope)
            for (const innerKeyPath of innerResult) {
              nestedPaths.push([...keyPath, ...innerKeyPath])
            }
            break

          case 'Tuple':
            for (const inner of expr.members) {
              const innerResult = await evaluateSelector(inner, fromJS(innerValue), scope)
              for (const innerKeyPath of innerResult) {
                nestedPaths.push([...keyPath, ...innerKeyPath])
              }
            }
        }
      }
      return nestedPaths
    }
  }
}

async function anywhere(expr: ExprNode, scope: Scope, base: KeyPath = []): Promise<KeyPath[]> {
  const value = scope.value

  const pathList: KeyPath[] = []
  if (value.isArray()) {
    const arr: any[] = await value.get()
    for (let i = 0; i < arr.length; i++) {
      const subPaths = await anywhere(expr, scope.createHidden(fromJS(arr[i])), [...base, i])
      pathList.push(...subPaths)
    }
  } else if (value.type === 'object') {
    const result = await evaluate(expr, scope)
    if (result.type === 'boolean' && result.data === true) {
      pathList.push(base)
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
