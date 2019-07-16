<template>
  <ds-form v-model="form" @submit="handleSubmit">
    <template slot-scope="{ errors }">
      <ds-card>
        <!-- with no-ssr the content is not shown -->
        <hc-editor ref="editor" :users="users" :value="form.content" @input="updateEditorContent" />
        <ds-space />
        <ds-flex :gutter="{ base: 'small', md: 'small', sm: 'x-large', xs: 'x-large' }">
          <ds-flex-item :width="{ base: '0%', md: '50%', sm: '0%', xs: '0%' }" />
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '30%', xs: '30%' }">
            <ds-button ghost class="cancelBtn" @click.prevent="closeEditWindow">
              {{ $t('actions.cancel') }}
            </ds-button>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '40%', xs: '40%' }">
            <ds-button type="submit" :loading="loading" :disabled="disabled || errors" primary>
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
import HcEditor from '~/components/Editor/Editor'
import { mapMutations } from 'vuex'
import CommentMutations from '~/graphql/CommentMutations.js'

export default {
  components: {
    HcEditor,
  },
  props: {
    comment: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      disabled: true,
      loading: false,
      form: {
        content: this.comment.content,
      },
      users: [],
    }
  },
  methods: {
    ...mapMutations({
      setEditPending: 'editor/SET_EDIT_PENDING',
    }),
    updateEditorContent(value) {
      const sanitizedContent = value.replace(/<(?:.|\n)*?>/gm, '').trim()
      this.disabled = value === this.comment.content || sanitizedContent.length < 1
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
          mutation: CommentMutations().UpdateComment,
          variables: {
            content: this.form.content,
            id: this.comment.id,
          },
        })
        .then(() => {
          this.loading = false

          this.$toast.success(this.$t('post.comment.updated'))
          this.disabled = false
          this.$emit('showEditCommentMenu', false)
          this.setEditPending(false)
        })
        .catch(err => {
          this.$toast.error(err.message)
        })
    },
  },
  apollo: {
    User: {
      query() {
        return gql`
          {
            User(orderBy: slug_asc) {
              id
              slug
            }
          }
        `
      },
      result({ data: { User } }) {
        this.users = User
      },
    },
  },
}
</script>
