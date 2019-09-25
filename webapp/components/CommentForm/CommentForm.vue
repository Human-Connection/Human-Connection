<template>
  <ds-form v-model="form" @submit="handleSubmit">
    <template slot-scope="{ errors }">
      <ds-card>
        <!-- with client-only the content is not shown -->
        <hc-editor ref="editor" :users="users" :value="form.content" @input="updateEditorContent" />
        <ds-space />
        <ds-flex :gutter="{ base: 'small', md: 'small', sm: 'x-large', xs: 'x-large' }">
          <ds-flex-item :width="{ base: '0%', md: '50%', sm: '0%', xs: '0%' }" />
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '30%', xs: '30%' }">
            <ds-button
              :disabled="disabled && !update"
              ghost
              class="cancelBtn"
              @click.prevent="handleCancel"
            >
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
import HcEditor from '~/components/Editor/Editor'
import { COMMENT_MIN_LENGTH } from '../../constants/comment'
import { minimisedUserQuery } from '~/graphql/User'
import CommentMutations from '~/graphql/CommentMutations'

export default {
  components: {
    HcEditor,
  },
  props: {
    update: { type: Boolean, default: () => false },
    post: { type: Object, default: () => {} },
    comment: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      disabled: true,
      loading: false,
      form: {
        content: !this.update || !this.comment.content ? '' : this.comment.content,
      },
      users: [],
    }
  },
  methods: {
    updateEditorContent(value) {
      const sanitizedContent = this.$filters.removeHtml(value, false)
      if (!this.update) {
        if (sanitizedContent.length < COMMENT_MIN_LENGTH) {
          this.disabled = true
        } else {
          this.disabled = false
        }
      } else {
        this.disabled =
          value === this.comment.content || sanitizedContent.length < COMMENT_MIN_LENGTH
      }
      this.form.content = value
    },
    clear() {
      this.$refs.editor.clear()
    },
    closeEditWindow() {
      this.$emit('showEditCommentMenu', false)
    },
    handleCancel() {
      if (!this.update) {
        this.clear()
      } else {
        this.closeEditWindow()
      }
    },
    handleSubmit() {
      let mutateParams
      if (!this.update) {
        mutateParams = {
          mutation: CommentMutations(this.$i18n).CreateComment,
          variables: {
            postId: this.post.id,
            content: this.form.content,
          },
        }
      } else {
        mutateParams = {
          mutation: CommentMutations(this.$i18n).UpdateComment,
          variables: {
            id: this.comment.id,
            content: this.form.content,
          },
        }
      }

      this.loading = true
      this.disabled = true
      this.$apollo
        .mutate(mutateParams)
        .then(res => {
          this.loading = false
          if (!this.update) {
            const {
              data: { CreateComment },
            } = res
            this.$emit('createComment', CreateComment)
            this.clear()
            this.$toast.success(this.$t('post.comment.submitted'))
            this.disabled = false
          } else {
            const {
              data: { UpdateComment },
            } = res
            this.$emit('updateComment', UpdateComment)
            this.$emit('collapse')
            this.$toast.success(this.$t('post.comment.updated'))
            this.disabled = false
            this.closeEditWindow()
          }
        })
        .catch(err => {
          this.$toast.error(err.message)
        })
    },
  },
  apollo: {
    User: {
      query() {
        return minimisedUserQuery()
      },
      result(result) {
        this.users = result.data.User
      },
    },
  },
}
</script>
