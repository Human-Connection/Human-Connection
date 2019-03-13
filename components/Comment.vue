<template>
  <div>
    <div v-if="!disabled">
      {{ comment.content }}
    </div>
    <div v-else>
      {{ this.$t('comment.content.disabled-placeholder') }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    comment: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    disabled() {
      return this.comment.disabled
    }
  }
}
</script>
