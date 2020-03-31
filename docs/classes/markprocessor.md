[groq-js](../README.md) › [Globals](../globals.md) › [MarkProcessor](markprocessor.md)

# Class: MarkProcessor

## Hierarchy

* **MarkProcessor**

## Index

### Constructors

* [constructor](markprocessor.md#constructor)

### Properties

* [index](markprocessor.md#private-index)
* [marks](markprocessor.md#private-marks)
* [string](markprocessor.md#private-string)
* [visitor](markprocessor.md#private-visitor)

### Methods

* [getMark](markprocessor.md#getmark)
* [hasMark](markprocessor.md#hasmark)
* [process](markprocessor.md#process)
* [processString](markprocessor.md#processstring)
* [processStringEnd](markprocessor.md#processstringend)
* [shift](markprocessor.md#shift)

## Constructors

###  constructor

\+ **new MarkProcessor**(`visitor`: [MarkVisitor](../globals.md#markvisitor), `string`: string, `marks`: [Mark](../interfaces/mark.md)[]): *[MarkProcessor](markprocessor.md)*

*Defined in [src/markProcessor.ts:67](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L67)*

**Parameters:**

Name | Type |
------ | ------ |
`visitor` | [MarkVisitor](../globals.md#markvisitor) |
`string` | string |
`marks` | [Mark](../interfaces/mark.md)[] |

**Returns:** *[MarkProcessor](markprocessor.md)*

## Properties

### `Private` index

• **index**: *number*

*Defined in [src/markProcessor.ts:67](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L67)*

___

### `Private` marks

• **marks**: *[Mark](../interfaces/mark.md)[]*

*Defined in [src/markProcessor.ts:66](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L66)*

___

### `Private` string

• **string**: *string*

*Defined in [src/markProcessor.ts:65](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L65)*

___

### `Private` visitor

• **visitor**: *[MarkVisitor](../globals.md#markvisitor)*

*Defined in [src/markProcessor.ts:64](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L64)*

## Methods

###  getMark

▸ **getMark**(`pos`: number): *[Mark](../interfaces/mark.md)*

*Defined in [src/markProcessor.ts:80](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L80)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`pos` | number | 0 |

**Returns:** *[Mark](../interfaces/mark.md)*

___

###  hasMark

▸ **hasMark**(`pos`: number): *boolean*

*Defined in [src/markProcessor.ts:76](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L76)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`pos` | number | 0 |

**Returns:** *boolean*

___

###  process

▸ **process**(): *any*

*Defined in [src/markProcessor.ts:88](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L88)*

**Returns:** *any*

___

###  processString

▸ **processString**(): *string*

*Defined in [src/markProcessor.ts:96](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L96)*

**Returns:** *string*

___

###  processStringEnd

▸ **processStringEnd**(): *string*

*Defined in [src/markProcessor.ts:101](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L101)*

**Returns:** *string*

___

###  shift

▸ **shift**(): *void*

*Defined in [src/markProcessor.ts:84](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L84)*

**Returns:** *void*
