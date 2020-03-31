[groq-js](../README.md) › [Globals](../globals.md) › [MapperValue](mappervalue.md)

# Class: MapperValue

## Hierarchy

* **MapperValue**

## Index

### Constructors

* [constructor](mappervalue.md#constructor)

### Properties

* [value](mappervalue.md#value)

### Methods

* [[Symbol.asyncIterator]](mappervalue.md#[symbol.asynciterator])
* [get](mappervalue.md#get)
* [getBoolean](mappervalue.md#getboolean)
* [getType](mappervalue.md#gettype)

## Constructors

###  constructor

\+ **new MapperValue**(`value`: [Value](../globals.md#value)): *[MapperValue](mappervalue.md)*

*Defined in [src/evaluator/value.ts:171](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L171)*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [Value](../globals.md#value) |

**Returns:** *[MapperValue](mappervalue.md)*

## Properties

###  value

• **value**: *[Value](../globals.md#value)*

*Defined in [src/evaluator/value.ts:171](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L171)*

## Methods

###  [Symbol.asyncIterator]

▸ **[Symbol.asyncIterator]**(): *any*

*Defined in [src/evaluator/value.ts:185](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L185)*

**Returns:** *any*

___

###  get

▸ **get**(): *Promise‹any›*

*Defined in [src/evaluator/value.ts:181](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L181)*

**Returns:** *Promise‹any›*

___

###  getBoolean

▸ **getBoolean**(): *boolean*

*Defined in [src/evaluator/value.ts:191](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L191)*

**Returns:** *boolean*

___

###  getType

▸ **getType**(): *string*

*Defined in [src/evaluator/value.ts:177](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L177)*

**Returns:** *string*
