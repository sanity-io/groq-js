[groq-js](../README.md) › [Globals](../globals.md) › [StaticValue](staticvalue.md)

# Class: StaticValue <**P**>

## Type parameters

▪ **P**

## Hierarchy

* **StaticValue**

## Index

### Constructors

* [constructor](staticvalue.md#constructor)

### Properties

* [data](staticvalue.md#private-data)

### Methods

* [[Symbol.asyncIterator]](staticvalue.md#[symbol.asynciterator])
* [get](staticvalue.md#get)
* [getBoolean](staticvalue.md#getboolean)
* [getType](staticvalue.md#gettype)

## Constructors

###  constructor

\+ **new StaticValue**(`data`: P): *[StaticValue](staticvalue.md)*

*Defined in [src/evaluator/value.ts:61](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L61)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | P |

**Returns:** *[StaticValue](staticvalue.md)*

## Properties

### `Private` data

• **data**: *P*

*Defined in [src/evaluator/value.ts:61](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L61)*

## Methods

###  [Symbol.asyncIterator]

▸ **[Symbol.asyncIterator]**(): *Generator‹[StaticValue](staticvalue.md)‹any›, void, unknown›*

*Defined in [src/evaluator/value.ts:75](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L75)*

**Returns:** *Generator‹[StaticValue](staticvalue.md)‹any›, void, unknown›*

___

###  get

▸ **get**(): *Promise‹P›*

*Defined in [src/evaluator/value.ts:71](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L71)*

**Returns:** *Promise‹P›*

___

###  getBoolean

▸ **getBoolean**(): *boolean*

*Defined in [src/evaluator/value.ts:87](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L87)*

**Returns:** *boolean*

___

###  getType

▸ **getType**(): *"string" | "number" | "boolean" | "object" | "array" | "pair" | "null" | "range" | "path"*

*Defined in [src/evaluator/value.ts:67](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L67)*

**Returns:** *"string" | "number" | "boolean" | "object" | "array" | "pair" | "null" | "range" | "path"*
