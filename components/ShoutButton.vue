<template>
  <ds-space
    margin="large"
    style="text-align: center"
  >
    <ds-button
      :disabled="disabled || loading || isShouted"
      danger
      size="x-large"
      icon="bullhorn"
      @click="shout"
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
    isShouted: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      disabled: false,
      shoutedCount: this.count
    }
  },
  methods: {
    shout() {
      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!) {
              shout(id: $id, type: Post)
            }
          `,
          variables: {
            id: this.postId
          }
        })
        .then(res => {
          console.log(res)
          this.loading = false
          this.disabled = true
          if (res && res.data && res.data.shout) {
            this.shoutedCount++
          }
          this.$emit('update')
        })
    }
  }
}
</script>
