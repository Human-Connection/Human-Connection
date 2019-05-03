<template>
  <ds-form
    v-model="form"
    @submit="handleSubmit"
  >
    <template slot-scope="{ errors }">
      <ds-card>
        <no-ssr>
          <hc-editor
            ref="editor"
            :users="users"
            :value="form.content"
            @input="updateEditorContent"
          />
        </no-ssr>
        <ds-space />
        <ds-flex :gutter="{ base: 'small', md: 'small', sm: 'x-large', xs: 'x-large' }">
          <ds-flex-item :width="{ base: '0%', md: '50%', sm: '0%', xs: '0%' }" />
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '30%', xs: '30%' }">
            <ds-button
              :disabled="disabled"
              ghost
              class="cancelBtn"
              @click.prevent="clear"
            >
              {{ $t('actions.cancel') }}
            </ds-button>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '40%', xs: '40%' }">
            <ds-button
              type="submit"
              :disabled="disabled || errors"
              primary
            >
              {{ $t('post.comment.submit') }}
            </ds-button>
          </ds-flex-item>
        </ds-flex>
      </ds-card>
    </template>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'
import HcEditor from '~/components/Editor'

export default {
  components: {
    HcEditor
  },
  props: {
    post: { type: Object, default: () => {} },
    comments: { type: Array, default: () => [] }
  },
  data() {
    return {
      disabled: true,
      form: {
        content: ''
      },
      users: []
    }
  },
  methods: {
    updateEditorContent(value) {
      const content = value.replace(/<(?:.|\n)*?>/gm, '').trim()
      if (content.length < 1) {
        this.disabled = true
      } else {
        this.disabled = false
      }
      this.form.content = value
    },
    clear() {
      this.$refs.editor.clear()
    },
    handleSubmit() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($postId: ID, $content: String!) {
              CreateComment(postId: $postId, content: $content) {
                id
                content
              }
            }
          `,
          variables: {
            postId: this.post.id,
            content: this.form.content
          }
        })
        .then(res => {
          this.$root.$emit('refetchPostComments', res.data.CreateComment)
          this.$refs.editor.clear()
          this.$toast.success(this.$t('post.comment.submitted'))
        })
        .catch(err => {
          this.$toast.error(err.message)
        })
    }
  },
  apollo: {
    User: {
      query() {
        return gql(`{
          User(orderBy: slug_asc) {
            id
            slug
          }
        }`)
      },
      result(result) {
        this.users = result.data.User
      }
    }
  }
}
</script>
