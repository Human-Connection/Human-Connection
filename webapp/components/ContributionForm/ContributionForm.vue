<template>
  <ds-form
    class="contribution-form"
    ref="contributionForm"
    v-model="form"
    :schema="formSchema"
    @submit="submit"
  >
    <template slot-scope="{ errors }">
      <base-card>
        <section :class="['card-image', form.blurImage && '--blur-image']">
          <img v-if="contribution" class="preview-image" :src="contribution.image | proxyApiUrl" />
          <teaser-image
            :contribution="contribution"
            @addTeaserImage="addTeaserImage"
            @addImageAspectRatio="addImageAspectRatio"
          />
        </section>
        <div v-if="form.teaserImage || form.image" class="blur-toggle">
          <label for="blur-img">{{ $t('contribution.inappropriatePicture') }}</label>
          <input type="checkbox" id="blur-img" v-model="form.blurImage" />
          <a
            href="https://support.human-connection.org/kb/faq.php?id=113"
            target="_blank"
            class="link"
          >
            {{ $t('contribution.inappropriatePictureText') }}
            <base-icon name="question-circle" />
          </a>
        </div>
        <ds-input
          model="title"
          :placeholder="$t('contribution.title')"
          name="title"
          autofocus
          size="large"
        />
        <ds-chip size="base" :color="errors && errors.title && 'danger'">
          {{ form.title.length }}/{{ formSchema.title.max }}
          <base-icon v-if="errors && errors.title" name="warning" />
        </ds-chip>
        <hc-editor
          :users="users"
          :value="form.content"
          :hashtags="hashtags"
          @input="updateEditorContent"
        />
        <ds-chip size="base" :color="errors && errors.content && 'danger'">
          {{ contentLength }}
          <base-icon v-if="errors && errors.content" name="warning" />
        </ds-chip>
        <categories-select model="categoryIds" :existingCategoryIds="form.categoryIds" />
        <ds-chip size="base" :color="errors && errors.categoryIds && 'danger'">
          {{ form.categoryIds.length }} / 3
          <base-icon v-if="errors && errors.categoryIds" name="warning" />
        </ds-chip>
        <ds-select
          model="language"
          icon="globe"
          class="select-field"
          :options="languageOptions"
          :placeholder="$t('contribution.languageSelectText')"
          :label="$t('contribution.languageSelectLabel')"
        />
        <ds-chip v-if="errors && errors.language" size="base" color="danger">
          <base-icon name="warning" />
        </ds-chip>
        <div class="buttons">
          <base-button data-test="cancel-button" :disabled="loading" @click="$router.back()" danger>
            {{ $t('actions.cancel') }}
          </base-button>
          <base-button type="submit" icon="check" :loading="loading" :disabled="errors" filled>
            {{ $t('actions.save') }}
          </base-button>
        </div>
      </base-card>
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
import CategoriesSelect from '~/components/CategoriesSelect/CategoriesSelect'
import TeaserImage from '~/components/TeaserImage/TeaserImage'

export default {
  components: {
    HcEditor,
    CategoriesSelect,
    TeaserImage,
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
      imageAspectRatio: null,
      image: null,
      language: null,
      categoryIds: [],
      blurImage: false,
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
      form.imageAspectRatio = this.contribution.imageAspectRatio
      form.blurImage = this.contribution.imageBlurred
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
        blurImage: { required: false },
      },
      languageOptions,
      id,
      slug,
      loading: false,
      users: [],
      contentMin: 3,
      hashtags: [],
      elem: null,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    contentLength() {
      return this.$filters.removeHtml(this.form.content).length
    },
  },
  methods: {
    submit() {
      const {
        language: { value: language },
        title,
        content,
        image,
        teaserImage,
        imageAspectRatio,
        categoryIds,
        blurImage,
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
            imageBlurred: blurImage,
            imageAspectRatio,
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
    addImageAspectRatio(aspectRatio) {
      this.form.imageAspectRatio = aspectRatio
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

<style lang="scss">
.contribution-form {
  > .base-card {
    display: flex;
    flex-direction: column;

    > .card-image {
      position: relative;
      overflow: hidden;
      margin-bottom: $space-xx-small;

      &.--blur-image img {
        filter: blur(22px);
      }
    }

    > .ds-form-item {
      margin: 0;
    }

    > .ds-chip {
      align-self: flex-end;
      margin: $space-xx-small 0 $space-base;
      cursor: default;
    }

    > .select-field {
      align-self: flex-end;
    }

    > .buttons {
      align-self: flex-end;
      margin-top: $space-base;
    }
  }

  .preview-image {
    width: 100%;
    max-height: 2000px;
    object-fit: contain;
  }

  .blur-toggle {
    text-align: right;
    margin-bottom: $space-base;

    > .link {
      display: block;
    }
  }
}
</style>
