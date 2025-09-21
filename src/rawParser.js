'use strict'

const WS = /^([\t\n\v\f\r \u0085\u00A0]|(\/\/[^\n]*\n))+/
const NUM = /^\d+/
const IDENT = /^[a-zA-Z_][a-zA-Z_0-9]*/

// Precedence levels for binary operators:
const PREC_PAIR = 1
const PREC_OR = 2
const PREC_AND = 3
const PREC_COMP = 4
const PREC_ORDER = 4
const PREC_ADD = 6
const PREC_SUB = 6
const PREC_MUL = 7
const PREC_DIV = 7
const PREC_MOD = 7
const PREC_POW = 8

// Precedence levels for prefix operators:
const PREC_POS = 10
const PREC_NOT = 10
const PREC_NEG = 8

function parse(str) {
  let pos = 0
  pos = skipWS(str, pos)

  let customFunctions = {}

  // Parse function declarations first
  while (pos < str.length && str.substring(pos, pos + 2) === 'fn') {
    let funcResult = parseFunctionDeclaration(str, pos)
    if (funcResult.type === 'error') return funcResult
    customFunctions[`${funcResult.namespace}::${funcResult.name}`] = funcResult
    pos = skipWS(str, funcResult.position)
  }

  // Parse the main query expression
  let result = parseExpr(str, pos, 0)
  if (result.type === 'error') return result
  pos = skipWS(str, result.position)

  if (pos !== str.length) {
    if (result.failPosition) {
      pos = result.failPosition - 1
    }
    return {type: 'error', message: 'Unexpected end of query', position: pos}
  }
  delete result.position
  delete result.failPosition
  result.customFunctions = customFunctions
  return result
}

function parseExpr(str, pos, level) {
  // In this function we parse precedence "manually" by having two variables:
  //
  // `level` is the minimum precedence level we want to parse at. If this is
  // e.g. 7 then this function will not parse `3 + 4` (since addition is at 6),
  // but instead just return `1` and leave ` + 5` remaining. We use this so that
  // while handling the RHS of the multiplication in `1 + 2 * 3 + 4` we only parse `3`.
  //
  // `lhsLevel` is the precedence level of the currently parsed expression on
  // the left-hand side. This is mainly used to handle non-associativeness.

  // This means that you'll see code like:
  // - `if (level > PREC_XXX) break`: Operator is at this precedence level.
  // - `if (lhsLevel < PREC_XXX) break`: Operator is left-associative.
  // - `if (lhsLevel <= PREC_XXX) break`: Operator is right/non-associative.
  // - `parseExpr(str, pos, PREC_XXX + 1)`: Operator is left/non-assoicate.
  // - `parseExpr(str, pos, PREC_XXX)`: Operator is right-assoicate.

  let startPos = pos
  let token = str[pos]
  let marks

  switch (token) {
    case '+': {
      let rhs = parseExpr(str, skipWS(str, pos + 1), PREC_POS)
      if (rhs.type === 'error') return rhs
      marks = [{name: 'pos', position: startPos}].concat(rhs.marks)
      pos = rhs.position
      break
    }
    case '-': {
      let rhs = parseExpr(str, skipWS(str, pos + 1), PREC_NEG)
      if (rhs.type === 'error') return rhs
      marks = [{name: 'neg', position: startPos}].concat(rhs.marks)
      pos = rhs.position
      break
    }
    case '(': {
      let result = parseGroupOrTuple(str, pos)
      if (result.type === 'error') return result

      pos = result.position
      marks = result.marks

      break
    }
    case '!': {
      let rhs = parseExpr(str, skipWS(str, pos + 1), PREC_NOT)
      if (rhs.type === 'error') return rhs
      marks = [{name: 'not', position: startPos}].concat(rhs.marks)
      pos = rhs.position
      break
    }
    case '{': {
      let result = parseObject(str, pos)
      if (result.type === 'error') return result
      marks = result.marks
      pos = result.position
      break
    }
    case '[':
      marks = [{name: 'array', position: pos}]
      pos = skipWS(str, pos + 1)

      if (str[pos] !== ']') {
        while (true) {
          if (str.slice(pos, pos + 3) === '...') {
            marks.push({name: 'array_splat', position: pos})
            pos = skipWS(str, pos + 3)
          }

          let res = parseExpr(str, pos, 0)
          if (res.type === 'error') return res
          marks = marks.concat(res.marks)
          pos = res.position
          pos = skipWS(str, pos)
          if (str[pos] !== ',') break
          pos = skipWS(str, pos + 1)
          if (str[pos] === ']') break
        }
      }

      if (str[pos] === ']') {
        pos++
        marks.push({name: 'array_end', position: pos})
      } else {
        return {type: 'error', message: 'Expected "]" after array expression', position: pos}
      }

      break
    case "'":
    case '"': {
      let result = parseString(str, pos)
      if (result.type === 'error') return result
      marks = result.marks
      pos = result.position
      break
    }
    case '^': {
      pos++
      marks = []
      while (str[pos] === '.' && str[pos + 1] === '^') {
        marks.push({name: 'dblparent', position: startPos})
        pos += 2
      }
      marks.push({name: 'parent', position: startPos})
      break
    }
    case '@':
      marks = [{name: 'this', position: startPos}]
      pos++
      break
    case '*':
      marks = [{name: 'everything', position: startPos}]
      pos++
      break
    case '$': {
      let identLen = parseRegex(str, pos + 1, IDENT)
      if (identLen) {
        pos += 1 + identLen
        marks = [
          {name: 'param', position: startPos},
          {name: 'ident', position: startPos + 1},
          {name: 'ident_end', position: pos},
        ]
      }
      break
    }
    default: {
      let numLen = parseRegex(str, pos, NUM)
      if (numLen) {
        pos += numLen
        let name = 'integer'

        if (str[pos] === '.') {
          let fracLen = parseRegex(str, pos + 1, NUM)
          if (fracLen) {
            name = 'float'
            pos += 1 + fracLen
          }
        }

        if (str[pos] === 'e' || str[pos] === 'E') {
          name = 'sci'
          pos++
          if (str[pos] === '+' || str[pos] === '-') {
            pos++
          }
          let expLen = parseRegex(str, pos, NUM)
          if (!expLen) return {type: 'error', message: 'Exponent must be a number', position: pos}
          pos += expLen
        }

        marks = [
          {name, position: startPos},
          {name: name + '_end', position: pos},
        ]

        break
      }

      let identLen = parseRegex(str, pos, IDENT)
      if (identLen) {
        pos += identLen
        switch (str[pos]) {
          case ':':
          case '(': {
            let result = parseFuncCall(str, startPos, pos)
            if (result.type === 'error') return result
            marks = result.marks
            pos = result.position
            break
          }
          default: {
            marks = [
              {name: 'this_attr', position: startPos},
              {name: 'ident', position: startPos},
              {name: 'ident_end', position: pos},
            ]
          }
        }

        break
      }
    }
  }

  if (!marks) {
    return {type: 'error', message: 'Expected expression', position: pos}
  }

  let lhsLevel = 12
  let trav

  loop: while (true) {
    let innerPos = skipWS(str, pos)
    if (innerPos === str.length) {
      pos = innerPos
      break
    }

    trav = parseTraversal(str, innerPos)
    if (trav.type === 'success') {
      marks.unshift({name: 'traverse', position: startPos})
      while (trav.type === 'success') {
        marks = marks.concat(trav.marks)
        pos = trav.position
        trav = parseTraversal(str, skipWS(str, pos))
      }
      marks.push({name: 'traversal_end', position: pos})
      continue
    } // ignore if type === 'error'

    let token = str[innerPos]
    switch (token) {
      case '=': {
        let nextToken = str[innerPos + 1]
        switch (nextToken) {
          case '>': {
            // =>
            if (level > PREC_PAIR || lhsLevel <= PREC_PAIR) break loop
            let rhs = parseExpr(str, skipWS(str, innerPos + 2), PREC_PAIR)
            if (rhs.type === 'error') return rhs
            marks = marks.concat(rhs.marks)
            marks.unshift({name: 'pair', position: startPos})
            pos = rhs.position
            lhsLevel = PREC_PAIR
            break
          }
          case '=': {
            // ==
            if (level > PREC_COMP || lhsLevel <= PREC_COMP) break loop
            let rhs = parseExpr(str, skipWS(str, innerPos + 2), PREC_COMP + 1)
            if (rhs.type === 'error') return rhs
            marks.unshift({name: 'comp', position: startPos})
            marks.push({name: 'op', position: innerPos}, {name: 'op_end', position: innerPos + 2})
            marks = marks.concat(rhs.marks)
            pos = rhs.position
            lhsLevel = PREC_COMP
            break
          }
          default:
            break loop
        }
        break
      }
      case '+': {
        if (level > PREC_ADD || lhsLevel < PREC_ADD) break loop
        let rhs = parseExpr(str, skipWS(str, innerPos + 1), PREC_ADD + 1)
        if (rhs.type === 'error') return rhs
        marks = marks.concat(rhs.marks)
        marks.unshift({name: 'add', position: startPos})
        pos = rhs.position
        lhsLevel = PREC_ADD
        break
      }
      case '-': {
        if (level > PREC_SUB || lhsLevel < PREC_SUB) break loop
        let rhs = parseExpr(str, skipWS(str, innerPos + 1), PREC_SUB + 1)
        if (rhs.type === 'error') return rhs
        marks = marks.concat(rhs.marks)
        marks.unshift({name: 'sub', position: startPos})
        pos = rhs.position
        lhsLevel = PREC_SUB
        break
      }
      case '*': {
        if (str[innerPos + 1] === '*') {
          // **
          if (level > PREC_POW || lhsLevel <= PREC_POW) break loop
          let rhs = parseExpr(str, skipWS(str, innerPos + 2), PREC_POW)
          if (rhs.type === 'error') return rhs
          marks = marks.concat(rhs.marks)
          marks.unshift({name: 'pow', position: startPos})
          pos = rhs.position
          lhsLevel = PREC_POW
          break
        }

        // *
        if (level > PREC_MUL || lhsLevel < PREC_MUL) break loop
        let rhs = parseExpr(str, skipWS(str, innerPos + 1), PREC_MUL + 1)
        if (rhs.type === 'error') return rhs
        marks = marks.concat(rhs.marks)
        marks.unshift({name: 'mul', position: startPos})
        pos = rhs.position
        lhsLevel = PREC_MUL
        break
      }
      case '/': {
        if (level > PREC_DIV || lhsLevel < PREC_DIV) break loop
        let rhs = parseExpr(str, skipWS(str, innerPos + 1), PREC_DIV + 1)
        if (rhs.type === 'error') return rhs
        marks = marks.concat(rhs.marks)
        marks.unshift({name: 'div', position: startPos})
        pos = rhs.position
        lhsLevel = PREC_DIV
        break
      }
      case '%': {
        if (level > PREC_MOD || lhsLevel < PREC_MOD) break loop
        let rhs = parseExpr(str, skipWS(str, innerPos + 1), PREC_MOD + 1)
        if (rhs.type === 'error') return rhs
        marks = marks.concat(rhs.marks)
        marks.unshift({name: 'mod', position: startPos})
        pos = rhs.position
        lhsLevel = PREC_MOD
        break
      }
      case '<':
      case '>': {
        if (level > PREC_COMP || lhsLevel <= PREC_COMP) break loop
        let nextPos = innerPos + 1
        if (str[nextPos] === '=') {
          nextPos++
        }
        let rhs = parseExpr(str, skipWS(str, nextPos), PREC_COMP + 1)
        if (rhs.type === 'error') return rhs
        marks.unshift({name: 'comp', position: startPos})
        marks.push({name: 'op', position: innerPos}, {name: 'op_end', position: nextPos})
        marks = marks.concat(rhs.marks)
        pos = rhs.position
        lhsLevel = PREC_COMP
        break
      }
      case '|': {
        if (str[innerPos + 1] === '|') {
          // ||
          if (level > PREC_OR || lhsLevel < PREC_OR) break loop
          let rhs = parseExpr(str, skipWS(str, innerPos + 2), PREC_OR + 1)
          if (rhs.type === 'error') return rhs
          marks = marks.concat(rhs.marks)
          marks.unshift({name: 'or', position: startPos})
          pos = rhs.position
          lhsLevel = PREC_OR
        } else {
          if (level > 11 || lhsLevel < 11) break loop
          // pipe call
          let identPos = skipWS(str, innerPos + 1)
          let identLen = parseRegex(str, identPos, IDENT)
          if (!identLen) return {type: 'error', message: 'Expected identifier', position: identPos}
          pos = identPos + identLen
          if (str[pos] === '(' || str[pos] === ':') {
            let result = parseFuncCall(str, identPos, pos)
            if (result.type === 'error') return result
            marks = marks.concat(result.marks)
            marks.unshift({name: 'pipecall', position: startPos})
            pos = result.position
            lhsLevel = 11
          }
        }
        break
      }
      case '&': {
        // &&
        if (str[innerPos + 1] != '&') break loop
        if (level > PREC_AND || lhsLevel < PREC_AND) break loop
        let rhs = parseExpr(str, skipWS(str, innerPos + 2), PREC_AND + 1)
        if (rhs.type === 'error') return rhs
        marks = marks.concat(rhs.marks)
        marks.unshift({name: 'and', position: startPos})
        pos = rhs.position
        lhsLevel = PREC_AND
        break
      }
      case '!': {
        // !=
        if (str[innerPos + 1] !== '=') break loop
        if (level > PREC_COMP || lhsLevel <= PREC_COMP) break loop
        let rhs = parseExpr(str, skipWS(str, innerPos + 2), PREC_COMP + 1)
        if (rhs.type === 'error') return rhs
        marks.unshift({name: 'comp', position: startPos})
        marks.push({name: 'op', position: innerPos}, {name: 'op_end', position: innerPos + 2})
        marks = marks.concat(rhs.marks)
        pos = rhs.position
        lhsLevel = PREC_COMP
        break
      }
      case 'd': {
        // desc
        if (str.slice(innerPos, innerPos + 4) !== 'desc') break loop
        if (level > PREC_ORDER || lhsLevel < PREC_ORDER) break loop
        marks.unshift({name: 'desc', position: startPos})
        pos = innerPos + 4
        lhsLevel = PREC_ORDER
        break
      }
      case 'a': {
        // asc
        if (str.slice(innerPos, innerPos + 3) !== 'asc') break loop
        if (level > PREC_ORDER || lhsLevel < PREC_ORDER) break loop
        marks.unshift({name: 'asc', position: startPos})
        pos = innerPos + 3
        lhsLevel = PREC_ORDER
        break
      }
      default: {
        let ident = parseRegexStr(str, innerPos, IDENT)
        switch (ident) {
          case 'in': {
            if (level > PREC_COMP || lhsLevel <= PREC_COMP) break loop

            pos = skipWS(str, innerPos + 2)

            let isGroup = false

            if (str[pos] === '(') {
              isGroup = true
              pos = skipWS(str, pos + 1)
            }

            let rangePos = pos
            let result = parseExpr(str, pos, PREC_COMP + 1)
            if (result.type === 'error') return result

            pos = skipWS(str, result.position)

            if (str[pos] === '.' && str[pos + 1] === '.') {
              // LHS in RANGE
              let type = 'inc_range'
              if (str[pos + 2] === '.') {
                type = 'exc_range'
                pos = skipWS(str, pos + 3)
              } else {
                pos = skipWS(str, pos + 2)
              }

              let rhs = parseExpr(str, pos, PREC_COMP + 1)
              if (rhs.type === 'error') return rhs
              marks.unshift({name: 'in_range', position: startPos})
              marks = marks.concat({name: type, position: rangePos}, result.marks, rhs.marks)
              pos = rhs.position
            } else {
              // LHS in RHS
              marks.unshift({name: 'comp', position: startPos})
              marks.push({name: 'op', position: innerPos}, {name: 'op_end', position: innerPos + 2})
              marks = marks.concat(result.marks)
            }

            if (isGroup) {
              pos = skipWS(str, pos)
              if (str[pos] !== ')')
                return {type: 'error', message: 'Expected ")" in group', position: pos}
              pos++
            }

            lhsLevel = PREC_COMP
            break
          }
          case 'match': {
            // match operator
            if (level > PREC_COMP || lhsLevel <= PREC_COMP) break loop
            let rhs = parseExpr(str, skipWS(str, innerPos + 5), PREC_COMP + 1)
            if (rhs.type === 'error') return rhs
            marks.unshift({name: 'comp', position: startPos})
            marks.push({name: 'op', position: innerPos}, {name: 'op_end', position: innerPos + 5})
            marks = marks.concat(rhs.marks)
            pos = rhs.position
            lhsLevel = 4
            break
          }
          default: {
            break loop
          }
        }
      }
    }
  }

  let failPosition = trav?.type === 'error' && trav.position

  return {type: 'success', marks, position: pos, failPosition}
}

function parseGroupOrTuple(str, pos) {
  const startPos = pos
  let marks
  let rhs = parseExpr(str, skipWS(str, pos + 1), 0)
  if (rhs.type === 'error') return rhs
  pos = skipWS(str, rhs.position)
  switch (str[pos]) {
    case ',': {
      // Tuples
      marks = [{name: 'tuple', position: startPos}].concat(rhs.marks)
      pos = skipWS(str, pos + 1)
      while (true) {
        rhs = parseExpr(str, pos, 0)
        if (rhs.type === 'error') return rhs
        marks.push(...rhs.marks)
        pos = skipWS(str, rhs.position)
        if (str[pos] !== ',') break
        pos = skipWS(str, pos + 1)
      }
      if (str[pos] !== ')')
        return {type: 'error', message: 'Expected ")" after tuple expression', position: pos}
      pos++
      marks.push({name: 'tuple_end', position: pos})
      break
    }
    case ')': {
      pos++
      marks = [{name: 'group', position: startPos}].concat(rhs.marks)
      break
    }
    default:
      return {type: 'error', message: `Unexpected character "${str[pos]}"`, position: pos}
  }

  return {type: 'success', marks, position: pos}
}

function parseTraversal(str, pos) {
  let startPos = pos
  switch (str[pos]) {
    case '.': {
      pos = skipWS(str, pos + 1)

      // allow tuples/groups in a traversal for selectors
      if (str[pos] === '(') {
        return parseGroupOrTuple(str, pos)
      }

      let identStart = pos
      let identLen = parseRegex(str, pos, IDENT)
      if (!identLen) return {type: 'error', message: 'Expected identifier after "."', position: pos}
      pos += identLen

      return {
        type: 'success',
        marks: [
          {name: 'attr_access', position: startPos},
          {name: 'ident', position: identStart},
          {name: 'ident_end', position: pos},
        ],
        position: pos,
      }
    }
    case '-':
      if (str[pos + 1] !== '>')
        return {type: 'error', message: 'Expected ">" in reference', position: pos}
      // ->

      let marks = [{name: 'deref', position: startPos}]
      pos += 2

      let identPos = skipWS(str, pos)
      let identLen = parseRegex(str, identPos, IDENT)
      if (identLen) {
        pos = identPos + identLen
        marks.push(
          {name: 'deref_attr', position: identPos},
          {name: 'ident', position: identPos},
          {name: 'ident_end', position: pos},
        )
      }

      return {
        type: 'success',
        marks,
        position: pos,
      }
    case '[': {
      pos = skipWS(str, pos + 1)

      if (str[pos] === ']') {
        return {
          type: 'success',
          marks: [{name: 'array_postfix', position: startPos}],
          position: pos + 1,
        }
      }

      let rangePos = pos
      let result = parseExpr(str, pos, 0)
      if (result.type === 'error') return result

      pos = skipWS(str, result.position)

      if (str[pos] === '.' && str[pos + 1] === '.') {
        let type = 'inc_range'
        if (str[pos + 2] === '.') {
          type = 'exc_range'
          pos += 3
        } else {
          pos += 2
        }

        pos = skipWS(str, pos)
        let rhs = parseExpr(str, pos, 0)
        if (rhs.type === 'error') return rhs
        pos = skipWS(str, rhs.position)
        if (str[pos] !== ']')
          return {type: 'error', message: 'Expected "]" after array expression', position: pos}

        return {
          type: 'success',
          marks: [
            {name: 'slice', position: startPos},
            {name: type, position: rangePos},
          ].concat(result.marks, rhs.marks),
          position: pos + 1,
        }
      }

      if (str[pos] !== ']')
        return {type: 'error', message: 'Expected "]" after array expression', position: pos}

      return {
        type: 'success',
        marks: [{name: 'square_bracket', position: startPos}].concat(result.marks),
        position: pos + 1,
      }
    }
    case '|': {
      pos = skipWS(str, pos + 1)
      if (str[pos] === '{') {
        let result = parseObject(str, pos)
        if (result.type === 'error') return result
        result.marks.unshift({name: 'projection', position: startPos})
        return result
      }
      break
    }
    case '{': {
      let result = parseObject(str, pos)
      if (result.type === 'error') return result
      result.marks.unshift({name: 'projection', position: startPos})
      return result
    }
  }

  return {type: 'error', message: 'Unexpected character in traversal', position: pos}
}

function parseFuncCall(str, startPos, pos) {
  let marks = []

  marks.push({name: 'func_call', position: startPos})

  if (str[pos] === ':' && str[pos + 1] === ':') {
    marks.push({name: 'namespace', position: startPos})
    marks.push({name: 'ident', position: startPos}, {name: 'ident_end', position: pos})
    pos = skipWS(str, pos + 2)
    let nameLen = parseRegex(str, pos, IDENT)
    if (!nameLen) return {type: 'error', message: 'Expected function name', position: pos}
    marks.push({name: 'ident', position: pos}, {name: 'ident_end', position: pos + nameLen})
    pos = skipWS(str, pos + nameLen)
    if (str[pos] !== '(')
      return {type: 'error', message: 'Expected "(" after function name', position: pos}
    pos++
    // Consume any whitespace in front of the function argument.
    pos = skipWS(str, pos)
  } else {
    marks.push({name: 'ident', position: startPos}, {name: 'ident_end', position: pos})
    pos = skipWS(str, pos + 1)
  }

  let lastPos = pos

  if (str[pos] !== ')') {
    while (true) {
      let result = parseExpr(str, pos, 0)
      if (result.type === 'error') return result
      marks = marks.concat(result.marks)
      lastPos = result.position
      pos = skipWS(str, result.position)

      if (str[pos] !== ',') break
      pos = skipWS(str, pos + 1)
      // Also allow trailing commas
      if (str[pos] === ')') break
    }
  }

  if (str[pos] !== ')') {
    return {type: 'error', message: 'Expected ")" after function arguments', position: pos}
  }

  // NOTE: a bit arbitrary the func_args_end points comes before the whitespace.
  marks.push({name: 'func_args_end', position: lastPos})

  return {
    type: 'success',
    marks,
    position: pos + 1,
  }
}

function parseObject(str, pos) {
  let marks = [{name: 'object', position: pos}]
  pos = skipWS(str, pos + 1)

  loop: while (str[pos] !== '}') {
    let pairPos = pos

    if (str.slice(pos, pos + 3) === '...') {
      pos = skipWS(str, pos + 3)
      if (str[pos] !== '}' && str[pos] !== ',') {
        let expr = parseExpr(str, pos, 0)
        if (expr.type === 'error') return expr
        marks.push({name: 'object_splat', position: pairPos})
        marks = marks.concat(expr.marks)
        pos = expr.position
      } else {
        marks.push({name: 'object_splat_this', position: pairPos})
      }
    } else {
      let expr = parseExpr(str, pos, 0)
      if (expr.type === 'error') return expr
      let nextPos = skipWS(str, expr.position)
      if (expr.marks[0].name === 'str' && str[nextPos] === ':') {
        let value = parseExpr(str, skipWS(str, nextPos + 1), 0)
        if (value.type === 'error') return value
        marks.push({name: 'object_pair', position: pairPos})
        marks = marks.concat(expr.marks, value.marks)
        pos = value.position
      } else {
        marks = marks.concat({name: 'object_expr', position: pos}, expr.marks)
        pos = expr.position
      }
    }
    pos = skipWS(str, pos)
    if (str[pos] !== ',') break
    pos = skipWS(str, pos + 1)
  }

  if (str[pos] !== '}') {
    return {type: 'error', message: 'Expected "}" after object', position: pos}
  }

  pos++
  marks.push({name: 'object_end', position: pos})
  return {type: 'success', marks, position: pos}
}

function parseString(str, pos) {
  let token = str[pos]
  pos = pos + 1
  const marks = [{name: 'str', position: pos}]
  str: for (; ; pos++) {
    if (pos > str.length) return {type: 'error', message: 'Unexpected end of query', position: pos}

    switch (str[pos]) {
      case token: {
        marks.push({name: 'str_end', position: pos})
        pos++
        break str
      }
      case '\\': {
        marks.push({name: 'str_pause', position: pos})
        if (str[pos + 1] === 'u') {
          if (str[pos + 2] === '{') {
            marks.push({name: 'unicode_hex', position: pos + 3})
            pos = str.indexOf('}', pos + 3)
            marks.push({name: 'unicode_hex_end', position: pos})
          } else {
            marks.push({name: 'unicode_hex', position: pos + 2})
            marks.push({name: 'unicode_hex_end', position: pos + 6})
            pos += 5
          }
        } else {
          marks.push({name: 'single_escape', position: pos + 1})
          pos += 1
        }
        marks.push({name: 'str_start', position: pos + 1})
      }
    }
  }

  return {type: 'success', marks, position: pos}
}

function skipWS(str, pos) {
  return pos + parseRegex(str, pos, WS)
}

/**
 * Parses a regex at a position and returns the number of characters that was matched.
 */
function parseRegex(str, pos, re) {
  let m = re.exec(str.slice(pos))
  return m ? m[0].length : 0
}

/**
 * Parses a regex at a position and returns matched string.
 */
function parseRegexStr(str, pos, re) {
  let m = re.exec(str.slice(pos))
  return m ? m[0] : null
}

/**
 * Parses a function declaration: fn namespace::name(params) = body;
 */
function parseFunctionDeclaration(str, startPos) {
  let pos = startPos
  let marks = []
  let namespace = ''
  let name = ''

  // Parse "fn"
  if (str.substring(pos, pos + 2) !== 'fn') {
    return {
      type: 'success',
      position: pos,
      marks: marks,
    }
  }
  marks.push({name: 'func_decl', position: startPos})

  pos = skipWS(str, pos + 2)

  let identStart = pos
  namespace = parseRegexStr(str, pos, IDENT)
  if (!namespace) {
    return {type: 'error', message: 'Expected function name', position: pos}
  }
  marks.push(
    {name: 'ident', position: identStart},
    {name: 'ident_end', position: pos + namespace.length},
  )
  pos = skipWS(str, pos + namespace.length)

  // Check for "::"
  if (str.substring(pos, pos + 2) !== '::') {
    return {type: 'error', message: 'Expected "::" after namespace', position: pos}
  }

  pos = skipWS(str, pos + 2)
  name = parseRegexStr(str, pos, IDENT)
  if (!name) {
    return {type: 'error', message: 'Expected function name', position: pos}
  }
  marks.push({name: 'ident', position: pos}, {name: 'ident_end', position: pos + name.length})
  pos = skipWS(str, pos + name.length)

  if (str[pos] !== '(') {
    return {type: 'error', message: 'Expected "("', position: pos}
  }
  pos = skipWS(str, pos + 1)

  // Parse parameters
  while (pos < str.length && str[pos] !== ')') {
    // Parse parameter (should start with $)
    if (str[pos] !== '$') {
      return {type: 'error', message: 'Parameter should start with "$"', position: pos}
    }
    const startPos = pos
    pos++

    const paramName = parseRegexStr(str, pos, IDENT)
    if (!paramName) {
      return {type: 'error', message: 'Expected function name', position: pos}
    }
    pos += paramName.length
    marks.push(
      {name: 'param', position: startPos},
      {name: 'ident', position: startPos + 1},
      {name: 'ident_end', position: pos},
    )
    pos = skipWS(str, pos)

    // Check for comma
    if (str[pos] === ',') {
      pos = skipWS(str, pos + 1)
    } else if (str[pos] !== ')') {
      return {type: 'error', message: 'Expected "," or ")"', position: pos}
    }
  }

  if (str[pos] !== ')') {
    return {type: 'error', message: 'Expected ")"', position: pos}
  }
  marks.push({name: 'func_params_end', position: pos})
  pos = skipWS(str, pos + 1)

  if (str[pos] !== '=') {
    return {type: 'error', message: 'Expected "="', position: pos}
  }
  pos = skipWS(str, pos + 1)

  // Parse function body (expression)
  let bodyResult = parseExpr(str, pos, 0)
  if (bodyResult.type === 'error') return bodyResult
  marks = marks.concat(bodyResult.marks)
  pos = skipWS(str, bodyResult.position)

  // Parse ";"
  if (str[pos] !== ';') {
    return {type: 'error', message: 'Expected ";" after function declaration', position: pos}
  }
  pos++

  return {
    type: 'success',
    position: pos,
    marks: marks,
    namespace,
    name,
  }
}

export {parse}
