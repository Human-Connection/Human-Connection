<template>
  <ds-form ref="contributionForm" v-model="form" :schema="formSchema" @submit="submit">
    <template slot-scope="{ errors }">
      <ds-card>
        <hc-teaser-image :contribution="contribution" @addTeaserImage="addTeaserImage">
          <img
            v-if="contribution"
            class="contribution-image"
            :src="contribution.image | proxyApiUrl"
          />
        </hc-teaser-image>
        <ds-input model="title" class="post-title" placeholder="Title" name="title" autofocus />
        <small style="width:100%;position:relative;left:90%">{{ form.title.length }}/64</small>
        <no-ssr>
          <hc-editor
            :users="users"
            :hashtags="hashtags"
            :value="form.content"
            @input="updateEditorContent"
          />
          <small style="width:100%;position:relative;left:90%">{{ form.contentLength }}/2000</small>
        </no-ssr>
        <ds-space margin-bottom="xxx-large" />
        <hc-categories-select
          model="categoryIds"
          @updateCategories="updateCategories"
          :existingCategoryIds="form.categoryIds"
        />
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
        <ds-space />
        <div slot="footer" style="text-align: right">
          <ds-button
            class="cancel-button"
            :disabled="loading"
            ghost
            @click.prevent="$router.back()"
          >
            {{ $t('actions.cancel') }}
          </ds-button>
          <ds-button
            type="submit"
            icon="check"
            :loading="loading"
            :disabled="disabled || errors"
            primary
          >
            {{ $t('actions.save') }}
          </ds-button>
        </div>
        <ds-space margin-bottom="large" />
      </ds-card>
    </template>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'
import HcEditor from '~/components/Editor/Editor'
import orderBy from 'lodash/orderBy'
import locales from '~/locales'
import PostMutations from '~/graphql/PostMutations.js'
import HcCategoriesSelect from '~/components/CategoriesSelect/CategoriesSelect'
import HcTeaserImage from '~/components/TeaserImage/TeaserImage'

export default {
  components: {
    HcEditor,
    HcCategoriesSelect,
    HcTeaserImage,
  },
  props: {
    contribution: { type: Object, default: () => {} },
  },
  data() {
    return {
      form: {
        title: '',
        content: '',
        contentLength: 0,
        teaserImage: null,
        image: null,
        language: null,
        languageOptions: [],
        categoryIds: null,
      },
      formSchema: {
        title: { required: true, min: 3, max: 64 },
        content: { required: true, min: 3, max: 2000 },
      },
      id: null,
      loading: false,
      disabled: true,
      slug: null,
      users: [],
      n: 0,
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
        this.form.image = contribution.image
        this.form.categoryIds = this.categoryIds(contribution.categories)
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
      const { title, content, image, teaserImage, categoryIds } = this.form
      let language
      if (this.form.language) {
        language = this.form.language.value
      } else if (this.contribution && this.contribution.language) {
        language = this.contribution.language
      } else {
        language = this.$i18n.locale()
      }
      this.loading = true
      this.$apollo
        .mutate({
          mutation: this.id ? PostMutations().UpdatePost : PostMutations().CreatePost,
          variables: {
            id: this.id,
            title,
            content,
            categoryIds,
            language,
            image,
            imageUpload: teaserImage,
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

      this.disabled = true
      this.n = value.replace(/<\/?[^>]+(>|$)/gm, '').length
      this.form.contentLength = this.n

      if (this.n > this.formSchema.content.min && this.n < this.formSchema.content.max) {
        this.disabled = false
      }
    },
    availableLocales() {
      orderBy(locales, 'name').map(locale => {
        this.form.languageOptions.push({ label: locale.name, value: locale.code })
      })
    },
    updateCategories(ids) {
      this.form.categoryIds = ids
    },
    addTeaserImage(file) {
      this.form.teaserImage = file
    },
    categoryIds(categories) {
      let categoryIds = []
      categories.map(categoryId => {
        categoryIds.push(categoryId.id)
      })
      return categoryIds
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
</style>
