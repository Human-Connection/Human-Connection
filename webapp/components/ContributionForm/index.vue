<template>
  <ds-form ref="contributionForm" v-model="form" :schema="formSchema" @submit="submit">
    <template slot-scope="{ errors }">
      <ds-card>
        <vue-dropzone
          :options="dropzoneOptions"
          ref="el"
          id="postdropzone"
          :use-custom-slot="true"
          @vdropzone-thumbnail="thumbnail"
          @vdropzone-success="vsuccess"
          @vdropzone-error="verror"
        >
          <div
            v-if="!teaser"
            class="dz-message"
            @mouseover="hover = true"
            @mouseleave="hover = false"
          >
            <div class="hc-attachments-upload-area">
              <div class="hc-drag-marker">
                <ds-icon v-if="hover" name="image" size="xxx-large" />
              </div>
            </div>
          </div>
        </vue-dropzone>
        <ds-input model="title" class="post-title" placeholder="Title" name="title" autofocus />
        <no-ssr>
          <hc-editor :users="users" :value="form.content" @input="updateEditorContent" />
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
        <ds-space margin-bottom="large" />
      </ds-card>
    </template>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'
import vueDropzone from 'nuxt-dropzone'
import HcEditor from '~/components/Editor'
import orderBy from 'lodash/orderBy'
import locales from '~/locales'
import PostMutations from '~/graphql/PostMutations.js'

export default {
  components: {
    HcEditor,
    vueDropzone,
  },
  props: {
    contribution: { type: Object, default: () => {} },
  },
  data() {
    return {
      form: {
        title: '',
        content: '',
        teaserImage: '',
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
      dropzoneOptions: {
        url: 'https://httpbin.org/post',
        maxFilesize: 5.0,
        previewTemplate: this.template(),
      },
      hover: false,
      error: false,
      teaser: false,
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
    error() {
      let that = this
      setTimeout(function() {
        that.error = false
      }, 2000)
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
            imageUpload: this.form.teaserImage,
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
    template() {
      return `<div class="dz-preview dz-file-preview">
                <div class="dz-image">
                  <div data-dz-thumbnail-bg></div>
                </div>
              </div>
      `
    },
    verror(file, message) {
      this.error = true
      this.$toast.error(file.status, message)
    },
    availableLocales() {
      orderBy(locales, 'name').map(locale => {
        this.form.languageOptions.push({ label: locale.name, value: locale.code })
      })
    },
    vsuccess(file, response) {
      this.form.teaserImage = file
    },
    thumbnail: function(file, dataUrl) {
      this.teaser = true
      var j, len, ref, thumbnailElement
      if (file.previewElement) {
        ref = document.querySelectorAll('#postdropzone')
        for (j = 0, len = ref.length; j < len; j++) {
          thumbnailElement = ref[j]
          thumbnailElement.classList.add('image-preview')
          thumbnailElement.alt = file.name
          thumbnailElement.style.backgroundImage = 'url("' + dataUrl + '")'
        }
      }
    },
  },
  apollo: {
    User: {
      query() {
        return gql(`{
          User(orderBy: slug_asc) {
            id
            slug
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

#postdropzone {
  min-height: 160px;
  background-color: $background-color-softest;
}

#postdropzone.image-preview {
  background-repeat: no-repeat;
  background-size: 100%;
  height: 600px;
  transition: all 0.2s ease-out;

  width: 100%;
}

@media only screen and (max-width: 400px) {
  #postdropzone.image-preview {
    height: 200px;
  }
}

@media only screen and (min-width: 401px) and (max-width: 960px) {
  #postdropzone.image-preview {
    height: 400px;
  }
}

.hc-attachments-upload-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hc-drag-marker {
  position: relative;
  width: 122px;
  height: 122px;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(0, 0%, 25%);
  transition: all 0.2s ease-out;
  font-size: 60px;
  margin: 20px auto 5px;

  background-color: rgba(255, 255, 255, 0.3);
  opacity: 0.65;

  &:before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 100%;
    border: 20px solid rgba(255, 255, 255, 0.4);
    visibility: hidden;
  }

  &:after {
    position: absolute;
    content: '';
    top: 10px;
    left: 10px;
    bottom: 10px;
    right: 10px;
    border-radius: 100%;
    border: 1px dashed hsl(0, 0%, 25%);
  }

  .hc-attachments-upload-area:hover & {
    opacity: 1;
  }
}
.contribution-form-footer {
  border-top: $border-size-base solid $border-color-softest;
}
</style>
