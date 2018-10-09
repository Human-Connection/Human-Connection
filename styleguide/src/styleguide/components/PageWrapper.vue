<template>
  <div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'PageWrapper',
  props: {
    section: {
      type: Object,
      required: true
    },
    components: {
      type: Array,
      default: null
    }
  }
}
</script>
