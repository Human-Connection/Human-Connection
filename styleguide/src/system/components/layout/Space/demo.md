## Default margins

By default the top margin is 0 and the bottom margin is `large`.
```
<ds-space>
  <ds-placeholder>I have my own space</ds-placeholder>
</ds-space>
<ds-space>
  <ds-placeholder>I have my own space</ds-placeholder>
</ds-space>
```

## Custom margins

Margins can be `xxx-small, xx-small, x-small, small, base, large, x-large, xx-large and xxx-large`
```
<ds-space margin-bottom="xx-small">
  <ds-placeholder>I have my own space (xx-small)</ds-placeholder>
</ds-space>
<ds-space margin-bottom="small">
  <ds-placeholder>I have my own space (small)</ds-placeholder>
</ds-space>
<ds-space margin-bottom="base">
  <ds-placeholder>I have my own space (base)</ds-placeholder>
</ds-space>
<ds-space margin-bottom="large">
  <ds-placeholder>I have my own space (large)</ds-placeholder>
</ds-space>
<ds-space margin-bottom="xx-large">
  <ds-placeholder>I have my own space (xx-large)</ds-placeholder>
</ds-space>
<ds-space>
  <ds-placeholder>I have my own space</ds-placeholder>
</ds-space>
```

## Responsive Breakpoints

Sometimes we need to adjust the layout for different screen sizes.
Therefore margin can be set as an object of breakpoints `base, xs, sm, md, lg, xl`
```
<ds-space :margin-bottom="{ base: 'small', md: 'base', lg: 'large' }">
  <ds-placeholder>I have my own space</ds-placeholder>
</ds-space>
<ds-space>
  <ds-placeholder>I have my own space</ds-placeholder>
</ds-space>
```