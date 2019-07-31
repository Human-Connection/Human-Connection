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
        <small class="smallTag">{{ form.title.length }}/{{ formSchema.title.max }}</small>
        <no-ssr>
          <hc-editor
            :users="users"
            :hashtags="hashtags"
            :value="form.content"
            @input="updateEditorContent"
          />
          <small class="smallTag">{{ form.contentLength }}/{{ contentMax }}</small>
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
          >{{ $t('actions.cancel') }}</ds-button>
          <ds-button
            class="submit-button-for-test"
            type="submit"
            icon="check"
            :loading="loading"
            :disabled="disabledByContent || errors"
            primary
            @click.prevent="submit"
          >{{ $t('actions.save') }}</ds-button>
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
        content: [
          /* {
            validator(rule, value, callback, source, options) {
              var errors = []
              if (source.password !== value) {
                errors.push(new Error(passwordMismatchMessage))
              }
              callback(errors)
            },
          }, */
          { required: true },
        ],
      },
      id: null,
      loading: false,
      disabledByContent: true,
      slug: null,
      users: [],
      contentMin: 3,
      contentMax: 2000,

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
        this.form.title = contribution.title
        this.form.content = contribution.content
        this.manageContent(this.form.content)
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
          this.disabledByContent = true
          const result = res.data[this.id ? 'UpdatePost' : 'CreatePost']

          this.$router.push({
            name: 'post-id-slug',
            params: { id: result.id, slug: result.slug },
          })
        })
        .catch(err => {
          this.$toast.error(err.message)
          this.loading = false
          this.disabledByContent = false
        })
    },
    updateEditorContent(value) {
      // TODO: Do smth????? what is happening
      this.$refs.contributionForm.update('content', value)
      this.manageContent(value)
    },
    manageContent(content) {
      // filter HTML out of content value
      const str = content.replace(/<\/?[^>]+(>|$)/gm, '')
      // Set counter length of text
      this.form.contentLength = str.length
      // Enable save button if requirements are met
      this.disabledByContent = !(this.contentMin <= str.length && str.length <= this.contentMax)
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
.smallTag {
  width: 100%;
  position: relative;
  left: 90%;
}
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
