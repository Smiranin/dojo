---
difficulty: medium
tags: [effects]
source: https://react.dev/learn/you-might-not-need-an-effect
---

## Question

What is an Effect for, and what should you not put in one?

## Answer

An Effect synchronizes the component with an external system, such as a subscription, a timer, a non-React widget or analytics on display. Do not use it for computing values from props or state, or for responding to a user click; those belong in render and in event handlers.

## Explanation

Effects run after commit and are caused by rendering, not by a specific event. Anything React can derive during render needs no Effect; user-caused work belongs in the handler because an Effect cannot know which interaction caused it.

## Best practice

Ask "is there an external system?" If not, remove the Effect.
