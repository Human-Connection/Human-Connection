<template>
  <ds-form
    class="contribution-form"
    ref="contributionForm"
    v-model="form"
    :schema="formSchema"
    @submit="submit"
  >
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
          <ds-chip v-else size="base">{{ form.title.length }}/{{ formSchema.title.max }}</ds-chip>
        </ds-text>
        <client-only>
          <hc-editor
            :users="users"
            :value="form.content"
            :hashtags="hashtags"
            @input="updateEditorContent"
          />
          <ds-text align="right">
            <ds-chip v-if="errors && errors.content" color="danger" size="base">
              {{ contentLength }}
              <ds-icon name="warning"></ds-icon>
            </ds-chip>
            <ds-chip v-else size="base">
              {{ contentLength }}
            </ds-chip>
          </ds-text>
        </client-only>
        <ds-space margin-bottom="small" />
        <hc-categories-select model="categoryIds" :existingCategoryIds="form.categoryIds" />
        <ds-text align="right">
          <ds-chip v-if="errors && errors.categoryIds" color="danger" size="base">
            {{ form.categoryIds.length }} / 3
            <ds-icon name="warning"></ds-icon>
          </ds-chip>
          <ds-chip v-else size="base">{{ form.categoryIds.length }} / 3</ds-chip>
        </ds-text>
        <ds-flex class="contribution-form-footer">
          <ds-flex-item :width="{ lg: '50%', md: '50%', sm: '100%' }" />
          <ds-flex-item>
            <ds-space margin-bottom="small" />
            <ds-select
              model="language"
              :options="languageOptions"
              icon="globe"
              :placeholder="$t('contribution.languageSelectText')"
              :label="$t('contribution.languageSelectLabel')"
            />
          </ds-flex-item>
        </ds-flex>
        <ds-text align="right">
          <ds-chip v-if="errors && errors.language" size="base" color="danger">
            <ds-icon name="warning"></ds-icon>
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
          <ds-button type="submit" icon="check" :loading="loading" :disabled="errors" primary>
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
    const languageOptions = orderBy(locales, 'name').map(locale => {
      return { label: locale.name, value: locale.code }
    })

    const formDefaults = {
      title: '',
      content: '',
      teaserImage: null,
      image: null,
      language: null,
      categoryIds: [],
    }
    let id = null
    let slug = null
    const form = { ...formDefaults }
    if (this.contribution && this.contribution.id) {
      id = this.contribution.id
      slug = this.contribution.slug
      form.title = this.contribution.title
      form.content = this.contribution.content
      form.image = this.contribution.image
      form.language =
        this.contribution && this.contribution.language
          ? languageOptions.find(o => this.contribution.language === o.value)
          : null
      form.categoryIds = this.categoryIds(this.contribution.categories)
    }
    return {
      form,
      formSchema: {
        title: { required: true, min: 3, max: 100 },
        content: { required: true },
        categoryIds: {
          type: 'array',
          required: true,
          validator: (rule, value) => {
            const errors = []
            if (!(value && value.length >= 1 && value.length <= 3)) {
              errors.push(new Error(this.$t('common.validations.categories')))
            }
            return errors
          },
        },
        language: { required: true },
      },
      languageOptions,
      id,
      slug,
      loading: false,
      users: [],
      contentMin: 3,
      hashtags: [],
    }
  },
  computed: {
    contentLength() {
      return this.$filters.removeHtml(this.form.content).length
    },
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  methods: {
    submit() {
      const {
        language: { value: language },
        title,
        content,
        image,
        teaserImage,
        categoryIds,
      } = this.form
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

          this.$router.push({
            name: 'post-id-slug',
            params: { id: result.id, slug: result.slug },
          })
        })
        .catch(err => {
          this.$toast.error(err.message)
          this.loading = false
        })
    },
    updateEditorContent(value) {
      this.$refs.contributionForm.update('content', value)
    },
    addTeaserImage(file) {
      this.form.teaserImage = file
    },
    categoryIds(categories) {
      return categories.map(c => c.id)
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

.contribution-form {
  .ds-chip {
    cursor: default;
  }
}
</style>
