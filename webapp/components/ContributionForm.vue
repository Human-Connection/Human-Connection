<template>
  <ds-form
    ref="contributionForm"
    v-model="form"
    :schema="formSchema"
    @submit="submit"
  >
    <template slot-scope="{ errors }">
      <ds-card>
        <ds-input
          model="title"
          class="post-title"
          placeholder="Title"
          name="title"
          autofocus
        />
        <no-ssr>
          <hc-editor
            :users="users"
            :value="form.content"
            @input="updateEditorContent"
          />
        </no-ssr>
        <div
          slot="footer"
          style="text-align: right"
        >
          <ds-button
            :disabled="loading || disabled"
            ghost
            @click.prevent="$router.back()"
          >
            {{ $t('actions.cancel') }}
          </ds-button>
          <ds-button
            icon="check"
            type="submit"
            :loading="loading"
            :disabled="disabled || errors"
            primary
          >
            {{ $t('actions.save') }}
          </ds-button>
        </div>
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
    contribution: { type: Object, default: () => {} }
  },
  data() {
    return {
      form: {
        title: '',
        content: ''
      },
      formSchema: {
        title: { required: true, min: 3, max: 64 },
        content: { required: true, min: 3 }
      },
      id: null,
      loading: false,
      disabled: false,
      slug: null,
      users: []
    }
  },
  watch: {
    contribution: {
      immediate: true,
      handler: function(contribution) {
        if (!contribution || !contribution.id) {
          return
        }
        this.id = contribution.id
        this.slug = contribution.slug
        this.form.content = contribution.content
        this.form.title = contribution.title
      }
    }
  },
  methods: {
    submit() {
      const postMutations = require('~/graphql/PostMutations.js').default(this)
      this.loading = true

      this.$apollo
        .mutate({
          mutation: this.id
            ? postMutations.UpdatePost
            : postMutations.CreatePost,
          variables: {
            id: this.id,
            title: this.form.title,
            content: this.form.content
          }
        })
        .then(res => {
          this.loading = false
          this.$toast.success('Saved!')
          this.disabled = true

          const result = res.data[this.id ? 'UpdatePost' : 'CreatePost']

          this.$router.push({
            name: 'post-id-slug',
            params: { id: result.id, slug: result.slug }
          })
        })
        .catch(err => {
          this.$toast.error(err.message)
          this.loading = false
          this.disabled = false
        })
    },
    updateEditorContent(value) {
      // this.form.content = value
      this.$refs.contributionForm.update('content', value)
    }
  },
  apollo: {
    User: {
      query() {
        return gql(`{
          User {
            id
            name
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

<style lang="scss">
.post-title {
  margin-top: $space-x-small;
  margin-bottom: $space-xx-small;

  input {
    border: 0;
    font-size: $font-size-x-large;
    font-weight: bold;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
