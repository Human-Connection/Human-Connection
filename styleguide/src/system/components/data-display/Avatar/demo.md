## Basic usage

```html
<ds-avatar 
  name="Hans Alba"
  image="https://s3.amazonaws.com/uifaces/faces/twitter/lisovsky/128.jpg" />
```

## Size

```html
<ds-avatar 
  name="Hans"
  image="https://s3.amazonaws.com/uifaces/faces/twitter/lisovsky/128.jpg"
  size="60px" />
```

## Without Image

```html
<ds-avatar 
  name="Peter Sommerfield"
  :image="null" />
```

## Broken Image

```html
<ds-avatar 
  name="Tim Hollofield"
  image="http://not-valid-image-link##.org/image-does-not-exist.jpg" />
```

## Anonymus

```html
<ds-avatar 
  image="http://not-valid-image-link##.org/image-does-not-exist.jpg" />
```
