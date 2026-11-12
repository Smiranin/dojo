---
difficulty: medium
tags: [classes]
source: https://www.typescriptlang.org/docs/handbook/2/classes.html#caveats
---

## Question

What's the difference between TypeScript's `private` and a `#private` field?

## Answer

`private` is only checked at compile time and can still be read at runtime, even in the type checker through bracket notation. `#field` is real JavaScript private state that stays private after compilation.

## Explanation

Handbook: "Like other aspects of TypeScript's type system, `private` and `protected` are only enforced during type checking." and "`private` also allows access using bracket notation during type checking", with `s["secretKey"]` compiling. "JavaScript's private fields (`#`) remain private after compilation and do not provide the previously mentioned escape hatches like bracket notation access, making them _hard private_."

```ts
class MySafe { private secretKey = 12345; }
const s = new MySafe();
s["secretKey"]; // compiles, reads the value
```

## Best practice

Use `#` when privacy must hold at runtime (secrets, encapsulation across untrusted code); `private` is for communicating intent to colleagues and gives the shape-based nominal behaviour described in `structural-typing`.
