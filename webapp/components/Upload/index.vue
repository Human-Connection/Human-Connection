<template>
  <div>
    <vue-dropzone
      id="customdropzone"
      :key="user.avatar"
      ref="el"
      :options="dropzoneOptions"
      :include-styling="false"
      :style="backgroundImage"
      @vdropzone-thumbnail="thumbnail"
      @vdropzone-error="verror"
    />
  </div>
</template>
<script>
import vueDropzone from 'nuxt-dropzone'
import gql from 'graphql-tag'

export default {
  components: {
    vueDropzone,
  },
  props: {
    user: { type: Object, default: null },
  },
  data() {
    return {
      dropzoneOptions: {
        url: this.vddrop,
        maxFilesize: 5.0,
        previewTemplate: this.template(),
        dictDefaultMessage: '',
      },
      error: false,
    }
  },
  computed: {
    backgroundImage() {
      const { avatar } = this.user || {}
      const userAvatar = avatar.startsWith('/') ? avatar.replace('/', '/api/') : avatar
      return {
        backgroundImage: `url(${userAvatar})`,
      }
    },
  },
  watch: {
    error() {
      let that = this
      setTimeout(function() {
        that.error = false
      }, 2000)
    },
  },
  methods: {
    template() {
      return `<div class="dz-preview dz-file-preview">
                <div class="dz-image">
                  <div data-dz-thumbnail-bg></div>
                </div>
              </div>
      `
    },
    thumbnail(file, dataUrl) {
      let j, len, ref, thumbnailElement
      if (file.previewElement) {
        this.$refs.el.$el.style.backgroundImage = ''
        file.previewElement.classList.remove('dz-file-preview')
        ref = file.previewElement.querySelectorAll('[data-dz-thumbnail-bg]')
        for (j = 0, len = ref.length; j < len; j++) {
          thumbnailElement = ref[j]
          thumbnailElement.alt = file.name
          thumbnailElement.style.backgroundImage = 'url("' + dataUrl + '")'
        }
        file.previewElement.classList.add('dz-image-preview')
      }
    },
    vddrop(file) {
      const avatarUpload = file[0]
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!, $avatarUpload: Upload) {
              UpdateUser(id: $id, avatarUpload: $avatarUpload) {
                id
                avatar
              }
            }
          `,
          variables: {
            avatarUpload,
            id: this.user.id,
          },
        })
        .then(() => {
          this.$toast.success(this.$t('user.avatar.submitted'))
        })
        .catch(error => this.$toast.error(error.message))
    },
    verror(file, message) {
      if (file.status === 'error') {
        this.error = true
        this.$toast.error(file.status, message)
      }
    },
  },
}
</script>
<style>
#customdropzone {
  margin: -60px auto auto;
  width: 122px;
  min-height: 122px;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 50%;
  font-family: 'Arial', sans-serif;
  letter-spacing: 0.2px;
  color: #777;
  transition: background-color 0.2s linear;
  padding: 40px;
}

#customdropzone:hover {
  cursor: pointer;
}

#customdropzone .dz-preview {
  transition: all 0.2s ease-out;
  width: 160px;
  display: flex;
}

#customdropzone .dz-preview .dz-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  overflow: hidden;
}

#customdropzone .dz-preview .dz-image > div {
  width: inherit;
  height: inherit;
  border-radius: 50%;
  background-size: cover;
}

#customdropzone .dz-preview .dz-image > img {
  width: 100%;
}

#customdropzone .dz-preview .dz-details {
  color: white;
  transition: opacity 0.2s linear;
  text-align: center;
}

#customdropzone .dz-success-mark,
.dz-error-mark,
.dz-remove {
  display: none;
}
</style>
