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
          <ds-chip v-if="errors && errors.title" color="danger" size="base">
            {{ form.title.length }}/{{ formSchema.title.max }}
            <ds-icon name="warning"></ds-icon>
          </ds-chip>
          <ds-chip v-else size="base">
            {{ form.title.length }}/{{ formSchema.title.max }}
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
              v-if="errors && errors.content"
              color="danger"
              size="base"
            >
              {{ contentLength }}
              <ds-icon name="warning"></ds-icon>
            </ds-chip>
            <ds-chip v-else size="base">
              {{ contentLength }}
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
            <ds-icon name="warning"></ds-icon>
          </ds-chip>
          <ds-chip v-else class="checkicon checkicon_cat" size="base" color="primary">
            {{ form.categoryIds.length }} / 3
            <ds-icon name="check"></ds-icon>
          </ds-chip>
        </ds-text>
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
        teaserImage: null,
        image: null,
        language: null,
        languageOptions: [],
        categoryIds: [],
      },
      formSchema: {
        title: { required: true, min: 3, max: 100 },
        content: {
          required: true,
          min: 3,
          transform: (content) => {
            return this.$filters.removeHtml(content)
          }
        },
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
      },
    },
  },
  computed: {
    contentLength() {
      return this.$filters.removeHtml(this.form.content).length
    },
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
      this.$refs.contributionForm.update('content', value)
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
      const passesCategoryValidations =
        this.form.categoryIds.length > 0 && this.form.categoryIds.length <= 3
      this.failsValidations = !(passesCategoryValidations)
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
</style>
