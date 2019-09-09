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
import PostQuery from '~/graphql/PostQuery'
import CommentMutations from '~/graphql/CommentMutations'

export default {
  components: {
    HcEditor,
  },
  props: {
    post: { type: Object, default: () => {} },
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
          mutation: CommentMutations(this.$i18n).CreateComment,
          variables: {
            postId: this.post.id,
            content: this.form.content,
          },
          update: async (store, { data: { CreateComment } }) => {
            const data = await store.readQuery({
              query: PostQuery(this.$i18n),
              variables: { id: this.post.id },
            })
            data.Post[0].comments.push(CreateComment)
            await store.writeQuery({ query: PostQuery(this.$i18n), data })
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
        return gql`
          {
            User(orderBy: slug_asc) {
              id
              slug
              name
              avatar
            }
          }
        `
      },
      result(result) {
        this.users = result.data.User
      },
    },
  },
}
</script>
