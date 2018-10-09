<template>
  <div>
    <component-doc :component="component" />
  </div>
</template>

<script>
import ComponentDoc from './ComponentDoc'

export default {
  name: 'ComponentPage',
  props: {
    component: {
      type: Object,
      required: true
    }
  },
  components: {
    ComponentDoc
  }
}
</script>
