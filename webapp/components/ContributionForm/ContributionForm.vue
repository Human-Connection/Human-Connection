<template>
  <ds-form ref="contributionForm" v-model="form" :schema="formSchema">
    <template slot-scope="{ errors }">
      <hc-teaser-image :contribution="contribution" @addTeaserImage="addTeaserImage">
        <img
          v-if="contribution"
          class="contribution-image"
          :src="contribution.image | proxyApiUrl"
        />
      </hc-teaser-image>
      <ds-card>
        <ds-space />
        <client-only>
          <hc-user :user="currentUser" :trunc="35" />
        </client-only>
        <ds-space />
        <ds-input
          model="title"
          class="post-title"
          :placeholder="$t('contribution.title')"
          name="title"
          autofocus
        />
        <ds-text align="right">
          <ds-chip v-if="form.title.length < formSchema.title.min" class="checkicon" size="base">
            {{ form.title.length }}/{{ formSchema.title.max }}
            <ds-icon name="warning" class="colorRed"></ds-icon>
          </ds-chip>
          <ds-chip
            v-else-if="form.title.length < formSchema.title.max"
            class="checkicon"
            size="base"
            color="primary"
          >
            {{ form.title.length }}/{{ formSchema.title.max }}
            <ds-icon name="check"></ds-icon>
          </ds-chip>
          <ds-chip v-else class="checkicon" size="base" color="danger">
            {{ form.title.length }}/{{ formSchema.title.max }}
            <ds-icon name="warning"></ds-icon>
          </ds-chip>
        </ds-text>
        <client-only>
          <hc-editor
            :users="users"
            :value="form.content"
            :hashtags="hashtags"
            @input="updateEditorContent"
          />
          <ds-text align="right">
            <ds-chip
              v-if="form.contentLength < formSchema.content.min"
              class="checkicon"
              size="base"
            >
              {{ form.contentLength }}
              <ds-icon name="warning" class="colorRed"></ds-icon>
            </ds-chip>
            <ds-chip v-else class="checkicon" size="base" color="primary">
              {{ form.contentLength }}
              <ds-icon name="check"></ds-icon>
            </ds-chip>
          </ds-text>
        </client-only>
        <ds-space margin-bottom="small" />
        <hc-categories-select
          model="categoryIds"
          @updateCategories="updateCategories"
          :existingCategoryIds="form.categoryIds"
        />
        <ds-text align="right">
          <ds-chip v-if="form.categoryIds.length === 0" class="checkicon checkicon_cat" size="base">
            {{ form.categoryIds.length }} / 3
            <ds-icon name="warning" class="colorRed">></ds-icon>
          </ds-chip>
          <ds-chip v-else class="checkicon checkicon_cat" size="base" color="primary">
            {{ form.categoryIds.length }} / 3
            <ds-icon name="check"></ds-icon>
          </ds-chip>
        </ds-text>
        <ds-flex class="contribution-form-footer">
          <ds-flex-item>
            <ds-space margin-bottom="small" />
            <ds-select
              model="language"
              :options="form.languageOptions"
              icon="globe"
              :placeholder="form.languageDefault"
              :label="$t('contribution.languageSelectLabel')"
              @input.native="updateLanguage"
            />
          </ds-flex-item>
        </ds-flex>
        <ds-text align="right">
          <ds-chip v-if="form.language !== null" size="base" color="primary">
            {{ form.language.label }}
            <ds-icon name="check"></ds-icon>
          </ds-chip>
          <ds-chip v-else size="base">
            {{ $t('contribution.languageSelectLabel') }}
            <ds-icon name="warning" class="colorRed"></ds-icon>
          </ds-chip>
        </ds-text>
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
            class="submit-button-for-test"
            type="submit"
            icon="check"
            :loading="loading"
            :disabled="failsValidations || errors"
            primary
            @click.prevent="submit"
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
import orderBy from 'lodash/orderBy'
import { mapGetters } from 'vuex'
import HcEditor from '~/components/Editor/Editor'
import locales from '~/locales'
import PostMutations from '~/graphql/PostMutations.js'
import HcCategoriesSelect from '~/components/CategoriesSelect/CategoriesSelect'
import HcTeaserImage from '~/components/TeaserImage/TeaserImage'
import HcUser from '~/components/User/User'

export default {
  components: {
    HcEditor,
    HcCategoriesSelect,
    HcTeaserImage,
    HcUser,
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
        languageDefault: this.$t('contribution.languageSelectText'),
        selectedLanguage: '',
        categoryIds: [],
      },
      formSchema: {
        title: { required: true, min: 3, max: 100 },
        content: { required: true, min: 3 },
      },
      id: null,
      loading: false,
      slug: null,
      users: [],
      contentMin: 3,
      failsValidations: true,
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
        this.form.image = contribution.image
        this.form.categoryIds = this.categoryIds(contribution.categories)
        this.manageContent(this.form.content)
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
    ...mapGetters({
      currentUser: 'auth/user',
    }),
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
        .then(({ data }) => {
          this.loading = false
          this.$toast.success(this.$t('contribution.success'))
          const result = data[this.id ? 'UpdatePost' : 'CreatePost']
          this.failedValidations = false

          this.$router.push({
            name: 'post-id-slug',
            params: { id: result.id, slug: result.slug },
          })
        })
        .catch(err => {
          this.$toast.error(err.message)
          this.loading = false
          this.failedValidations = true
        })
    },
    updateEditorContent(value) {
      // TODO: Do smth????? what is happening
      this.$refs.contributionForm.update('content', value)
      this.manageContent(value)
    },
    manageContent(content) {
      let str = content.replace(/<\/?[^>]+(>|$)/gm, '')
      this.form.contentLength = str.length
      this.validatePost()
    },
    availableLocales() {
      orderBy(locales, 'name').map(locale => {
        this.form.languageOptions.push({ label: locale.name, value: locale.code })
      })
    },
    updateCategories(ids) {
      this.form.categoryIds = ids
      this.validatePost()
    },
    updateLanguage() {
      this.form.selectedLanguage = this.form.language.label
      this.validatePost()
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
    validatePost() {
      const passesContentValidations = this.form.contentLength >= this.contentMin
      const passesCategoryValidations =
        this.form.categoryIds.length > 0 && this.form.categoryIds.length <= 3
      const passedLanguageValidation = this.form.language !== null

      this.failsValidations = !(
        passesContentValidations &&
        passesCategoryValidations &&
        passedLanguageValidation
      )
    },
  },
  apollo: {
    User: {
      query() {
        return gql`
          query {
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
    Tag: {
      query() {
        return gql`
          query {
            Tag(orderBy: id_asc) {
              id
            }
          }
        `
      },
      result({ data: { Tag } }) {
        this.hashtags = Tag
      },
    },
  },
}
</script>

<style lang="scss" scoped>
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
.checkicon {
  cursor: default;
  top: -18px;
}
.checkicon_cat {
  top: -58px;
}
.colorRed {
  color: red;
}
</style>
