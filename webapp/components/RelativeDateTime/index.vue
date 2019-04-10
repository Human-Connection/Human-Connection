<template>
  <span :title="absoluteTime">{{ relativeDateTime }}</span>
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
  data() {
    return {
      relativeDateTime: null,
      interval: 15000,
      timeout: null,
      absoluteTime: null
    }
  },
  watch: {
    locale() {
      this.calcRelativeDateTime()
    },
    dateTime(dateTime) {
      this.calcRelativeDateTime()
    }
  },
  created() {
    this.calcRelativeDateTime()
  },
  mounted() {
    this.calcRelativeDateTime()
  },
  destroyed() {
    clearTimeout(this.timeout)
  },
  methods: {
    calcRelativeDateTime() {
      // Reset Timer
      clearTimeout(this.timeout)

      // Calculate Relative Date
      this.relativeDateTime = this.$filters.relativeDateTime(this.dateTime)

      // TODO It is unclear what exactly this does and how to archive it
      /*if (
        this.relativeDateTime ===
        t
          .add(this.interval, 'milliseconds')
          .utc()
          .fromNow()
      ) {
        this.interval += 15000
      }*/

      // Recalculate Timer
      this.timeout = setTimeout(() => {
        this.calcRelativeDateTime()
      }, this.interval)
    }
  }
}
</script>
