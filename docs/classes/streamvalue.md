[groq-js](../README.md) › [Globals](../globals.md) › [StreamValue](streamvalue.md)

# Class: StreamValue

A StreamValue accepts a generator which yields values.

## Hierarchy

* **StreamValue**

## Index

### Constructors

* [constructor](streamvalue.md#constructor)

### Properties

* [data](streamvalue.md#private-data)
* [generator](streamvalue.md#private-generator)
* [isDone](streamvalue.md#private-isdone)
* [ticker](streamvalue.md#private-ticker)

### Methods

* [[Symbol.asyncIterator]](streamvalue.md#[symbol.asynciterator])
* [_nextTick](streamvalue.md#_nexttick)
* [get](streamvalue.md#get)
* [getBoolean](streamvalue.md#getboolean)
* [getType](streamvalue.md#gettype)

## Constructors

###  constructor

\+ **new StreamValue**(`generator`: function): *[StreamValue](streamvalue.md)*

*Defined in [src/evaluator/value.ts:101](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L101)*

**Parameters:**

▪ **generator**: *function*

▸ (): *AsyncGenerator‹[Value](../globals.md#value), void, unknown›*

**Returns:** *[StreamValue](streamvalue.md)*

## Properties

### `Private` data

• **data**: *any[]*

*Defined in [src/evaluator/value.ts:101](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L101)*

___

### `Private` generator

• **generator**: *function*

*Defined in [src/evaluator/value.ts:98](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L98)*

#### Type declaration:

▸ (): *AsyncGenerator‹[Value](../globals.md#value), void, unknown›*

___

### `Private` isDone

• **isDone**: *boolean*

*Defined in [src/evaluator/value.ts:100](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L100)*

___

### `Private` ticker

• **ticker**: *Promise‹void› | null*

*Defined in [src/evaluator/value.ts:99](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L99)*

## Methods

###  [Symbol.asyncIterator]

▸ **[Symbol.asyncIterator]**(): *AsyncGenerator‹any, void, unknown›*

*Defined in [src/evaluator/value.ts:122](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L122)*

**Returns:** *AsyncGenerator‹any, void, unknown›*

___

###  _nextTick

▸ **_nextTick**(): *Promise‹void›*

*Defined in [src/evaluator/value.ts:139](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L139)*

**Returns:** *Promise‹void›*

___

###  get

▸ **get**(): *Promise‹any[]›*

*Defined in [src/evaluator/value.ts:114](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L114)*

**Returns:** *Promise‹any[]›*

___

###  getBoolean

▸ **getBoolean**(): *boolean*

*Defined in [src/evaluator/value.ts:135](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L135)*

**Returns:** *boolean*

___

###  getType

▸ **getType**(): *string*

*Defined in [src/evaluator/value.ts:110](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L110)*

**Returns:** *string*
