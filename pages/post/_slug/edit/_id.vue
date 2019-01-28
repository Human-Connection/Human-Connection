<template>
  <ds-flex
    :width="{ base: '100%' }"
    gutter="base"
  >
    <ds-flex-item :width="{ base: '100%' }">
      <ds-card>
        <no-ssr>
          <hc-editor v-model="content" />
        </no-ssr>
        <div
          slot="footer"
          style="text-align: right"
        >
          <ds-button
            icon="check"
            :loading="loading"
            :disabled="disabled"
            primary
            @click="save"
          >
            Speichern
          </ds-button>
        </div>
      </ds-card>
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
      &nbsp;
    </ds-flex-item>
  </ds-flex>
</template>

<script>
import gql from 'graphql-tag'
import HcEditor from '~/components/Editor/Editor.vue'

export default {
  components: {
    HcEditor
  },
  data() {
    return {
      content: '',
      loading: false,
      disabled: false,
      slug: null
    }
  },
  watch: {
    Post: {
      immediate: true,
      handler: function(post) {
        if (!post || !post[0].content) {
          return
        }
        this.slug = post[0].slug
        this.content = post[0].content
      }
    }
  },
  methods: {
    save() {
      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!, $content: String!) {
              UpdatePost(id: $id, content: $content) {
                id
                slug
                content
                contentExcerpt
              }
            }
          `,
          variables: {
            id: 'p1',
            content: this.content
          }
        })
        .then(data => {
          this.loading = false
          this.$toast.success('Saved!')
          this.disabled = true

          this.$router.push({
            name: 'post-slug',
            params: { slug: this.slug }
          })
        })
        .catch(err => {
          this.$toast.error(err.message)
          this.loading = false
          this.disabled = false
        })
    }
    //onUpdate(data) {
    //  console.log('onUpdate', data)
    //}
  },
  apollo: {
    Post: {
      query() {
        return gql(`
          query($id: ID!) {
            Post(id: $id) {
              id
              title
              content
              createdAt
              slug
              image
              tags {
                name
              }
              categories {
                id
                name
                icon
              }
            }
          }
        `)
      },
      variables() {
        return {
          id: this.$route.params.id || 'p1'
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
