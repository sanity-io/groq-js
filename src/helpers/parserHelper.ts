import {Mark} from '../rawParser'

export function processTraversalsWithTuples(marks: Mark[]) {
  let counter = 0

  while (counter < marks.length) {
    if (marks[counter].name === 'traverse') {
      const tuplePresent = traversalHasTuple(marks, counter)
      if (!tuplePresent) break

      const traversalEndPosition = findTraversalEndPosition(marks, counter)
      const originalTraversalMarks = marks.slice(counter, traversalEndPosition + 1)

      var transformedTraversal
      // We process traversals based on whether the tuple is the first or last node in the traversal
      if (marks[counter + 1].name === 'tuple') {
        transformedTraversal = applyAttributeToTuple(originalTraversalMarks)
      } else {
        transformedTraversal = applyTupleToAttribute(originalTraversalMarks)
      }

      // We replace the original traversal with the transformed traversal
      marks.splice(counter, originalTraversalMarks.length, ...transformedTraversal)

      // We skip to the end of the newly inserted transformed traversal
      counter += traversalEndPosition - originalTraversalMarks.length + transformedTraversal.length
    }

    counter++
  }

  return marks
}

function traversalHasTuple(marks: Mark[], startPosition: number): boolean {
  return marks
    .slice(startPosition, marks.length)
    .map((mark) => mark.name)
    .includes('tuple')
}

// Transform traversal structure from `(foo, bar).thing` to `(foo.thing, bar.thing)`
function applyAttributeToTuple(originalTraversalMarks: Mark[]) {
  let transformedTraversal: Mark[] = []
  let attributeIdentifierMarks: Mark[] = []

  const tupleEndPosition = originalTraversalMarks.findIndex((mark) => mark.name === 'tuple_end')
  let counter = tupleEndPosition + 1 // We skip over the tuple to get to the attribute ident

  while (
    counter < originalTraversalMarks.length &&
    originalTraversalMarks[counter].name !== 'traversal_end'
  ) {
    attributeIdentifierMarks.push(originalTraversalMarks[counter])
    counter++
  }

  counter = 1 // 0th mark will be `traverse` mark, which we want to ignore.
  transformedTraversal.push(originalTraversalMarks[counter]) // We start with the initial `tuple` mark.
  counter++

  while (
    counter < originalTraversalMarks.length &&
    originalTraversalMarks[counter].name !== 'tuple_end'
  ) {
    if (originalTraversalMarks[counter].name === 'this_attr') {
      // Build a new traversal in the form `foo.thing`
      transformedTraversal = transformedTraversal.concat(
        {name: 'traverse', position: originalTraversalMarks[counter].position},
        originalTraversalMarks.slice(counter, counter + 3), // Identifiers take up 3 marks
        attributeIdentifierMarks,
        {name: 'traversal_end', position: attributeIdentifierMarks[2].position}
      )
      counter += 2
    }
    counter++
  }

  transformedTraversal.push(originalTraversalMarks[counter]) // Finish with `tuple_end` mark.
  return transformedTraversal
}

// Transform traversal structure from `thing.(foo, bar)` to `(thing.foo, thing.bar)`
function applyTupleToAttribute(originalTraversalMarks: Mark[]) {
  let transformedTraversal: Mark[] = []
  let baseMarks: Mark[] = []

  let counter = 1 // 0th mark will be `traverse` mark, which we want to ignore.

  while (
    counter < originalTraversalMarks.length &&
    originalTraversalMarks[counter].name !== 'tuple'
  ) {
    baseMarks.push(originalTraversalMarks[counter])
    counter++
  }

  transformedTraversal.push(originalTraversalMarks[counter]) // We start with the initial `tuple` mark.
  counter++

  // We assume all nodes inside the tuple are plain identifiers with 3 marks each
  while (
    counter < originalTraversalMarks.length &&
    originalTraversalMarks[counter].name !== 'tuple_end'
  ) {
    if (originalTraversalMarks[counter].name === 'this_attr') {
      // Build a new traversal in the form `thing.foo`
      let attributeMarks = originalTraversalMarks.slice(counter, counter + baseMarks.length) // Up to and including the `ident_end` mark.
      attributeMarks[0].name = 'attr_access' // Require change from `this_attr` to `attr_access` so traversals work properly
      transformedTraversal = transformedTraversal.concat(
        {name: 'traverse', position: attributeMarks[0].position},
        baseMarks,
        attributeMarks,
        {name: 'traversal_end', position: attributeMarks[2].position}
      )

      counter += 2 // Jump over the rest of the attribute identifier
    }

    counter++
  }

  transformedTraversal.push(originalTraversalMarks[counter]) // Finish with `tuple_end` mark.
  return transformedTraversal
}

function findTraversalEndPosition(marks: Mark[], startPosition: number) {
  let counter = startPosition
  while (counter < marks.length && marks[counter].name !== 'traversal_end') counter++

  if (marks[counter].name !== 'traversal_end') {
    return -1
  } else {
    return counter
  }
}
