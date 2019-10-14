# API Reference
* [groq-js](#module_groq-js)
    * [.evaluate(tree, [options])](#module_groq-js.evaluate) ⇒ [<code>Value</code>](#Value)
    * [.parse(input, [errorHandler])](#module_groq-js.parse) ⇒ [<code>SyntaxNode</code>](#SyntaxNode)


<a name="module_groq-js.evaluate"></a>

### groq-js.evaluate(tree, [options]) ⇒ [<code>Value</code>](#Value)
Evaluates a syntax tree (which you can get from [parse](#module_groq-js.parse)).

**Kind**: static method of [<code>groq-js</code>](#module_groq-js)  

| Param | Type | Description |
| --- | --- | --- |
| tree | [<code>SyntaxNode</code>](#SyntaxNode) |  |
| [options] | <code>object</code> | Options. |
| [options.params] | <code>object</code> | Parameters availble in the GROQ query (using `$param` syntax). |
| [options.root] |  | The value that will be available as `@` in GROQ. |
| [options.dataset] |  | The value that will be available as `*` in GROQ. |

<a name="module_groq-js.parse"></a>

### groq-js.parse(input, [errorHandler]) ⇒ [<code>SyntaxNode</code>](#SyntaxNode)
Parses a GROQ query and returns a tree structure.

**Kind**: static method of [<code>groq-js</code>](#module_groq-js)  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | GROQ query |
| errorHandler | <code>function</code> | Function to handler parsing errors |


<a name="Value"></a>

## Value
The result of an expression.

**Kind**: global interface  
<a name="Value+getType"></a>

### value.getType() ⇒ [<code>ValueType</code>](#ValueType)
Returns the type of the value.

**Kind**: instance method of [<code>Value</code>](#Value)  
<a name="Value+get"></a>

### value.get() ⇒ <code>Promise</code>
Returns a JavaScript representation of the value.

**Kind**: instance method of [<code>Value</code>](#Value)  
<a name="ValueType"></a>

## ValueType : <code>string</code>
A type of a value in GROQ.

This can be one of:
- 'null'
- 'boolean'
- 'number'
- 'string'
- 'array'
- 'object'
- 'range'
- 'pair'

**Kind**: global typedef  
<a name="SyntaxNode"></a>

## *SyntaxNode : <code>object</code>*
A tree-structure representing a GROQ query.

**Kind**: global abstract typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of the node. |


