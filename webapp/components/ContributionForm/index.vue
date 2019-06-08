<template>
  <ds-form ref="contributionForm" v-model="form" :schema="formSchema" @submit="submit">
    <template slot-scope="{ errors }">
      <ds-card>
        <vue-dropzone
          :options="dropzoneOptions"
          ref="el"
          id="postdropzone"
          :use-custom-slot="true"
          @vdropzone-error="verror"
        >
          <div class="dz-message" @mouseover="hover = true" @mouseleave="hover = false">
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
        <div slot="footer" style="text-align: right">
          <ds-button :disabled="loading || disabled" ghost @click.prevent="$router.back()">
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
        url: this.vddrop,
        maxFilesize: 5.0,
        previewTemplate: this.template(),
      },
      hover: false,
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
      },
    },
  },
  methods: {
    submit() {
      const postMutations = require('~/graphql/PostMutations.js').default(this)
      this.loading = true

      this.$apollo
        .mutate({
          mutation: this.id ? postMutations.UpdatePost : postMutations.CreatePost,
          variables: {
            id: this.id,
            title: this.form.title,
            content: this.form.content,
          },
        })
        .then(res => {
          this.loading = false
          this.$toast.success('Saved!')
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
    vddrop(file) {
      this.form.teaserImage = file[0]
    },
    verror(file, message) {},
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
  height: 160px;
  background-color: $background-color-softest;
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
</style>
