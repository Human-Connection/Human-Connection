<template>
  <span :title="absoluteTime">{{ relativeDateTime }}</span>
</template>

<script>
import moment from 'moment'

export default {
  name: 'hc-relative-date-time',
  props: {
    dateTime: {
      type: [Date, String]
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
  computed: {
    locale() {
      return this.$i18n.locale() || 'en'
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
  methods: {
    calcRelativeDateTime() {
      clearTimeout(this.timeout)
      let t = moment(this.dateTime).locale(this.locale)
      this.absoluteTime = t.format('llll')

      this.relativeDateTime = t.utc().fromNow()

      if (!process.browser) {
        return
      }

      if (
        this.relativeDateTime ===
        t
          .add(this.interval, 'milliseconds')
          .utc()
          .fromNow()
      ) {
        this.interval += 15000
      }
      this.timeout = setTimeout(() => {
        this.calcRelativeDateTime()
      }, this.interval)
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
  }
}
</script>
