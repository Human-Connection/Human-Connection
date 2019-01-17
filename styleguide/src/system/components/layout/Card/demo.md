## Common usage

Set a header and image for the card and provide some content.

```
<ds-flex gutter="base" :width="{ base: '100%', sm: 1 }">
  <ds-flex-item>
    <ds-card
      header="The header"
      image="https://picsum.photos/400/300?image=1063">
      Look ma! I'm in a card.
    </ds-card>
  </ds-flex-item>
  <ds-flex-item>
    <ds-card
      header="The header"
      image="https://picsum.photos/400/300?image=260">
      Look ma! I'm in a card.
    </ds-card>
  </ds-flex-item>
</ds-flex>
```

## Space

Need more or less space top and bottom of the card?
Specify with with the `space` prop

```html
<ds-card space="xx-small">
  xx-small  
</ds-card>
```

```html
<ds-card space="xx-large">
  xx-large  
</ds-card>
```

## Cards with footer

Most commonly the footer will contain some actions connected to the content.

```
<ds-flex gutter="base" :width="{ base: '100%', sm: 1 }">
  <ds-flex-item>
    <ds-card
      header="The header">
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button primary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
  <ds-flex-item>
    <ds-card
      header="The header">
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button primary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
</ds-flex>
```

## Centered content

Center the content if it is short and its purpose is to draw attention rather than to share information.

```
<ds-flex gutter="base" :width="{ base: '100%', sm: 1 }">
  <ds-flex-item>
    <ds-card
      centered
      header="The header">
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button primary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
  <ds-flex-item>
    <ds-card
      centered
      header="The header">
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button primary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
</ds-flex>
```

## Icon card

A card can contain an icon to emphasize its message.

```
<ds-flex gutter="base" :width="{ base: '100%', sm: 1 }">
  <ds-flex-item>
    <ds-card
      centered
      icon="map"
      header="The header">
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button primary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
  <ds-flex-item>
    <ds-card
      centered
      icon="users"
      header="The header">
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button primary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
</ds-flex>
```

## Color variants

Use color variants to highlight content.

```
<ds-flex gutter="base" :width="{ base: '100%', sm: 1 }">
  <ds-flex-item>
    <ds-card
      icon="cubes"
      header="The header"
      primary
      centered>
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
  <ds-flex-item>
    <ds-card
      icon="book"
      header="The header"
      secondary
      centered>
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button secondary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
</ds-flex>
```

## Hover cards

Use a hover card to draw additional attention to the its content.

```
<ds-flex gutter="base" :width="{ base: '100%', sm: 1 }">
  <ds-flex-item>
    <ds-card
      icon="cubes"
      header="The header"
      primary
      centered
      hover>
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
  <ds-flex-item>
    <ds-card
      icon="book"
      header="The header"
      secondary
      centered
      hover>
      Look ma! I'm in a card.
      <template slot="footer">
        <ds-button secondary>Read more</ds-button>
      </template>
    </ds-card>
  </ds-flex-item>
</ds-flex>
```

## Section Footer

Here we apply a section footer without margin

```
<ds-flex gutter="base" :width="{ base: '100%', sm: 1 }">
  <ds-flex-item>
    <ds-card
      icon="cubes"
      header="The header"
      centered
      hover>
      Look ma! I'm in a card.
      <div slot="footer" class="no-margin">
        <ds-icon name="comments" />
        <ds-tag
          style="margin-top: -4px; margin-left: -7px; position: absolute;"
          color="primary"
          size="small"
          round>
          2
        </ds-tag>
      </div>
    </ds-card>
  </ds-flex-item>
  <ds-flex-item>
    <ds-card
      icon="book"
      header="The header"
      centered>
      Look ma! I'm in a card.
      <div slot="footer" class="no-margin">
        <ds-icon name="comments" />
        <ds-tag
          style="margin-top: -4px; margin-left: -7px; position: absolute;"
          color="primary"
          size="small"
          round>
          34
        </ds-tag>
      </div>
    </ds-card>
  </ds-flex-item>
</ds-flex>
```
