## Text sizes

Use different sizes to create hierarchy.

```
<ds-text size="x-large">The quick brown fox (x-large)</ds-text>
<ds-text size="large">The quick brown fox (large)</ds-text>
<ds-text size="base">The quick brown fox (base)</ds-text>
<ds-text size="small">The quick brown fox (small)</ds-text>
```

## Text colors

Use colors to highlight or deemphasize.

```
<ds-text>The quick brown fox</ds-text>
<ds-text color="soft">The quick brown fox</ds-text>
<ds-text color="softer">The quick brown fox</ds-text>
<ds-text color="primary">The quick brown fox</ds-text>
<ds-text color="success">The quick brown fox</ds-text>
<ds-text color="danger">The quick brown fox</ds-text>
<ds-text color="warning">The quick brown fox</ds-text>
```

## Nesting styles

Nested text components use their parents format by default.

```
<ds-text color="primary" size="large">
  The quick <ds-text bold>brown</ds-text> fox
</ds-text>
```