---
difficulty: easy
tags: [build-tooling, legacy]
source: https://react.dev/blog/2025/02/14/sunsetting-create-react-app
---

## Question

Create React App is mentioned in old tutorials. What replaced it, and why?

## Answer

The React team deprecated Create React App for new apps in February 2025 because it has no active maintainers. New apps should start from a framework, and apps that need only a client bundle should use a build tool like Vite, Parcel or Rsbuild.

## Explanation

The announcement says CRA continues "in maintenance mode" and that "if your app needs routing, you would probably benefit from a framework". Vite is the common choice for plain SPAs (250M weekly downloads, 84.4% used in State of JS 2025).

## Best practice

Migrate to Vite incrementally; follow the migration guide of your target tool.
