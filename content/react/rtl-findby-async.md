---
difficulty: medium
tags: [testing]
source: https://testing-library.com/docs/queries/about
---

## Question

This test is flaky: it passes only sometimes. What is wrong?

```tsx
test('shows the user name', () => {
  render(<Profile id="1" />);
  userEvent.click(screen.getByRole('button', { name: /load/i }));
  expect(screen.getByText('Ada')).toBeInTheDocument();
});
```

## Answer

User events and data loading are asynchronous. `userEvent.click` returns a promise that is not awaited, and `getByText` throws immediately when the name is not yet on screen. Create the user with `userEvent.setup()`, `await` the interaction, and use `await screen.findByText('Ada')`, which waits.

## Explanation

`getBy` throws if not found, `queryBy` returns `null` (use it to assert absence), `findBy` returns a promise that retries until the element appears or it times out. user-event recommends calling `userEvent.setup()` inside the test. RTL wraps updates in `act` for you.

```tsx
test('shows the user name', async () => {
  const user = userEvent.setup();
  render(<Profile id="1" />);
  await user.click(screen.getByRole('button', { name: /load/i }));
  expect(await screen.findByText('Ada')).toBeInTheDocument();
});
```

## Best practice

`findBy` for things that appear later; `queryBy` for "not present".
