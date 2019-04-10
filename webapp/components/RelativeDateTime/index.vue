<template>
  <span>{{ relativeDateTime }}</span>
</template>

<script>
export default {
  name: 'HcRelativeDateTime',
  props: {
    dateTime: {
      type: [Date, String],
      required: true
    }
  },
  computed: {
    relativeDateTime() {
      return this.$filters.relativeDateTime(this.dateTime)
    }
  }
}
</script>
