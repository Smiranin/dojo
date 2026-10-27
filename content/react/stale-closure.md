---
difficulty: hard
tags: [hooks]
---

## Question

What is a stale closure in an effect and how do you avoid it?

## Answer

A callback captured an old render's variables. List the dependency, use a ref, or use the functional updater.

## Explanation

Each render has its own scope:

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);
```

`count` is frozen at 0 here.
