[groq-js](../README.md) › [Globals](../globals.md) › [Range](range.md)

# Class: Range

## Hierarchy

* **Range**

## Index

### Constructors

* [constructor](range.md#constructor)

### Properties

* [exclusive](range.md#private-exclusive)
* [left](range.md#private-left)
* [right](range.md#private-right)

### Methods

* [isExclusive](range.md#isexclusive)
* [toJSON](range.md#tojson)
* [isConstructible](range.md#static-isconstructible)

## Constructors

###  constructor

\+ **new Range**(`left`: string | number, `right`: string | number, `exclusive`: boolean): *[Range](range.md)*

*Defined in [src/evaluator/value.ts:207](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L207)*

**Parameters:**

Name | Type |
------ | ------ |
`left` | string &#124; number |
`right` | string &#124; number |
`exclusive` | boolean |

**Returns:** *[Range](range.md)*

## Properties

### `Private` exclusive

• **exclusive**: *boolean*

*Defined in [src/evaluator/value.ts:207](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L207)*

___

### `Private` left

• **left**: *string | number*

*Defined in [src/evaluator/value.ts:205](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L205)*

___

### `Private` right

• **right**: *string | number*

*Defined in [src/evaluator/value.ts:206](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L206)*

## Methods

###  isExclusive

▸ **isExclusive**(): *boolean*

*Defined in [src/evaluator/value.ts:215](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L215)*

**Returns:** *boolean*

___

###  toJSON

▸ **toJSON**(): *string | number[]*

*Defined in [src/evaluator/value.ts:219](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L219)*

**Returns:** *string | number[]*

___

### `Static` isConstructible

▸ **isConstructible**(`leftType`: string, `rightType`: string): *boolean*

*Defined in [src/evaluator/value.ts:197](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L197)*

**Parameters:**

Name | Type |
------ | ------ |
`leftType` | string |
`rightType` | string |

**Returns:** *boolean*
