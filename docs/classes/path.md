[groq-js](../README.md) › [Globals](../globals.md) › [Path](path.md)

# Class: Path

## Hierarchy

* **Path**

## Index

### Constructors

* [constructor](path.md#constructor)

### Properties

* [pattern](path.md#private-pattern)
* [patternRe](path.md#private-patternre)

### Methods

* [matches](path.md#matches)
* [toJSON](path.md#tojson)

## Constructors

###  constructor

\+ **new Path**(`pattern`: string): *[Path](path.md)*

*Defined in [src/evaluator/value.ts:259](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L259)*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |

**Returns:** *[Path](path.md)*

## Properties

### `Private` pattern

• **pattern**: *string*

*Defined in [src/evaluator/value.ts:258](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L258)*

___

### `Private` patternRe

• **patternRe**: *RegExp*

*Defined in [src/evaluator/value.ts:259](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L259)*

## Methods

###  matches

▸ **matches**(`str`: string): *boolean*

*Defined in [src/evaluator/value.ts:266](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L266)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *boolean*

___

###  toJSON

▸ **toJSON**(): *string*

*Defined in [src/evaluator/value.ts:270](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L270)*

**Returns:** *string*
