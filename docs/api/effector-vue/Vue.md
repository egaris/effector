---
id: vue
title: Vue
---

Methods available on `Vue` prototype after you enable this plugin.

## Vue Methods

### `$watchAsStore(expOrFn, options?)`

#### Arguments

1. `expOrFn` (_string | Function_): The expression only accepts dot-delimited paths. For more complex expressions, use a function instead.
2. `options`? (_Object_)
  - `deep`? (_boolean_)
  - `immediate`? (_boolean_)

#### Returns

(_`Store`_)

### `$store(expOrFn)`

#### Arguments

1. `expOrFn` (_string | Function_): The expression only accepts dot-delimited paths. For more complex expressions, use a function instead.

#### Returns

(_`Store`_)
