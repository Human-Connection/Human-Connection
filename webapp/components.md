# Components – Code Guidelines

## We adhere to the [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle)

Each component does _exactly one job_. The goal is to end up with many small components that are:
- easy to understand
- easy to maintain
- easy to reuse

**How do you decide what is a separate component?** Try to describe what it does in _one sentence_! When you find yourself using `and` and `or` the code you are talking about should probably be split up into two or more components.

On the other hand, when something is easily expressed in a few lines of HTML and SCSS and not likely to be reused this is a good indicator that it should _not_ go into a separate component.

## We compose with components

Usually `pages` use `layouts` as templates and will be composed of `features`. `features` are composed of `components`, the smallest building blocks of the app. The further down we go in this hierarchy the simpler and more generic the components become. Here is an example:

- The `index` page is responsible for displaying a list of posts. It uses the `default` layout and the `PostList` feature.
- The `PostList` feature uses a `List` component to render `PostTeaser` features.
- The `PostTeaser` feature consists of a `LayoutCard` wrapped around a `CardImage`, `CardTitle` and `CardContent` component.

The `index` page is unique in the app and will never be reused. The `PostList` knows it is handling post data and can therefore not be used for anything else – but it can display posts on the `index` as well as the `user` page.

The `Card` on the other hand does not care about the type of data it needs to handle. It just takes whatever it receives and renders it in a certain way, so it can be reused throughout the app for many different features.

## We use two-word names

We follow the W3C rules for naming custom elements as suggested in the [Vue.js docs](https://vuejs.org/v2/guide/components-registration.html#Component-Names) to differentiate our own components from regular HTML elements in our templates.

Names should also be meaningful and unique to avoid confusion and code duplication, and also not too long to make them readable. Therefore: aim for two-word names, such as `layout-card`, `post-list` or `post-teaser`.

## Recommended reads

For a deeper dive into the WHY and HOW have a look at the following resources which the above guidelines are based on:

- [Atomic design](https://bradfrost.com/blog/post/atomic-web-design/)
- [CDD – component based design](https://medium.com/@wereheavyweight/how-were-using-component-based-design-5f9e3176babb)
- [Vue.js component styleguide](https://pablohpsilva.github.io/vuejs-component-style-guide/#/)
