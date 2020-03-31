[groq-js](../README.md) › [Globals](../globals.md) › [EvaluateOptions](evaluateoptions.md)

# Interface: EvaluateOptions

Evaluates a syntax tree (which you can get from {@link module:groq-js.parse}).

**`param`** 

**`param`** Options.

**`param`** Parameters availble in the GROQ query (using `$param` syntax).

**`param`** value that will be available as `@` in GROQ.

**`param`** value that will be available as `*` in GROQ.

**`returns`** 

**`alias`** module:groq-js.evaluate

## Hierarchy

* **EvaluateOptions**

## Index

### Properties

* [dataset](evaluateoptions.md#optional-dataset)
* [params](evaluateoptions.md#optional-params)
* [root](evaluateoptions.md#optional-root)

## Properties

### `Optional` dataset

• **dataset**? : *any*

*Defined in [src/evaluator/index.ts:476](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L476)*

___

### `Optional` params

• **params**? : *object*

*Defined in [src/evaluator/index.ts:477](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L477)*

#### Type declaration:

* \[ **key**: *string*\]: any

___

### `Optional` root

• **root**? : *any*

*Defined in [src/evaluator/index.ts:475](https://github.com/sanity-io/groq-js/blob/fc2de3c/src/evaluator/index.ts#L475)*
