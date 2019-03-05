<template>
  <ds-space
    margin="large"
    style="text-align: center"
  >
    <ds-button
      :loading="loading"
      :disabled="disabled"
      :ghost="!shouted"
      :primary="shouted"
      size="x-large"
      icon="bullhorn"
      @click="toggle"
    />
    <ds-space margin-bottom="xx-small" />
    <ds-text color="soft">
      <ds-heading
        style="display: inline"
        tag="h3"
      >
        {{ shoutedCount }}x
      </ds-heading> Empfohlen
    </ds-text>
  </ds-space>
</template>

<script>
import gql from 'graphql-tag'

export default {
  props: {
    count: { type: Number, default: 0 },
    postId: { type: String, default: null },
    isShouted: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      shoutedCount: this.count,
      shouted: false
    }
  },
  watch: {
    isShouted: {
      immediate: true,
      handler: function(shouted) {
        this.shouted = shouted
      }
    }
  },
  methods: {
    toggle() {
      const shout = !this.shouted
      const mutation = shout ? 'shout' : 'unshout'
      const count = shout ? this.shoutedCount + 1 : this.shoutedCount - 1

      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!) {
              ${mutation}(id: $id, type: Post)
            }
          `,
          variables: {
            id: this.postId
          }
        })
        .then(res => {
          this.shoutedCount = count
          this.shouted = shout
          this.$emit('update')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
