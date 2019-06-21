<template>
  <ds-form ref="contributionForm" v-model="form" :schema="formSchema" @submit="submit">
    <template slot-scope="{ errors }">
      <ds-card>
        <ds-input model="title" class="post-title" placeholder="Title" name="title" autofocus />
        <no-ssr>
          <hc-editor
            :users="users"
            :hashtags="hashtags"
            :value="form.content"
            @input="updateEditorContent"
          />
        </no-ssr>
        <ds-space margin-bottom="xxx-large" />
        <ds-flex class="contribution-form-footer">
          <ds-flex-item :width="{ base: '10%', sm: '10%', md: '10%', lg: '15%' }" />
          <ds-flex-item :width="{ base: '80%', sm: '30%', md: '30%', lg: '20%' }">
            <ds-space margin-bottom="small" />
            <ds-select
              model="language"
              :options="form.languageOptions"
              icon="globe"
              :placeholder="locale"
              :label="$t('contribution.languageSelectLabel')"
            />
          </ds-flex-item>
        </ds-flex>
        <div slot="footer" style="text-align: right">
          <ds-button
            :disabled="loading || disabled"
            ghost
            class="cancel-button"
            @click="$router.back()"
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
import orderBy from 'lodash/orderBy'
import locales from '~/locales'
import PostMutations from '~/graphql/PostMutations.js'

export default {
  components: {
    HcEditor,
  },
  props: {
    contribution: { type: Object, default: () => {} },
  },
  data() {
    return {
      form: {
        title: '',
        content: '',
        language: null,
        languageOptions: [],
      },
      formSchema: {
        title: { required: true, min: 3, max: 64 },
        content: { required: true, min: 3 },
      },
      id: null,
      loading: false,
      disabled: false,
      slug: null,
      users: [],
      hashtags: [],
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
        this.form.language = this.locale
      },
    },
  },
  computed: {
    locale() {
      const locale =
        this.contribution && this.contribution.language
          ? locales.find(loc => this.contribution.language === loc.code)
          : locales.find(loc => this.$i18n.locale() === loc.code)
      return locale.name
    },
  },
  mounted() {
    this.availableLocales()
  },
  methods: {
    submit() {
      this.loading = true
      this.$apollo
        .mutate({
          mutation: this.id ? PostMutations().UpdatePost : PostMutations().CreatePost,
          variables: {
            id: this.id,
            title: this.form.title,
            content: this.form.content,
            language: this.form.language ? this.form.language.value : this.$i18n.locale(),
          },
        })
        .then(res => {
          this.loading = false
          this.$toast.success(this.$t('contribution.success'))
          this.disabled = true

          const result = res.data[this.id ? 'UpdatePost' : 'CreatePost']

          this.$router.push({
            name: 'post-id-slug',
            params: { id: result.id, slug: result.slug },
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
    },
    availableLocales() {
      orderBy(locales, 'name').map(locale => {
        this.form.languageOptions.push({ label: locale.name, value: locale.code })
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
      result(result) {
        this.users = result.data.User
      },
    },
    Tag: {
      query() {
        return gql`
          {
            Tag(orderBy: name_asc) {
              id
              name
            }
          }
        `
      },
      result(result) {
        this.hashtags = result.data.Tag
      },
    },
  },
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

.contribution-form-footer {
  border-top: $border-size-base solid $border-color-softest;
}
</style>
