## Basic usage

```
<ds-radio :options="['blue', 'red', 'green']" />
```

## Usage with label

```
<ds-radio
  label="Color"
  :options="['blue', 'red', 'green']" />
```

## Bind to a value

Use v-model to bind a value to the select input.

```
<template>
  <div>
    <ds-radio
      v-model="color"
      :options="['blue', 'red', 'green']"
      placeholder="Color ..."></ds-radio>
    <ds-text>Your color: {{ color }}</ds-text>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        color: 'blue'
      }
    }
  }
</script>
```

## Style variations

```
<ds-radio
  label="Color"
  :options="['blue', 'red', 'green']"
  buttons />
```

## Validation

We use <a href="https://github.com/yiminghe/async-validator" targe="_blank">async-validator schemas</a> for validation.

If you need to validate more than one field it is better to use the form component.

```
<template>
  <div>
    <ds-radio
      v-model="color"
      :options="['blue', 'red', 'green']"
      :schema="{type: 'enum', enum: ['green'], message: 'Please choose green :)' }"
      placeholder="Color ..." />
  </div>
</template>
<script>
  export default {
    data() {
      return {
        color: ''
      }
    }
  }
</script>
```
