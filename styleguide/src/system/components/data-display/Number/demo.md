## Basic usage

```html
<ds-number 
  count="125"
  label="Users Online" />
```

## Sizes

```html
<ds-number 
  size="small"
  count="1734"
  label="Contributions" />
```
```html
<ds-number 
  size="xx-large"
  label-size="large"
  count="1734"
  label="Contributions" />
```

## Slot

```html
<ds-number 
    size="large"
    label="collected donations from users">
    <span slot="count">1.123.124,03 EUR</span>
  <ds-number>
```
