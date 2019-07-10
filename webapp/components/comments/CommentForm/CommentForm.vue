<template>
  <ds-form v-model="form" @submit="handleSubmit">
    <template slot-scope="{ errors }">
      <ds-card>
        <hc-editor
          ref="editor"
          :users="users"
          :hashtags="null"
          :value="form.content"
          @input="updateEditorContent"
        />
        <ds-space />
        <ds-flex :gutter="{ base: 'small', md: 'small', sm: 'x-large', xs: 'x-large' }">
          <ds-flex-item :width="{ base: '0%', md: '50%', sm: '0%', xs: '0%' }" />
          <ds-flex-item :width="{ base: '40%', md: '20%', sm: '30%', xs: '30%' }">
            <ds-button :disabled="disabled" ghost class="cancelBtn" @click.prevent="clear">
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
import PostCommentsQuery from '~/graphql/PostCommentsQuery.js'
import CommentMutations from '~/graphql/CommentMutations.js'

export default {
  components: {
    HcEditor,
  },
  props: {
    post: { type: Object, default: () => {} },
    comments: { type: Array, default: () => [] },
  },
  data() {
    return {
      disabled: true,
      loading: false,
      form: {
        content: '',
      },
      users: [],
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
      this.loading = true
      this.disabled = true
      this.$apollo
        .mutate({
          mutation: CommentMutations().CreateComment,
          variables: {
            postId: this.post.id,
            content: this.form.content,
          },
          update: (store, { data: { CreateComment } }) => {
            const data = store.readQuery({
              query: PostCommentsQuery(this.$i18n),
              variables: { slug: this.post.slug },
            })
            data.Post[0].comments.push(CreateComment)
            store.writeQuery({ query: PostCommentsQuery(this.$i18n), data })
          },
        })
        .then(res => {
          this.loading = false
          this.clear()
          this.$toast.success(this.$t('post.comment.submitted'))
          this.disabled = false
        })
        .catch(err => {
          this.$toast.error(err.message)
        })
    },
  },
  apollo: {
    User: {
      query() {
        return gql(`{
          User(orderBy: slug_asc) {
            id
            slug
            name
            avatar
          }
        }`)
      },
      result(result) {
        this.users = result.data.User
      },
    },
  },
}
</script>
