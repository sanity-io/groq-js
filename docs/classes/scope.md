[groq-js](../README.md) › [Globals](../globals.md) › [Scope](scope.md)

# Class: Scope

## Hierarchy

* **Scope**

## Index

### Constructors

* [constructor](scope.md#constructor)

### Properties

* [params](scope.md#params)
* [parent](scope.md#parent)
* [source](scope.md#source)
* [timestamp](scope.md#timestamp)
* [value](scope.md#value)

### Methods

* [createNested](scope.md#createnested)

## Constructors

###  constructor

\+ **new Scope**(`params`: object, `source`: any, `value`: [Value](../globals.md#value), `parent`: [Scope](scope.md) | null): *[Scope](scope.md)*

*Defined in [src/evaluator/index.ts:37](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L37)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | object |
`source` | any |
`value` | [Value](../globals.md#value) |
`parent` | [Scope](scope.md) &#124; null |

**Returns:** *[Scope](scope.md)*

## Properties

###  params

• **params**: *object*

*Defined in [src/evaluator/index.ts:33](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L33)*

#### Type declaration:

* \[ **key**: *string*\]: any

___

###  parent

• **parent**: *[Scope](scope.md) | null*

*Defined in [src/evaluator/index.ts:36](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L36)*

___

###  source

• **source**: *any*

*Defined in [src/evaluator/index.ts:34](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L34)*

___

###  timestamp

• **timestamp**: *string*

*Defined in [src/evaluator/index.ts:37](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L37)*

___

###  value

• **value**: *[Value](../globals.md#value)*

*Defined in [src/evaluator/index.ts:35](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L35)*

## Methods

###  createNested

▸ **createNested**(`value`: [Value](../globals.md#value)): *[Scope](scope.md)‹›*

*Defined in [src/evaluator/index.ts:47](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L47)*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [Value](../globals.md#value) |

**Returns:** *[Scope](scope.md)‹›*
