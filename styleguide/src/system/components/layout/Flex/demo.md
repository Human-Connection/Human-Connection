## Item widths

By default each item has the same width.
```
<ds-flex>
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
</ds-flex>
```

You can set widths as parts of the whole.
```
<ds-flex>
  <ds-flex-item><ds-placeholder>1</ds-placeholder></ds-flex-item>
  <ds-flex-item width="2"><ds-placeholder>2</ds-placeholder></ds-flex-item>
  <ds-flex-item width="3"><ds-placeholder>3</ds-placeholder></ds-flex-item>
</ds-flex>
```

You can set widths as fix values.
```
<ds-flex>
  <ds-flex-item width="200px"><ds-placeholder>200px</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>1</ds-placeholder></ds-flex-item>
  <ds-flex-item width="30%"><ds-placeholder>30%</ds-placeholder></ds-flex-item>
</ds-flex>
```

You can set a default width for each item on the flex component.
```
<ds-flex width="50%">
  <ds-flex-item><ds-placeholder>item</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>item</ds-placeholder></ds-flex-item>
  <ds-flex-item width="100%"><ds-placeholder>item</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>item</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>item</ds-placeholder></ds-flex-item>
</ds-flex>
```

## Column Gutter

You can set a gutter for each item on the flex component.
```
<ds-flex gutter="small">
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
</ds-flex>
<ds-flex gutter="base">
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
</ds-flex>
<ds-flex gutter="large">
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
  <ds-flex-item><ds-placeholder>same</ds-placeholder></ds-flex-item>
</ds-flex>
```

## Responsive Breakpoints

Sometimes we need to adjust the layout for different screen sizes.
Therefore width, gutter and direction can be set as an object of breakpoints `base, xs, sm, md, lg, xl`
```
<ds-flex
  :gutter="{ base: 'xx-small', md: 'small' }"
  :direction="{ md: 'row-reverse' }">
  <ds-flex-item :width="{ base: '100%', sm: 1, md: 1 }">
    <ds-placeholder>1@md</ds-placeholder>
  </ds-flex-item>
  <ds-flex-item :width="{ base: '100%', sm: 1, md: 2 }">
    <ds-placeholder>2@md</ds-placeholder>
  </ds-flex-item>
</ds-flex>
```

## Common Patterns

Fix sidebar flex
```
<ds-flex>
  <ds-flex-item :width="{ base: '60px', md: '200px' }">
    <ds-placeholder>sidebar</ds-placeholder>
  </ds-flex-item>
  <ds-flex-item>
    <ds-placeholder>main content</ds-placeholder>
  </ds-flex-item>
</ds-flex>
```

Grid list of items
```
<ds-flex
  :gutter="{ base: 'x-small', md: 'small' }"
  :width="{ base: '100%', sm: '50%', lg: '33.333332%' }">
  <ds-flex-item>
    <ds-placeholder>item</ds-placeholder>
  </ds-flex-item>
  <ds-flex-item>
    <ds-placeholder>item</ds-placeholder>
  </ds-flex-item>
  <ds-flex-item>
    <ds-placeholder>item</ds-placeholder>
  </ds-flex-item>
  <ds-flex-item>
    <ds-placeholder>item</ds-placeholder>
  </ds-flex-item>
  <ds-flex-item>
    <ds-placeholder>item</ds-placeholder>
  </ds-flex-item>
  <ds-flex-item>
    <ds-placeholder>item</ds-placeholder>
  </ds-flex-item>
</ds-flex>
```