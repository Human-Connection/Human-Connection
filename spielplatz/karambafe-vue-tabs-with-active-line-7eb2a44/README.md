# Vue-tabs-with-active-line

Simple Vue 2 component, that allows you to make tabs with moving bottom line

![Alt Text](https://media.giphy.com/media/NTDhntg2ySo7rGLaRm/giphy.gif)

[![Build Status](https://travis-ci.org/karambafe/vue-tabs-with-active-line.svg?branch=master)](https://travis-ci.org/karambafe/vue-tabs-with-active-line)
[![Coverage Status](https://coveralls.io/repos/github/karambafe/vue-tabs-with-active-line/badge.svg?branch=master)](https://coveralls.io/github/karambafe/vue-tabs-with-active-line?branch=master)
[![npm](https://img.shields.io/npm/v/vue-tabs-with-active-line.svg)](https://www.npmjs.com/package/vue-tabs-with-active-line)
[![npm](https://img.shields.io/npm/dm/vue-tabs-with-active-line.svg)](https://www.npmjs.com/package/vue-tabs-with-active-line)
[![npm](https://img.shields.io/npm/dt/vue-tabs-with-active-line.svg)](https://www.npmjs.com/package/vue-tabs-with-active-line)
[![David](https://david-dm.org/karambafe/vue-tabs-with-active-line.svg)](https://david-dm.org/karambafe/vue-tabs-with-active-line)

## Demo and example

Live demo to play with: [Demo-link](https://karambafe.github.io/vue-tabs-with-active-line/)

Code from the demo:  [Default-example](https://github.com/karambafe/vue-tabs-with-active-line/blob/master/examples/Default.vue) [Disabled-example](https://github.com/karambafe/vue-tabs-with-active-line/blob/master/examples/Disabled.vue)

## Install

via NPM
```bash
npm install vue-tabs-with-active-line --save
```

## Usage

Import the component

```javascript
import Tabs from 'vue-tabs-with-active-line';
```

Define the data for props `tabs`, `currentTab`, and method for `onClick` callback

```javascript
export default {
  components: {
    Tabs,
  },
  data: () => ({
    tabs: [
      { title: 'Tab 1', value: 'tab1' },
      { title: 'Tab 2', value: 'tab2' },
      { title: 'Tab 3', value: 'tab3', }
    ],
    currentTab: 'tab1',
  }),
  methods: {
    handleClick(newTab) {
      this.currentTab = newTab;
    },
  },
}
</script>
```


 here's the HTML structure generated from the data entered:

```html
  <nav class="tabs">
    <button class="tabs__item tabs__item_active"> Tab 1 </button> <!-- active tab -->
    <button class="tabs__item"> Tab 2 </button>
    <button class="tabs__item"> Tab 3 </button>

    <div class="tabs__active-line"></div>
  </nav>
```

Finally, add some styles for component elements:

* `.tabs` - component wrapper
* `.tabs__item` - button
* `.tabs__item_active` - active button
* `.tabs__active-line` - bottom line


Be sure to add  `position: relative;` for `.tabs` class

and `position: absolute;` with `bottom, left, height, background-color` properties for `.tabs__active-line` class
##### Below you'll find basic style in CSS and SCSS
<details><summary>CSS EXAMPLE</summary>

```css
.tabs {
  position: relative;
  margin: 0 auto;
}

.tabs__item {
  display: inline-block;
  margin: 0 5px;
  padding: 10px;
  padding-bottom: 8px;
  font-size: 16px;
  letter-spacing: 0.8px;
  color: gray;
  text-decoration: none;
  border: none;
  background-color: transparent;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s;
}

.tabs__item_active {
  color: black;
}

.tabs__item:hover {
  border-bottom: 2px solid gray;
  color: black;
}

.tabs__item:focus {
  outline: none;
  border-bottom: 2px solid gray;
  color: black;
}

.tabs__item:first-child {
  margin-left: 0;
}

.tabs__item:last-child {
  margin-right: 0;
}

.tabs__active-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: black;
  transition: transform 0.4s ease, width 0.4s ease;
}
```

</details>
<details><summary>SCSS Example</summary>

```scss
.tabs {
  position: relative;
  margin: 0 auto;

  &__active-line {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background-color: black;
    transition: transform 0.4s ease, width 0.4s ease;
  }

  &__item {
    display: inline-block;
    margin: 0 5px;
    padding: 10px;
    padding-bottom: 8px;
    font-size: 16px;
    letter-spacing: 0.8px;
    color: gray;
    text-decoration: none;
    border: none;
    background-color: transparent;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.25s;

    &_active {
      color: black;
    }

    &:hover {
      border-bottom: 2px solid gray;
      color: black;
    }

    &:focus {
      outline: none;
      border-bottom: 2px solid gray;
      color: black;
    }

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
}
```

</details>

## Props

##### `tabs`

type: `Array`, required: `true`

The array must contain objects with the following properties:

 * `title` - required, type `string`. Title of tab

 * `value` - required, type `string`. Value of tab

 * `disabled` - optional, type `boolean`. Disabled attribute


##### `currentTab`

type: `String`, required: `true`.

Required: true

##### `onClick`

type: `Function`, required: `true`.

Returns new tab value when clicked

#### `wrapperClass`

type: `String`, required: `false`.

Custom class for container

#### `tabClass`

type: `String`, required: `false`.

Custom class for tab item

#### `tabActiveClass`

type: `String`, required: `false`.

Custom class for active tab item

#### `lineClass`

type: `String`, required: `false`.

Custom class for active line

## How to run it locally

1. Clone repository: `git clone git@github.com:karambafe/vue-tabs-with-active-line.git`
2. Install cli-service-global: `npm install -g @vue/cli-service-global` [Vue CLI 3 docs](https://cli.vuejs.org/guide/prototyping.html)
3. Run any vue file with hot reload and static server: `vue serve demo-src/App.vue`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

This project is licensed under the MIT license, Copyright (c) 2018 karambafe. For more information see [`LICENSE`](https://github.com/karambafe/vue-tabs-with-active-line/blob/master/LICENSE).
