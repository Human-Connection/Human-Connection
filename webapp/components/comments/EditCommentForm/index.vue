<template>
  <ds-form v-model="form" @submit="handleSubmit">
    <template slot-scope="{ errors }">
      <ds-card>
        <!-- <no-ssr> -->
        <hc-editor ref="editor" :users="users" :value="form.content" @input="updateEditorContent"/>
        <!-- </no-ssr> -->
        <ds-space/>
        <ds-flex :gutter="{ base: 'small', md: 'small', sm: 'x-large', xs: 'x-large' }">
          <ds-flex-item :width="{ base: '0%', md: '50%', sm: '0%', xs: '0%' }"/>
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '30%', xs: '30%' }">
            <ds-button
              :disabled="disabled"
              ghost
              class="cancelBtn"
              @click.prevent="closeEditWindow"
            >{{ $t('actions.cancel') }}</ds-button>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '40%', xs: '40%' }">
            <ds-button
              type="submit"
              :loading="loading"
              :disabled="disabled || errors"
              primary
            >{{ $t('post.comment.submit') }}</ds-button>
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
    comments: { type: Array, default: () => [] },
    comment: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      disabled: false,
      loading: false,
      form: {
        content: this.comment.contentExcerpt
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
    closeEditWindow() {
      this.$emit('showEditCommentMenu', false)
    },
    handleSubmit() {
      this.loading = true
      this.disabled = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($postId: ID, $content: String!, $id: ID!) {
              UpdateComment(postId: $postId, content: $content, id: $id) {
                id
                content
              }
            }
          `,
          variables: {
            postId: this.post.id,
            content: this.form.content,
            id: this.comment.id
          }
        })
        .then(res => {
          this.loading = false
          this.$root.$emit('refetchPostComments')
          this.$toast.success(this.$t('post.comment.submitted'))
          this.disabled = false
          this.$emit('showEditCommentMenu', false)
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
