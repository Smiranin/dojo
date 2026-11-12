---
difficulty: hard
tags: [modules]
source: https://www.typescriptlang.org/docs/handbook/modules/reference.html#module-format-detection
---

## Question

Under `module: nodenext`, how does the compiler decide whether a `.ts` file is ESM or CommonJS, and why does `import "./util"` then fail?

## Answer

By extension and the nearest `package.json`: `.mts` is always ESM, `.cts` always CommonJS, and `.ts` is ESM only if the nearest `package.json` has `"type": "module"`. ESM `import` requires an explicit file extension like Node itself, so `./util` fails; write `./util.js`.

## Explanation

The reference: ".mts/.mjs/.d.mts files are always ES modules. .cts/.cjs/.d.cts files are always CommonJS modules. .ts/.tsx/.js/.jsx/.d.ts files are ES modules if the nearest ancestor package.json file contains "type": "module", otherwise CommonJS modules." and "The detected module format of input `.ts` / `.tsx` / `.mts` / `.cts` files determines the module format of the emitted JavaScript files." Hence "A common misconception is that `node16`—`nodenext` only emit ES modules." Since 5.8 `nodenext` allows `require()` of ES modules, reflecting Node 22.12 and later; `node18` does not ("`require()` of ECMAScript modules is disallowed under `node18`, but allowed under `nodenext`", 5.8 notes).

## Best practice

Set `"type": "module"` deliberately, import with the emitted `.js` extension, and do not use `module: esnext` or `commonjs` for code that runs in Node.
