# SCSS - Code Guidelines

## We use classes over tags and ids

Never apply styles to `tags` or `ids` – use `classes` instead!

Why?
- HTML tags are responsible for the document _structure_, not the looks
- targeting HTML tags comes with performance issues
- ids are responsible for identifying a unique element, not for styling it
- ids have higher specificity than classes and therefore don't play well together
- classes can be combined and reused while ids are unique

For more background see the following articles on [why not to style tags](https://frontstuff.io/you-need-to-stop-targeting-tags-in-css) and [why not to style ids](https://dev.to/clairecodes/reasons-not-to-use-ids-in-css-4ni4).

## We use design tokens instead of magic numbers

In order to achieve a consistent look and feel we use a set of pre-defined `design tokens` to style our components, for example `colors`, `sizes` and `box-shadows`. These tokens are stored as `SCSS variables` and reused throughout the app.

So, instead of typing _pixel values_ or _hex codes_ make sure you use design tokens such as `height-header` or `color-input-border`.

## We name our classes after components

Our SCSS styles live within the corresponding component (see the [Vue.js docs for single-file components](https://vuejs.org/v2/guide/single-file-components.html) for reference) and should therefore carry the same _unique_ name.

Why?
- it clearly ties the styles to the one component
- having unique class names means styles will not be accidentally overwritten in other files
- we can avoid using `scoped CSS` which [comes with performance caveats](https://vue-loader.vuejs.org/guide/scoped-css.html#also-keep-in-mind)

## We use variants instead of overriding styles

Components will sometimes need to look different depending on the context in which they are used – a button might for example be `green` when it represents a call to action and `red` when it triggers a destructive action. Rather than making the `rounded-button` component `green` by default and then overriding the `color` for, say, the `delete-account` action – use variants! Pass the `rounded-button` a prop, such as `color: danger`, and then apply the respective `variant class`.

Name variant classes with a dash prefix, such as `-danger`, then target them like this:

```scss
.rounded-button {
  /* other css styles */

  &.-danger {
    color: $color-danger;
  }
}
```

## We _style_ within the component, we _position_ when we use it

In order to make components truly reusable it is important to limit their styles to, well, their actual _styling_. What color are they, how big is the text, what happens on `hover`, do they have a rounded border – all that is part of it.

Margins, alignment and positioning on the other hand need to be defined in the _parent_ because the same component might sometimes be aligned to the left, sometimes to the right and sometimes float above other content. For more details see the [rscss guidelines](https://rscss.io/layouts.html).

To do that, use the `child selector`, like this:

```scss
.login-form {
  /* other css styles */

  > .rounded-button {
    margin: $margin-small;
    justify-self: flex-end;
  }
}
```

A special case are dimensions like `width` and `height`. If it is important that a component always has the same dimensions (the height of a button should be consistent, for example) define it _within the component_ itself, if a component should have flexible dimensions (a card, for example, could stretch over the whole screen in one place and be limited to a certain width in another) define the dimensions _in the parent_.

## Recommended reads

For a deeper dive into the WHY and HOW have a look at the following resources which the above guidelines are based on:

- [rscss – reasonable system for css stylesheet structure](https://rscss.io/index.html)
- [itcss – inverted triangle architecture for css](https://csswizardry.net/talks/2014/11/itcss-dafed.pdf)
