<template>
  <div class="layout-blank">
    <ds-container>
      <div class="error">
        <h1>
          {{ header }}
        </h1>
        <h3>
          {{ subHeader }}
        </h3>
        <p>
          {{ message }}
        </p>
      </div>
    </ds-container>
    <div id="overlay" />
  </div>
</template>

<script>
import seo from '~/components/mixins/seo'

export default {
  mixins: [seo],
  props: {
    error: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    statusCode() {
      const mapping = {
        '500': '500',
        '404': '404'
      }
      return mapping[this.error.statusCode] || '500'
    },
    header() {
      return this.$t(`error.header.${this.statusCode}`)
    },
    subHeader() {
      return this.$t(`error.subHeader.${this.statusCode}`)
    },
    message() {
      return this.$t(`error.message.${this.statusCode}`)
    },
    suggestion() {
      console.log(this.$t(`error.suggestion.${this.statusCode}`))
      return this.$t(`error.suggestion.${this.statusCode}`)
    }
  },
  mounted() {
    console.log(this.error)
  }
}
</script>
