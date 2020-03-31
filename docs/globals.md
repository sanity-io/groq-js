[groq-js](README.md) › [Globals](globals.md)

# groq-js

## Index

### Classes

* [GroqSyntaxError](classes/groqsyntaxerror.md)
* [MapperValue](classes/mappervalue.md)
* [MarkProcessor](classes/markprocessor.md)
* [Pair](classes/pair.md)
* [Path](classes/path.md)
* [Range](classes/range.md)
* [Scope](classes/scope.md)
* [StaticValue](classes/staticvalue.md)
* [StreamValue](classes/streamvalue.md)

### Interfaces

* [AndNode](interfaces/andnode.md)
* [ArrayElementNode](interfaces/arrayelementnode.md)
* [ArrayNode](interfaces/arraynode.md)
* [AscNode](interfaces/ascnode.md)
* [AttributeNode](interfaces/attributenode.md)
* [DerefNode](interfaces/derefnode.md)
* [DescNode](interfaces/descnode.md)
* [ElementNode](interfaces/elementnode.md)
* [EvaluateOptions](interfaces/evaluateoptions.md)
* [FilterNode](interfaces/filternode.md)
* [FuncCallNode](interfaces/funccallnode.md)
* [IdentifierNode](interfaces/identifiernode.md)
* [MapperNode](interfaces/mappernode.md)
* [Mark](interfaces/mark.md)
* [NegNode](interfaces/negnode.md)
* [NotNode](interfaces/notnode.md)
* [ObjectAttributeNode](interfaces/objectattributenode.md)
* [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md)
* [ObjectNode](interfaces/objectnode.md)
* [ObjectSplatNode](interfaces/objectsplatnode.md)
* [OpCallNode](interfaces/opcallnode.md)
* [OrNode](interfaces/ornode.md)
* [PairNode](interfaces/pairnode.md)
* [ParameterNode](interfaces/parameternode.md)
* [ParentNode](interfaces/parentnode.md)
* [ParenthesisNode](interfaces/parenthesisnode.md)
* [PipeFuncCallNode](interfaces/pipefunccallnode.md)
* [PosNode](interfaces/posnode.md)
* [ProjectionNode](interfaces/projectionnode.md)
* [RangeNode](interfaces/rangenode.md)
* [SliceNode](interfaces/slicenode.md)
* [StarNode](interfaces/starnode.md)
* [ThisNode](interfaces/thisnode.md)
* [ValueNode](interfaces/valuenode.md)

### Type aliases

* [EscapeSequences](globals.md#escapesequences)
* [Executor](globals.md#executor)
* [ExecutorMap](globals.md#executormap)
* [GroqFunction](globals.md#groqfunction)
* [GroqFunctionArg](globals.md#groqfunctionarg)
* [GroqOperator](globals.md#groqoperator)
* [GroqOperatorFn](globals.md#groqoperatorfn)
* [GroqPipeFunction](globals.md#groqpipefunction)
* [GroqValueName](globals.md#groqvaluename)
* [MarkName](globals.md#markname)
* [MarkVisitor](globals.md#markvisitor)
* [NestedPropertyType](globals.md#nestedpropertytype)
* [NodeBuilder](globals.md#nodebuilder)
* [NodeBuilderArgs](globals.md#nodebuilderargs)
* [NodeName](globals.md#nodename)
* [OpCall](globals.md#opcall)
* [SyntaxNode](globals.md#syntaxnode)
* [Value](globals.md#value)

### Variables

* [FALSE_VALUE](globals.md#const-false_value)
* [NESTED_PROPERTY_TYPES](globals.md#const-nested_property_types)
* [NULL_VALUE](globals.md#const-null_value)
* [TRUE_VALUE](globals.md#const-true_value)
* [isEqual](globals.md#const-isequal)
* [rawParse](globals.md#rawparse)

### Functions

* [countUTF8](globals.md#countutf8)
* [equality](globals.md#equality)
* [escapeRegExp](globals.md#escaperegexp)
* [evaluate](globals.md#evaluate)
* [execute](globals.md#execute)
* [expandEscapeSequence](globals.md#expandescapesequence)
* [expandHex](globals.md#expandhex)
* [extractPropertyKey](globals.md#extractpropertykey)
* [fromJS](globals.md#fromjs)
* [fromNumber](globals.md#fromnumber)
* [gatherText](globals.md#gathertext)
* [getType](globals.md#gettype)
* [hasReference](globals.md#hasreference)
* [inMapper](globals.md#inmapper)
* [isIterator](globals.md#isiterator)
* [isNestedPropertyType](globals.md#isnestedpropertytype)
* [isNumber](globals.md#isnumber)
* [isString](globals.md#isstring)
* [isValueNode](globals.md#isvaluenode)
* [numericOperator](globals.md#numericoperator)
* [parse](globals.md#parse)
* [partialCompare](globals.md#partialcompare)
* [pathRegExp](globals.md#pathregexp)
* [totalCompare](globals.md#totalcompare)

### Object literals

* [BUILDER](globals.md#const-builder)
* [ESCAPE_SEQUENCE](globals.md#const-escape_sequence)
* [EXECUTORS](globals.md#const-executors)
* [TYPE_ORDER](globals.md#const-type_order)
* [functions](globals.md#const-functions)
* [operators](globals.md#const-operators)
* [pipeFunctions](globals.md#const-pipefunctions)

## Type aliases

###  EscapeSequences

Ƭ **EscapeSequences**: *"'" | """ | "\" | "/" | "b" | "f" | "n" | "r" | "t"*

*Defined in [src/parser.ts:17](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L17)*

___

###  Executor

Ƭ **Executor**: *function*

*Defined in [src/evaluator/index.ts:61](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L61)*

#### Type declaration:

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

___

###  ExecutorMap

Ƭ **ExecutorMap**: *object*

*Defined in [src/evaluator/index.ts:63](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L63)*

#### Type declaration:

* \[ **key**: *string*\]: any

* **And**(): *function*

  * (`node`: [AndNode](interfaces/andnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Array**(): *function*

  * (`node`: [ArrayNode](interfaces/arraynode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Asc**(): *function*

  * (`node`: [AscNode](interfaces/ascnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Attribute**(): *function*

  * (`node`: [AttributeNode](interfaces/attributenode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Deref**(): *function*

  * (`node`: [DerefNode](interfaces/derefnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Desc**(): *function*

  * (`node`: [DescNode](interfaces/descnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Element**(): *function*

  * (`node`: [ElementNode](interfaces/elementnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Filter**(): *function*

  * (`node`: [FilterNode](interfaces/filternode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **FuncCall**(): *function*

  * (`node`: [FuncCallNode](interfaces/funccallnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Identifier**(): *function*

  * (`node`: [IdentifierNode](interfaces/identifiernode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Mapper**(): *function*

  * (`node`: [MapperNode](interfaces/mappernode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Neg**(): *function*

  * (`node`: [NegNode](interfaces/negnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Not**(): *function*

  * (`node`: [NotNode](interfaces/notnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Object**(): *function*

  * (`node`: [ObjectNode](interfaces/objectnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **OpCall**(): *function*

  * (`node`: [OpCallNode](interfaces/opcallnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Or**(): *function*

  * (`node`: [OrNode](interfaces/ornode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Pair**(): *function*

  * (`node`: [PairNode](interfaces/pairnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Parameter**(): *function*

  * (`node`: [ParameterNode](interfaces/parameternode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Parent**(): *function*

  * (`node`: [ParentNode](interfaces/parentnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Parenthesis**(): *function*

  * (`node`: [ParenthesisNode](interfaces/parenthesisnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **PipeFuncCall**(): *function*

  * (`node`: [PipeFuncCallNode](interfaces/pipefunccallnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Pos**(): *function*

  * (`node`: [PosNode](interfaces/posnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Projection**(): *function*

  * (`node`: [ProjectionNode](interfaces/projectionnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Range**(): *function*

  * (`node`: [RangeNode](interfaces/rangenode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Slice**(): *function*

  * (`node`: [SliceNode](interfaces/slicenode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Star**(): *function*

  * (`node`: [StarNode](interfaces/starnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **This**(): *function*

  * (`node`: [ThisNode](interfaces/thisnode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

* **Value**(): *function*

  * (`node`: [ValueNode](interfaces/valuenode.md), `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

___

###  GroqFunction

Ƭ **GroqFunction**: *function*

*Defined in [src/evaluator/functions.ts:48](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L48)*

#### Type declaration:

▸ (`args`: [GroqFunctionArg](globals.md#groqfunctionarg)[], `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`args` | [GroqFunctionArg](globals.md#groqfunctionarg)[] |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

___

###  GroqFunctionArg

Ƭ **GroqFunctionArg**: *any*

*Defined in [src/evaluator/functions.ts:47](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L47)*

___

###  GroqOperator

Ƭ **GroqOperator**: *"==" | "!=" | ">" | ">=" | "<" | "<=" | "+" | "-" | "*" | "/" | "%" | "**" | "in" | "match"*

*Defined in [src/evaluator/operators.ts:7](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L7)*

___

###  GroqOperatorFn

Ƭ **GroqOperatorFn**: *function*

*Defined in [src/evaluator/operators.ts:23](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L23)*

#### Type declaration:

▸ (`left`: [SyntaxNode](globals.md#syntaxnode), `right`: [SyntaxNode](globals.md#syntaxnode), `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`left` | [SyntaxNode](globals.md#syntaxnode) |
`right` | [SyntaxNode](globals.md#syntaxnode) |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

___

###  GroqPipeFunction

Ƭ **GroqPipeFunction**: *function*

*Defined in [src/evaluator/functions.ts:183](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L183)*

#### Type declaration:

▸ (`base`: [Value](globals.md#value), `args`: [SyntaxNode](globals.md#syntaxnode)[], `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`base` | [Value](globals.md#value) |
`args` | [SyntaxNode](globals.md#syntaxnode)[] |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

___

###  GroqValueName

Ƭ **GroqValueName**: *"null" | "boolean" | "number" | "string" | "array" | "object" | "range" | "pair" | "path"*

*Defined in [src/evaluator/value.ts:1](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L1)*

___

###  MarkName

Ƭ **MarkName**: *"add" | "and" | "arr_expr" | "array_end" | "array_splat" | "array" | "asc" | "attr_ident" | "comp" | "dblparent" | "deref_field" | "deref" | "desc" | "div" | "exc_range" | "filter" | "float" | "func_args_end" | "func_call" | "ident" | "inc_range" | "integer" | "mod" | "mul" | "neg" | "not" | "object_end" | "object_expr" | "object_pair" | "object_splat_this" | "object_splat" | "object" | "or" | "pair" | "param" | "paren" | "parent" | "pipecall" | "pos" | "pow" | "project" | "sci" | "star" | "str_begin" | "sub" | "this"*

*Defined in [src/markProcessor.ts:8](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L8)*

___

###  MarkVisitor

Ƭ **MarkVisitor**: *object*

*Defined in [src/markProcessor.ts:61](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/markProcessor.ts#L61)*

#### Type declaration:

___

###  NestedPropertyType

Ƭ **NestedPropertyType**: *[IdentifierNode](interfaces/identifiernode.md) | [DerefNode](interfaces/derefnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [MapperNode](interfaces/mappernode.md) | [FilterNode](interfaces/filternode.md) | [ElementNode](interfaces/elementnode.md) | [SliceNode](interfaces/slicenode.md)*

*Defined in [src/parser.ts:532](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L532)*

___

###  NodeBuilder

Ƭ **NodeBuilder**: *function*

*Defined in [src/parser.ts:55](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L55)*

A tree-structure representing a GROQ query.

**`property`** {string} type The type of the node.

**`abstract`** 

#### Type declaration:

▸ (`this`: [MarkVisitor](globals.md#markvisitor), `processor`: [MarkProcessor](classes/markprocessor.md), `mark`: [Mark](interfaces/mark.md)): *P*

**Parameters:**

Name | Type |
------ | ------ |
`this` | [MarkVisitor](globals.md#markvisitor) |
`processor` | [MarkProcessor](classes/markprocessor.md) |
`mark` | [Mark](interfaces/mark.md) |

___

###  NodeBuilderArgs

Ƭ **NodeBuilderArgs**: *[[MarkProcessor](classes/markprocessor.md), [Mark](interfaces/mark.md)]*

*Defined in [src/parser.ts:61](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L61)*

___

###  NodeName

Ƭ **NodeName**: *"And" | "Array" | "ArrayElement" | "Asc" | "Attribute" | "Deref" | "Desc" | "Element" | "Filter" | "FuncCall" | "Identifier" | "Mapper" | "Neg" | "Not" | "Object" | "ObjectAttribute" | "ObjectConditionalSplat" | "ObjectSplat" | "OpCall" | "Or" | "Pair" | "Parameter" | "Parent" | "Parenthesis" | "PipeFuncCall" | "Pos" | "Projection" | "Range" | "Slice" | "Star" | "This" | "Value"*

*Defined in [src/nodeTypes.ts:37](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/nodeTypes.ts#L37)*

___

###  OpCall

Ƭ **OpCall**: *"+" | "-" | "*" | "/" | "%" | "**"*

*Defined in [src/nodeTypes.ts:35](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/nodeTypes.ts#L35)*

___

###  SyntaxNode

Ƭ **SyntaxNode**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)*

*Defined in [src/nodeTypes.ts:1](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/nodeTypes.ts#L1)*

___

###  Value

Ƭ **Value**: *[StaticValue](classes/staticvalue.md) | [StreamValue](classes/streamvalue.md) | [MapperValue](classes/mappervalue.md)*

*Defined in [src/evaluator/value.ts:58](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L58)*

Returns a JavaScript representation of the value.

**`async`** 

**`function`** 

**`returns`** 

**`name`** Value#get

## Variables

### `Const` FALSE_VALUE

• **FALSE_VALUE**: *[StaticValue](classes/staticvalue.md)‹boolean›* = new StaticValue(false)

*Defined in [src/evaluator/value.ts:304](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L304)*

___

### `Const` NESTED_PROPERTY_TYPES

• **NESTED_PROPERTY_TYPES**: *string[]* = ['Deref', 'Projection', 'Mapper', 'Filter', 'Element', 'Slice']

*Defined in [src/parser.ts:541](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L541)*

___

### `Const` NULL_VALUE

• **NULL_VALUE**: *[StaticValue](classes/staticvalue.md)‹any›* = new StaticValue(null)

*Defined in [src/evaluator/value.ts:302](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L302)*

___

### `Const` TRUE_VALUE

• **TRUE_VALUE**: *[StaticValue](classes/staticvalue.md)‹boolean›* = new StaticValue(true)

*Defined in [src/evaluator/value.ts:303](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L303)*

___

### `Const` isEqual

• **isEqual**: *[equality](globals.md#equality)* = equality

*Defined in [src/evaluator/equality.ts:3](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/equality.ts#L3)*

___

###  rawParse

• **rawParse**: *any*

*Defined in [src/parser.ts:3](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L3)*

## Functions

###  countUTF8

▸ **countUTF8**(`str`: string): *number*

*Defined in [src/evaluator/functions.ts:32](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *number*

___

###  equality

▸ **equality**(`a`: [Value](globals.md#value), `b`: [Value](globals.md#value)): *Promise‹boolean›*

*Defined in [src/evaluator/equality.ts:5](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/equality.ts#L5)*

**Parameters:**

Name | Type |
------ | ------ |
`a` | [Value](globals.md#value) |
`b` | [Value](globals.md#value) |

**Returns:** *Promise‹boolean›*

___

###  escapeRegExp

▸ **escapeRegExp**(`string`: string): *string*

*Defined in [src/evaluator/value.ts:238](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L238)*

**Parameters:**

Name | Type |
------ | ------ |
`string` | string |

**Returns:** *string*

___

###  evaluate

▸ **evaluate**(`tree`: NodeTypes.SyntaxNode, `options`: [EvaluateOptions](interfaces/evaluateoptions.md)): *Promise‹any›*

*Defined in [src/evaluator/index.ts:480](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L480)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`tree` | NodeTypes.SyntaxNode | - |
`options` | [EvaluateOptions](interfaces/evaluateoptions.md) | {} |

**Returns:** *Promise‹any›*

___

###  execute

▸ **execute**(`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *any*

*Defined in [src/evaluator/index.ts:52](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L52)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *any*

___

###  expandEscapeSequence

▸ **expandEscapeSequence**(`str`: String): *string*

*Defined in [src/parser.ts:36](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L36)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | String |

**Returns:** *string*

___

###  expandHex

▸ **expandHex**(`str`: string): *string*

*Defined in [src/parser.ts:31](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *string*

___

###  extractPropertyKey

▸ **extractPropertyKey**(`node`: NodeTypes.SyntaxNode): *string*

*Defined in [src/parser.ts:547](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L547)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |

**Returns:** *string*

___

###  fromJS

▸ **fromJS**(`val`: any): *any*

*Defined in [src/evaluator/value.ts:287](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L287)*

**Parameters:**

Name | Type |
------ | ------ |
`val` | any |

**Returns:** *any*

___

###  fromNumber

▸ **fromNumber**(`num`: number): *any*

*Defined in [src/evaluator/value.ts:275](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L275)*

**Parameters:**

Name | Type |
------ | ------ |
`num` | number |

**Returns:** *any*

___

###  gatherText

▸ **gatherText**(`value`: [Value](globals.md#value), `cb`: function): *Promise‹boolean›*

*Defined in [src/evaluator/operators.ts:189](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L189)*

**Parameters:**

▪ **value**: *[Value](globals.md#value)*

▪ **cb**: *function*

▸ (`str`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *Promise‹boolean›*

___

###  getType

▸ **getType**(`data`: any): *[GroqValueName](globals.md#groqvaluename)*

*Defined in [src/evaluator/value.ts:12](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L12)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | any |

**Returns:** *[GroqValueName](globals.md#groqvaluename)*

___

###  hasReference

▸ **hasReference**(`value`: any, `id`: string): *boolean*

*Defined in [src/evaluator/functions.ts:15](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L15)*

**Parameters:**

Name | Type |
------ | ------ |
`value` | any |
`id` | string |

**Returns:** *boolean*

___

###  inMapper

▸ **inMapper**(`value`: [Value](globals.md#value), `fn`: function): *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹› | PromiseLike‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:18](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L18)*

**Parameters:**

▪ **value**: *[Value](globals.md#value)*

▪ **fn**: *function*

▸ (`value`: [Value](globals.md#value)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [Value](globals.md#value) |

**Returns:** *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹› | PromiseLike‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

___

###  isIterator

▸ **isIterator**(`obj?`: Iterator‹any›): *boolean*

*Defined in [src/evaluator/value.ts:283](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L283)*

**Parameters:**

Name | Type |
------ | ------ |
`obj?` | Iterator‹any› |

**Returns:** *boolean*

___

###  isNestedPropertyType

▸ **isNestedPropertyType**(`node`: NodeTypes.SyntaxNode): *node is NestedPropertyType*

*Defined in [src/parser.ts:543](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L543)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |

**Returns:** *node is NestedPropertyType*

___

###  isNumber

▸ **isNumber**(`node`: NodeTypes.SyntaxNode): *node is ValueNode<number>*

*Defined in [src/parser.ts:9](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L9)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |

**Returns:** *node is ValueNode<number>*

___

###  isString

▸ **isString**(`node`: NodeTypes.SyntaxNode): *node is ValueNode<string>*

*Defined in [src/parser.ts:13](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L13)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |

**Returns:** *node is ValueNode<string>*

___

###  isValueNode

▸ **isValueNode**(`node`: NodeTypes.SyntaxNode): *node is ValueNode*

*Defined in [src/parser.ts:5](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L5)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |

**Returns:** *node is ValueNode*

___

###  numericOperator

▸ **numericOperator**(`impl`: function): *[GroqOperatorFn](globals.md#groqoperatorfn)*

*Defined in [src/evaluator/operators.ts:173](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L173)*

**Parameters:**

▪ **impl**: *function*

▸ (`a`: number, `b`: number): *number*

**Parameters:**

Name | Type |
------ | ------ |
`a` | number |
`b` | number |

**Returns:** *[GroqOperatorFn](globals.md#groqoperatorfn)*

___

###  parse

▸ **parse**(`input`: string): *any*

*Defined in [src/parser.ts:577](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L577)*

Parses a GROQ query and returns a tree structure.

**`alias`** module:groq-js.parse

**`static`** 

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`input` | string | GROQ query |

**Returns:** *any*

___

###  partialCompare

▸ **partialCompare**(`a`: any, `b`: any): *number*

*Defined in [src/evaluator/ordering.ts:9](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/ordering.ts#L9)*

**Parameters:**

Name | Type |
------ | ------ |
`a` | any |
`b` | any |

**Returns:** *number*

___

###  pathRegExp

▸ **pathRegExp**(`pattern`: string): *RegExp‹›*

*Defined in [src/evaluator/value.ts:242](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/value.ts#L242)*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |

**Returns:** *RegExp‹›*

___

###  totalCompare

▸ **totalCompare**(`a`: any, `b`: any): *number*

*Defined in [src/evaluator/ordering.ts:26](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/ordering.ts#L26)*

**Parameters:**

Name | Type |
------ | ------ |
`a` | any |
`b` | any |

**Returns:** *number*

## Object literals

### `Const` BUILDER

### ▪ **BUILDER**: *object*

*Defined in [src/parser.ts:63](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L63)*

###  add

▸ **add**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OpCallNode](interfaces/opcallnode.md)*

*Defined in [src/parser.ts:230](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L230)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OpCallNode](interfaces/opcallnode.md)*

###  and

▸ **and**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[AndNode](interfaces/andnode.md)*

*Defined in [src/parser.ts:476](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L476)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[AndNode](interfaces/andnode.md)*

###  arr_expr

▸ **arr_expr**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[MapperNode](interfaces/mappernode.md)*

*Defined in [src/parser.ts:168](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L168)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[MapperNode](interfaces/mappernode.md)*

###  array

▸ **array**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ArrayNode](interfaces/arraynode.md)*

*Defined in [src/parser.ts:428](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L428)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ArrayNode](interfaces/arraynode.md)*

###  asc

▸ **asc**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[AscNode](interfaces/ascnode.md)*

*Defined in [src/parser.ts:504](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L504)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[AscNode](interfaces/ascnode.md)*

###  attr_ident

▸ **attr_ident**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[AttributeNode](interfaces/attributenode.md)*

*Defined in [src/parser.ts:157](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L157)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[AttributeNode](interfaces/attributenode.md)*

###  comp

▸ **comp**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OpCallNode](interfaces/opcallnode.md)*

*Defined in [src/parser.ts:314](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L314)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OpCallNode](interfaces/opcallnode.md)*

###  dblparent

▸ **dblparent**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ParentNode](interfaces/parentnode.md)*

*Defined in [src/parser.ts:136](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L136)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ParentNode](interfaces/parentnode.md)*

###  deref

▸ **deref**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[DerefNode](interfaces/derefnode.md) | [AttributeNode](interfaces/attributenode.md)*

*Defined in [src/parser.ts:296](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L296)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[DerefNode](interfaces/derefnode.md) | [AttributeNode](interfaces/attributenode.md)*

###  desc

▸ **desc**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[DescNode](interfaces/descnode.md)*

*Defined in [src/parser.ts:513](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L513)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[DescNode](interfaces/descnode.md)*

###  div

▸ **div**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OpCallNode](interfaces/opcallnode.md)*

*Defined in [src/parser.ts:263](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L263)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OpCallNode](interfaces/opcallnode.md)*

###  exc_range

▸ **exc_range**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[RangeNode](interfaces/rangenode.md)*

*Defined in [src/parser.ts:187](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L187)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[RangeNode](interfaces/rangenode.md)*

###  filter

▸ **filter**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ElementNode](interfaces/elementnode.md) | [AttributeNode](interfaces/attributenode.md) | [SliceNode](interfaces/slicenode.md) | [FilterNode](interfaces/filternode.md)*

*Defined in [src/parser.ts:72](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L72)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ElementNode](interfaces/elementnode.md) | [AttributeNode](interfaces/attributenode.md) | [SliceNode](interfaces/slicenode.md) | [FilterNode](interfaces/filternode.md)*

###  float

▸ **float**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ValueNode](interfaces/valuenode.md)‹number›*

*Defined in [src/parser.ts:342](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L342)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ValueNode](interfaces/valuenode.md)‹number›*

###  func_call

▸ **func_call**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[FuncCallNode](interfaces/funccallnode.md)*

*Defined in [src/parser.ts:450](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L450)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[FuncCallNode](interfaces/funccallnode.md)*

###  ident

▸ **ident**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ValueNode](interfaces/valuenode.md) | [IdentifierNode](interfaces/identifiernode.md)*

*Defined in [src/parser.ts:144](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L144)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ValueNode](interfaces/valuenode.md) | [IdentifierNode](interfaces/identifiernode.md)*

###  inc_range

▸ **inc_range**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[RangeNode](interfaces/rangenode.md)*

*Defined in [src/parser.ts:176](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L176)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[RangeNode](interfaces/rangenode.md)*

###  integer

▸ **integer**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ValueNode](interfaces/valuenode.md)‹number›*

*Defined in [src/parser.ts:334](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L334)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ValueNode](interfaces/valuenode.md)‹number›*

###  mod

▸ **mod**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OpCallNode](interfaces/opcallnode.md)*

*Defined in [src/parser.ts:274](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L274)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OpCallNode](interfaces/opcallnode.md)*

###  mul

▸ **mul**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OpCallNode](interfaces/opcallnode.md)*

*Defined in [src/parser.ts:252](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L252)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OpCallNode](interfaces/opcallnode.md)*

###  neg

▸ **neg**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ValueNode](interfaces/valuenode.md) | [NegNode](interfaces/negnode.md)*

*Defined in [src/parser.ts:198](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L198)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ValueNode](interfaces/valuenode.md) | [NegNode](interfaces/negnode.md)*

###  not

▸ **not**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[NotNode](interfaces/notnode.md)*

*Defined in [src/parser.ts:496](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L496)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[NotNode](interfaces/notnode.md)*

###  object

▸ **object**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ObjectNode](interfaces/objectnode.md)*

*Defined in [src/parser.ts:368](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L368)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ObjectNode](interfaces/objectnode.md)*

###  object_expr

▸ **object_expr**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md)*

*Defined in [src/parser.ts:381](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L381)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md)*

###  object_pair

▸ **object_pair**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ObjectAttributeNode](interfaces/objectattributenode.md)*

*Defined in [src/parser.ts:402](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L402)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ObjectAttributeNode](interfaces/objectattributenode.md)*

###  object_splat

▸ **object_splat**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ObjectSplatNode](interfaces/objectsplatnode.md)*

*Defined in [src/parser.ts:412](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L412)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ObjectSplatNode](interfaces/objectsplatnode.md)*

###  object_splat_this

▸ **object_splat_this**(): *[ObjectSplatNode](interfaces/objectsplatnode.md)*

*Defined in [src/parser.ts:421](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L421)*

**Returns:** *[ObjectSplatNode](interfaces/objectsplatnode.md)*

###  or

▸ **or**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OrNode](interfaces/ornode.md)*

*Defined in [src/parser.ts:486](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L486)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OrNode](interfaces/ornode.md)*

###  pair

▸ **pair**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[PairNode](interfaces/pairnode.md)*

*Defined in [src/parser.ts:358](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L358)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[PairNode](interfaces/pairnode.md)*

###  param

▸ **param**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ParameterNode](interfaces/parameternode.md)*

*Defined in [src/parser.ts:522](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L522)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ParameterNode](interfaces/parameternode.md)*

###  paren

▸ **paren**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ParenthesisNode](interfaces/parenthesisnode.md)*

*Defined in [src/parser.ts:64](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L64)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ParenthesisNode](interfaces/parenthesisnode.md)*

###  parent

▸ **parent**(): *[ParentNode](interfaces/parentnode.md)*

*Defined in [src/parser.ts:129](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L129)*

**Returns:** *[ParentNode](interfaces/parentnode.md)*

###  pipecall

▸ **pipecall**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[PipeFuncCallNode](interfaces/pipefunccallnode.md)*

*Defined in [src/parser.ts:465](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L465)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[PipeFuncCallNode](interfaces/pipefunccallnode.md)*

###  pos

▸ **pos**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ValueNode](interfaces/valuenode.md) | [PosNode](interfaces/posnode.md)*

*Defined in [src/parser.ts:214](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L214)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ValueNode](interfaces/valuenode.md) | [PosNode](interfaces/posnode.md)*

###  pow

▸ **pow**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OpCallNode](interfaces/opcallnode.md)*

*Defined in [src/parser.ts:285](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L285)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OpCallNode](interfaces/opcallnode.md)*

###  project

▸ **project**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ProjectionNode](interfaces/projectionnode.md)*

*Defined in [src/parser.ts:111](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L111)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ProjectionNode](interfaces/projectionnode.md)*

###  sci

▸ **sci**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ValueNode](interfaces/valuenode.md)‹number›*

*Defined in [src/parser.ts:350](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L350)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ValueNode](interfaces/valuenode.md)‹number›*

###  star

▸ **star**(): *[StarNode](interfaces/starnode.md)*

*Defined in [src/parser.ts:121](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L121)*

**Returns:** *[StarNode](interfaces/starnode.md)*

###  str_begin

▸ **str_begin**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[ValueNode](interfaces/valuenode.md)‹string›*

*Defined in [src/parser.ts:326](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L326)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[ValueNode](interfaces/valuenode.md)‹string›*

###  sub

▸ **sub**(`p`: [MarkProcessor](classes/markprocessor.md)‹›): *[OpCallNode](interfaces/opcallnode.md)*

*Defined in [src/parser.ts:241](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L241)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | [MarkProcessor](classes/markprocessor.md)‹› |

**Returns:** *[OpCallNode](interfaces/opcallnode.md)*

###  this

▸ **this**(): *[ThisNode](interfaces/thisnode.md)*

*Defined in [src/parser.ts:125](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L125)*

**Returns:** *[ThisNode](interfaces/thisnode.md)*

___

### `Const` ESCAPE_SEQUENCE

### ▪ **ESCAPE_SEQUENCE**: *object*

*Defined in [src/parser.ts:19](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L19)*

###  "

• **"**: *string* = """

*Defined in [src/parser.ts:21](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L21)*

###  '

• **'**: *string* = "'"

*Defined in [src/parser.ts:20](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L20)*

###  /

• **/**: *string* = "/"

*Defined in [src/parser.ts:23](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L23)*

###  \

• **\**: *string* = "\"

*Defined in [src/parser.ts:22](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L22)*

###  b

• **b**: *string* = ""

*Defined in [src/parser.ts:24](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L24)*

###  f

• **f**: *string* = ""

*Defined in [src/parser.ts:25](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L25)*

###  n

• **n**: *string* = "
"

*Defined in [src/parser.ts:26](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L26)*

###  r

• **r**: *string* = ""

*Defined in [src/parser.ts:27](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L27)*

###  t

• **t**: *string* = "	"

*Defined in [src/parser.ts:28](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/parser.ts#L28)*

___

### `Const` EXECUTORS

### ▪ **EXECUTORS**: *object*

*Defined in [src/evaluator/index.ts:95](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L95)*

###  And

▸ **And**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/index.ts:415](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L415)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`left` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`right` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  Array

▸ **Array**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *[StreamValue](classes/streamvalue.md)‹›*

*Defined in [src/evaluator/index.ts:360](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L360)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`elements` | [ArrayElementNode](interfaces/arrayelementnode.md)[] |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *[StreamValue](classes/streamvalue.md)‹›*

###  Asc

▸ **Asc**(): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/index.ts:453](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L453)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  Attribute

▸ **Attribute**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:216](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L216)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`name` | string |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Deref

▸ **Deref**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:297](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L297)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Desc

▸ **Desc**(): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/index.ts:457](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L457)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  Element

▸ **Element**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:155](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L155)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`index` | [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Filter

▸ **Filter**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:139](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L139)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`query` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  FuncCall

▸ **FuncCall**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *PromiseLike‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:126](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L126)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`args` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any›[] |
`name` | string |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *PromiseLike‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Identifier

▸ **Identifier**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/index.ts:231](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L231)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`name` | string |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  Mapper

▸ **Mapper**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹any›*

*Defined in [src/evaluator/index.ts:246](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L246)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹any›*

###  Neg

▸ **Neg**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹any›*

*Defined in [src/evaluator/index.ts:441](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L441)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹any›*

###  Not

▸ **Not**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/index.ts:433](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L433)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  Object

▸ **Object**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹object››*

*Defined in [src/evaluator/index.ts:316](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L316)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`attributes` | [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md)[] |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹object››*

###  OpCall

▸ **OpCall**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹› | PromiseLike‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:120](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L120)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`left` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`op` | "+" &#124; "-" &#124; "*" &#124; "/" &#124; "%" &#124; "**" |
`right` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹› | PromiseLike‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Or

▸ **Or**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/index.ts:397](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L397)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`left` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`right` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  Pair

▸ **Pair**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹[Pair](classes/pair.md)‹›››*

*Defined in [src/evaluator/index.ts:389](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L389)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`left` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`right` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹[Pair](classes/pair.md)‹›››*

###  Parameter

▸ **Parameter**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *any*

*Defined in [src/evaluator/index.ts:104](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L104)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`name` | string |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *any*

###  Parent

▸ **Parent**(`node`: [ParentNode](interfaces/parentnode.md), `scope`: [Scope](classes/scope.md)): *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹›*

*Defined in [src/evaluator/index.ts:108](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L108)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | [ParentNode](interfaces/parentnode.md) |
`scope` | [Scope](classes/scope.md) |

**Returns:** *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹›*

###  Parenthesis

▸ **Parenthesis**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹any›*

*Defined in [src/evaluator/index.ts:269](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L269)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹any›*

###  PipeFuncCall

▸ **PipeFuncCall**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:132](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L132)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`args` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any›[] |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`name` | string |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Pos

▸ **Pos**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹any›*

*Defined in [src/evaluator/index.ts:447](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L447)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹any›*

###  Projection

▸ **Projection**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:277](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L277)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`query` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Range

▸ **Range**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/index.ts:377](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L377)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`isExclusive` | boolean |
`left` | [ValueNode](interfaces/valuenode.md)‹number› |
`right` | [ValueNode](interfaces/valuenode.md)‹number› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  Slice

▸ **Slice**(`__namedParameters`: object, `scope`: [Scope](classes/scope.md)): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/index.ts:181](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L181)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`base` | [AndNode](interfaces/andnode.md) &#124; [ArrayNode](interfaces/arraynode.md) &#124; [ArrayElementNode](interfaces/arrayelementnode.md) &#124; [AscNode](interfaces/ascnode.md) &#124; [AttributeNode](interfaces/attributenode.md) &#124; [DerefNode](interfaces/derefnode.md) &#124; [DescNode](interfaces/descnode.md) &#124; [ElementNode](interfaces/elementnode.md) &#124; [FilterNode](interfaces/filternode.md) &#124; [FuncCallNode](interfaces/funccallnode.md) &#124; [IdentifierNode](interfaces/identifiernode.md) &#124; [MapperNode](interfaces/mappernode.md) &#124; [NegNode](interfaces/negnode.md) &#124; [NotNode](interfaces/notnode.md) &#124; [ObjectNode](interfaces/objectnode.md) &#124; [ObjectAttributeNode](interfaces/objectattributenode.md) &#124; [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) &#124; [ObjectSplatNode](interfaces/objectsplatnode.md) &#124; [OpCallNode](interfaces/opcallnode.md) &#124; [OrNode](interfaces/ornode.md) &#124; [PairNode](interfaces/pairnode.md) &#124; [ParameterNode](interfaces/parameternode.md) &#124; [ParentNode](interfaces/parentnode.md) &#124; [ParenthesisNode](interfaces/parenthesisnode.md) &#124; [PipeFuncCallNode](interfaces/pipefunccallnode.md) &#124; [PosNode](interfaces/posnode.md) &#124; [ProjectionNode](interfaces/projectionnode.md) &#124; [RangeNode](interfaces/rangenode.md) &#124; [SliceNode](interfaces/slicenode.md) &#124; [StarNode](interfaces/starnode.md) &#124; [ThisNode](interfaces/thisnode.md) &#124; [ValueNode](interfaces/valuenode.md)‹any› |
`isExclusive` | boolean |
`left` | [ValueNode](interfaces/valuenode.md)‹number› |
`right` | [ValueNode](interfaces/valuenode.md)‹number› |

▪ **scope**: *[Scope](classes/scope.md)*

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  Star

▸ **Star**(`_`: [StarNode](interfaces/starnode.md), `scope`: [Scope](classes/scope.md)): *any*

*Defined in [src/evaluator/index.ts:100](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L100)*

**Parameters:**

Name | Type |
------ | ------ |
`_` | [StarNode](interfaces/starnode.md) |
`scope` | [Scope](classes/scope.md) |

**Returns:** *any*

###  This

▸ **This**(`_`: [ThisNode](interfaces/thisnode.md), `scope`: [Scope](classes/scope.md)): *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹›*

*Defined in [src/evaluator/index.ts:96](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L96)*

**Parameters:**

Name | Type |
------ | ------ |
`_` | [ThisNode](interfaces/thisnode.md) |
`scope` | [Scope](classes/scope.md) |

**Returns:** *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹›*

###  Value

▸ **Value**(`__namedParameters`: object): *[StaticValue](classes/staticvalue.md)‹any›*

*Defined in [src/evaluator/index.ts:242](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L242)*

**Parameters:**

▪ **__namedParameters**: *object*

Name | Type |
------ | ------ |
`value` | any |

**Returns:** *[StaticValue](classes/staticvalue.md)‹any›*

___

### `Const` TYPE_ORDER

### ▪ **TYPE_ORDER**: *object*

*Defined in [src/evaluator/ordering.ts:3](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/ordering.ts#L3)*

###  boolean

• **boolean**: *number* = 3

*Defined in [src/evaluator/ordering.ts:6](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/ordering.ts#L6)*

###  number

• **number**: *number* = 1

*Defined in [src/evaluator/ordering.ts:4](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/ordering.ts#L4)*

###  string

• **string**: *number* = 2

*Defined in [src/evaluator/ordering.ts:5](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/ordering.ts#L5)*

___

### `Const` functions

### ▪ **functions**: *object*

*Defined in [src/evaluator/functions.ts:50](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L50)*

###  coalesce

▸ **coalesce**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/functions.ts:51](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L51)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

###  count

▸ **count**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/functions.ts:59](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L59)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  defined

▸ **defined**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/functions.ts:72](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L72)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  identity

▸ **identity**(`args`: any[]): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/functions.ts:79](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L79)*

**Parameters:**

Name | Type |
------ | ------ |
`args` | any[] |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  length

▸ **length**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹any›*

*Defined in [src/evaluator/functions.ts:84](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L84)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹any›*

###  now

▸ **now**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›): *Promise‹[StaticValue](classes/staticvalue.md)‹string››*

*Defined in [src/evaluator/functions.ts:176](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L176)*

**Parameters:**

Name | Type |
------ | ------ |
`args` | any[] |
`scope` | [Scope](classes/scope.md)‹› |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹string››*

###  path

▸ **path**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/functions.ts:105](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L105)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  references

▸ **references**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/functions.ts:143](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L143)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  round

▸ **round**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹any›*

*Defined in [src/evaluator/functions.ts:154](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L154)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹any›*

###  select

▸ **select**(`args`: any[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

*Defined in [src/evaluator/functions.ts:116](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L116)*

**Parameters:**

▪ **args**: *any[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹››*

___

### `Const` operators

### ▪ **operators**: *object*

*Defined in [src/evaluator/operators.ts:30](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L30)*

###  %

• **%**: *function* = numericOperator((a, b) => a % b)

*Defined in [src/evaluator/operators.ts:169](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L169)*

#### Type declaration:

▸ (`left`: [SyntaxNode](globals.md#syntaxnode), `right`: [SyntaxNode](globals.md#syntaxnode), `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`left` | [SyntaxNode](globals.md#syntaxnode) |
`right` | [SyntaxNode](globals.md#syntaxnode) |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

###  *

• *****: *function* = numericOperator((a, b) => a * b)

*Defined in [src/evaluator/operators.ts:167](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L167)*

#### Type declaration:

▸ (`left`: [SyntaxNode](globals.md#syntaxnode), `right`: [SyntaxNode](globals.md#syntaxnode), `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`left` | [SyntaxNode](globals.md#syntaxnode) |
`right` | [SyntaxNode](globals.md#syntaxnode) |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

###  **

• ******: *function* = numericOperator((a, b) => Math.pow(a, b))

*Defined in [src/evaluator/operators.ts:170](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L170)*

#### Type declaration:

▸ (`left`: [SyntaxNode](globals.md#syntaxnode), `right`: [SyntaxNode](globals.md#syntaxnode), `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`left` | [SyntaxNode](globals.md#syntaxnode) |
`right` | [SyntaxNode](globals.md#syntaxnode) |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

###  -

• **-**: *function* = numericOperator((a, b) => a - b)

*Defined in [src/evaluator/operators.ts:166](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L166)*

#### Type declaration:

▸ (`left`: [SyntaxNode](globals.md#syntaxnode), `right`: [SyntaxNode](globals.md#syntaxnode), `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`left` | [SyntaxNode](globals.md#syntaxnode) |
`right` | [SyntaxNode](globals.md#syntaxnode) |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

###  /

• **/**: *function* = numericOperator((a, b) => a / b)

*Defined in [src/evaluator/operators.ts:168](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L168)*

#### Type declaration:

▸ (`left`: [SyntaxNode](globals.md#syntaxnode), `right`: [SyntaxNode](globals.md#syntaxnode), `scope`: [Scope](classes/scope.md), `execute`: [Executor](globals.md#executor)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`left` | [SyntaxNode](globals.md#syntaxnode) |
`right` | [SyntaxNode](globals.md#syntaxnode) |
`scope` | [Scope](classes/scope.md) |
`execute` | [Executor](globals.md#executor) |

###  !=

▸ **!=**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹boolean››*

*Defined in [src/evaluator/operators.ts:38](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L38)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹boolean››*

###  +

▸ **+**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/operators.ts:153](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L153)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  <

▸ **<**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/operators.ts:69](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L69)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  <=

▸ **<=**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/operators.ts:81](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L81)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  ==

▸ **==**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹boolean››*

*Defined in [src/evaluator/operators.ts:31](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L31)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹boolean››*

###  >

▸ **>**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/operators.ts:45](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L45)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  >=

▸ **>=**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/operators.ts:57](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L57)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  in

▸ **in**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/operators.ts:93](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L93)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

###  match

▸ **match**(`left`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `right`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›, `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/operators.ts:128](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/operators.ts#L128)*

**Parameters:**

▪ **left**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **right**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

___

### `Const` pipeFunctions

### ▪ **pipeFunctions**: *object*

*Defined in [src/evaluator/functions.ts:190](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L190)*

###  order

▸ **order**(`base`: [StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹›, `args`: [AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›[], `scope`: [Scope](classes/scope.md)‹›, `execute`: function): *Promise‹[StaticValue](classes/staticvalue.md)‹any››*

*Defined in [src/evaluator/functions.ts:191](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/functions.ts#L191)*

**Parameters:**

▪ **base**: *[StaticValue](classes/staticvalue.md)‹any› | [StreamValue](classes/streamvalue.md)‹› | [MapperValue](classes/mappervalue.md)‹›*

▪ **args**: *[AndNode](interfaces/andnode.md) | [ArrayNode](interfaces/arraynode.md) | [ArrayElementNode](interfaces/arrayelementnode.md) | [AscNode](interfaces/ascnode.md) | [AttributeNode](interfaces/attributenode.md) | [DerefNode](interfaces/derefnode.md) | [DescNode](interfaces/descnode.md) | [ElementNode](interfaces/elementnode.md) | [FilterNode](interfaces/filternode.md) | [FuncCallNode](interfaces/funccallnode.md) | [IdentifierNode](interfaces/identifiernode.md) | [MapperNode](interfaces/mappernode.md) | [NegNode](interfaces/negnode.md) | [NotNode](interfaces/notnode.md) | [ObjectNode](interfaces/objectnode.md) | [ObjectAttributeNode](interfaces/objectattributenode.md) | [ObjectConditionalSplatNode](interfaces/objectconditionalsplatnode.md) | [ObjectSplatNode](interfaces/objectsplatnode.md) | [OpCallNode](interfaces/opcallnode.md) | [OrNode](interfaces/ornode.md) | [PairNode](interfaces/pairnode.md) | [ParameterNode](interfaces/parameternode.md) | [ParentNode](interfaces/parentnode.md) | [ParenthesisNode](interfaces/parenthesisnode.md) | [PipeFuncCallNode](interfaces/pipefunccallnode.md) | [PosNode](interfaces/posnode.md) | [ProjectionNode](interfaces/projectionnode.md) | [RangeNode](interfaces/rangenode.md) | [SliceNode](interfaces/slicenode.md) | [StarNode](interfaces/starnode.md) | [ThisNode](interfaces/thisnode.md) | [ValueNode](interfaces/valuenode.md)‹any›[]*

▪ **scope**: *[Scope](classes/scope.md)‹›*

▪ **execute**: *function*

▸ (`node`: NodeTypes.SyntaxNode, `scope`: [Scope](classes/scope.md)): *[Value](globals.md#value) | PromiseLike‹[Value](globals.md#value)›*

**Parameters:**

Name | Type |
------ | ------ |
`node` | NodeTypes.SyntaxNode |
`scope` | [Scope](classes/scope.md) |

**Returns:** *Promise‹[StaticValue](classes/staticvalue.md)‹any››*
