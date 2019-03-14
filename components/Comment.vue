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
import { mapGetters } from 'vuex'

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
    ...mapGetters({
      isModerator: 'auth/isModerator'
    }),

    disabled() {
      return this.comment.disabled && !this.isModerator
    }
  }
}
</script>
