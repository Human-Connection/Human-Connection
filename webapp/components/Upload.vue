<template>
  <div>
    <vue-dropzone
      id="customdropzone"
      ref="el"
      :options="dropzoneOptions"
      :include-styling="false"
      :style="{ backgroundImage: backgroundImage(`${user.avatar}`)}"
      @vdropzone-error="verror"
      @vdropzone-thumbnail="thumbnail"
      @vdropzone-drop="vddrop"
      @vdropzone-success="vsuccess"
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
    backgroundImage: () => avatar => {
      return `url(${avatar})`
    }
  },
  mounted() {
    // Everything is mounted and you can access the dropzone instance
    const instance = this.$refs.el.dropzone
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
                <div class="dz-success-mark"><i class="fa fa-check"></i></div>
                <div class="dz-error-mark"><i class="fa fa-close"></i></div>
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
    vsuccess(file, response) {
      console.log('file', file.upload.filename, 'response', response)
    },
    vddrop([file]) {
      this.dDrop = true
      console.log('this is a file', file)
      const uploadFileMutation = gql`
        mutation($file: Upload!) {
          uploadFile(file: $file)
        }
      `
      this.$apollo
        .mutate({ mutation: uploadFileMutation, variables: { file } })
        .then(reponse => {
          console.log(response)
          this.$toast.success('Upload successful')
        })
        .catch(error => this.$toast.error(error.message))
    },
    verror(file) {
      console.log(file)
    }
  }
}
</script>
<style>
#customdropzone {
  /* background-color: orange; */
  margin-left: 35px;
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

#customdropzone .dz-preview {
  width: 160px;
  display: flex;
}
#customdropzone .dz-preview .dz-image {
  position: relative;
  width: 122px;
  height: 122px;
  margin-left: -35px;
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
