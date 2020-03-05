<template>
  <ds-modal :title="title" :is-open="isOpen" @cancel="cancel">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div>
      <ds-flex>
        <ds-flex-item :width="{ base: '60px', md: '200px' }">
          <ds-placeholder>
            <div>
              <ds-avatar :name="name" :image="avatar" size="x-large" />
            </div>
          </ds-placeholder>
        </ds-flex-item>
        <ds-flex-item>
          <ds-placeholder>
            <div>
              <ds-text>Name:</ds-text>
              <ds-text size="x-large">{{ name }}</ds-text>
              <ds-text>Slug:</ds-text>
              <ds-text size="x-large">{{ slug }}</ds-text>
              <ds-text>Id:</ds-text>
              <ds-text size="x-large">{{ id }}</ds-text>
              <ds-text>contributionsCount:</ds-text>
              <ds-text size="x-large">{{ contributionsCount }}</ds-text>
              <ds-text>commentedCount:</ds-text>
              <ds-text size="x-large">{{ commentedCount }}</ds-text>
              <ds-text>createdAt:</ds-text>
              <ds-text size="x-large">{{ createdAt }}</ds-text>
            </div>
          </ds-placeholder>
        </ds-flex-item>
      </ds-flex>
    </div>
    <template slot="footer">
      <base-button class="cancel" @click="cancel">{{ $t('actions.cancel') }}</base-button>
      <base-button danger filled class="confirm" icon="exclamation-circle" @click="confirm">
        {{ $t('settings.deleteUserAccount.name') }}
      </base-button>
    </template>
  </ds-modal>
</template>

<script>
import gql from 'graphql-tag'

export default {
  props: {
    slug: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    contributionsCount: { type: Number, required: true },
    commentedCount: { type: Number, required: true },
    createdAt: { type: String, required: true },
  },
  data() {
    return {
      isOpen: true,
      success: false,
      loading: false,
      isAdmin: this.$store.getters['auth/isAdmin'],
    }
  },
  computed: {
    title() {
      return this.$t('settings.deleteUserAccount.name')
    },
  },
  methods: {
    cancel() {
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      try {
        this.$apollo
          .mutate({
            mutation: gql`
              mutation($id: ID!, $resource: [Deletable]) {
                DeleteUser(id: $id, resource: $resource) {
                  id
                }
              }
            `,
            variables: { id: this.$props.id, resource: ['Post', 'Comment'] },
          })
          .then(() => {
            this.$toast.success(this.$t('settings.deleteUserAccount.success'))
            this.$router.history.push('/')
          })
          .catch(error => {
            this.$toast.error(error.message)
          })
        this.isOpen = false
      } catch (err) {
        this.$toast.error(err.message)
        this.isOpen = false
      }
    },
  },
}
</script>
