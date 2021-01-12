import {CompoundMapper, Mapper, SyntaxNode} from './nodeTypes'

export type MapState = {
  base: SyntaxNode
  mode: 'array' | 'simple'
  mapper: CompoundMapper
}

export function switchMapState(
  base: SyntaxNode,
  state: MapState | undefined,
  mode: 'array' | 'simple'
): MapState {
  if (!state) {
    let mapper: CompoundMapper = {type: 'Compound', mappers: []}

    return {
      base: {
        type: 'Map',
        base,
        mapper
      },
      mode,
      mapper
    }
  }

  if (state.base !== base) throw new Error('switchMapState got incorrect base')

  if (state.mode === mode) return state

  let mapper: CompoundMapper = {type: 'Compound', mappers: []}
  if (mode === 'array') {
    state.mapper.mappers.push(mapper)
  } else {
    state.mapper.mappers.push({type: 'Apply', mapper: mapper})
  }

  state.mode = mode
  state.mapper = mapper
  return state
}

export function addMapper(state: MapState, mapper: Mapper) {
  state.mapper.mappers.push(mapper)
}
