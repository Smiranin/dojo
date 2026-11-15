---
difficulty: hard
tags: [classes, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators
---

## Question

How are decorators in current TypeScript different from the old `experimentalDecorators`?

## Answer

Since TypeScript 5.0 decorators are the ECMAScript decorators: valid syntax without any flag, with a `context` object argument. They are not compatible with `emitDecoratorMetadata` and cannot decorate parameters; the old behaviour is still behind `--experimentalDecorators`.

## Explanation

5.0 notes: "Decorators are an upcoming ECMAScript feature that allow us to customize classes and their members in a reusable way." and "`--experimentalDecorators` will continue to exist for the foreseeable future; however, without the flag, decorators will now be valid syntax for all new code." and "This new decorators proposal is not compatible with `--emitDecoratorMetadata`, and it does not allow decorating parameters." A typed decorator takes the original method and a context, for example `context: ClassMethodDecoratorContext`. 5.2 added decorator metadata. Node's built-in stripping does not transform decorators (they cause a parser error).

## Best practice

Use standard decorators for new code; migrate code that needs parameter decorators or emitted metadata deliberately, since there is no drop-in replacement. Type the decorators with the context types.
