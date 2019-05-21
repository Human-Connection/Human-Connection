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
      @vdropzone-drop="vddrop"
    />
  </div>
</template>
<script>
import vueDropzone from 'nuxt-dropzone'
import gql from 'graphql-tag'

export default {
  components: {
    vueDropzone
  },
  props: {
    user: { type: Object, default: null }
  },
  data() {
    return {
      dropzoneOptions: {
        url: this.vddrop,
        maxFilesize: 0.5,
        previewTemplate: this.template(),
        dictDefaultMessage: ''
      }
    }
  },
  computed: {
    backgroundImage() {
      const { avatar } = this.user || {}
      return {
        backgroundImage: `url(/api${avatar})`
      }
    }
  },
  methods: {
    template() {
      return `<div class="dz-preview dz-file-preview">
                <div class="dz-image">
                  <div data-dz-thumbnail-bg></div>
                </div>
                <div class="dz-details">
                  <div class="dz-size"><span data-dz-size></span></div>
                  <div class="dz-filename"><span data-dz-name></span></div>
                </div>
                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                <div class="dz-error-message"><span data-dz-errormessage></span></div>
                <div class="dz-success-mark"><ds-icon name="check" /></div>
                <div class="dz-error-mark"><ds-icon name="close" /></div>
                </div>
              </div>
      `
    },
    thumbnail(file, dataUrl) {
      var j, len, ref, thumbnailElement
      this.$refs.el.dropzone.element.style['background-image'] = ''
      if (file.previewElement) {
        file.previewElement.classList.remove('dz-file-preview')
        ref = file.previewElement.querySelectorAll('[data-dz-thumbnail-bg]')
        for (j = 0, len = ref.length; j < len; j++) {
          thumbnailElement = ref[j]
          thumbnailElement.alt = file.name
          thumbnailElement.style.backgroundImage = 'url("' + dataUrl + '")'
        }
        return setTimeout(
          (function(_this) {
            return function() {
              return file.previewElement.classList.add('dz-image-preview')
            }
          })(this),
          1
        )
      }
    },
    vddrop([file]) {
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
            avatarUpload: file,
            id: this.user.id
          }
        })
        .then(response => {
          this.$toast.success(this.$t('user.avatar.submitted'))
        })
        .catch(error => this.$toast.error(error.message))
    }
  }
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
  width: 160px;
  display: flex;
}

#customdropzone .dz-preview .dz-image {
  position: relative;
  width: 122px;
  height: 122px;
  margin: -35px;
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
