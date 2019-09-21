<template>
  <vue-dropzone
    :options="dropzoneOptions"
    ref="el"
    id="postdropzone"
    class="ds-card-image"
    :use-custom-slot="true"
    @vdropzone-error="verror"
    @vdropzone-thumbnail="transformImage"
  >
    <div class="dz-message">
      <div
        :class="{
          'hc-attachments-upload-area-post': true,
          'hc-attachments-upload-area-update-post': contribution,
        }"
      >
        <slot></slot>
        <div
          :class="{
            'hc-drag-marker-post': true,
            'hc-drag-marker-update-post': contribution,
          }"
        >
          <ds-icon name="image" size="xxx-large" />
        </div>
      </div>
    </div>
  </vue-dropzone>
</template>

<script>
import vueDropzone from 'nuxt-dropzone'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  components: {
    vueDropzone,
  },
  props: {
    contribution: { type: Object, default: () => {} },
  },
  data() {
    return {
      dropzoneOptions: {
        url: this.addTeaserImage,
        maxFilesize: 5.0,
        previewTemplate: this.template(),
      },
      error: false,
    }
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
    verror(file, message) {
      this.error = true
      this.$toast.error(file.status, message)
    },
    addTeaserImage(file) {
      this.$emit('addTeaserImage', file[0])
      return ''
    },
    thumbnail: (file, dataUrl) => {
      let thumbnailElement, contributionImage, uploadArea, thumbnailPreview, image
      if (file.previewElement) {
        thumbnailElement = document.querySelectorAll('#postdropzone')[0]
        contributionImage = document.querySelectorAll('.contribution-image')[0]
        thumbnailPreview = document.querySelectorAll('.thumbnail-preview')[0]
        if (contributionImage) {
          uploadArea = document.querySelectorAll('.hc-attachments-upload-area-update-post')[0]
          uploadArea.removeChild(contributionImage)
          uploadArea.classList.remove('hc-attachments-upload-area-update-post')
        }
        image = new Image()
        image.src = dataUrl
        image.classList.add('thumbnail-preview')
        if (thumbnailPreview) return thumbnailElement.replaceChild(image, thumbnailPreview)
        thumbnailElement.appendChild(image)
      }
    },
    transformImage(file) {
      let myDropZone = this

      // Create the image editor overlay
      let editor = document.createElement('div')
      editor.style.position = 'fixed'
      editor.style.left = 0
      editor.style.right = 0
      editor.style.top = 0
      editor.style.bottom = 0
      editor.style.zIndex = 9999
      editor.style.backgroundColor = '#000'

      // Create the confirm button
      let confirm = document.createElement('button')
      confirm.style.position = 'absolute'
      confirm.style.left = '10px'
      confirm.style.top = '10px'
      confirm.style.zIndex = 9999
      confirm.textContent = 'Confirm'
      confirm.addEventListener('click', function() {
        // Get the canvas with image data from Cropper.js
        let canvas = cropper.getCroppedCanvas()
        myDropZone.thumbnail(file, canvas.toDataURL())

        // Remove the editor from view
        editor.parentNode.removeChild(editor)
      })
      editor.appendChild(confirm)

      // Load the image
      let image = new Image()
      image.src = URL.createObjectURL(file)
      editor.appendChild(image)
      // Append the editor to the page
      document.body.appendChild(editor)

      // Create Cropper.js and pass image
      let cropper = new Cropper(image, {})
    },
  },
}
</script>
<style lang="scss">
#postdropzone {
  width: 100%;
  min-height: 300px;
  background-color: $background-color-softest;
}

@media only screen and (max-width: 960px) {
  #postdropzone {
    min-height: 200px;
  }
}

.hc-attachments-upload-area-post {
  position: relative;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.hc-attachments-upload-area-update-post img {
  object-fit: cover;
  object-position: center;
  display: block;
  width: 100%;
}

.hc-attachments-upload-area-update-post:hover {
  opacity: 0.7;
}

.hc-drag-marker-post {
  position: absolute;
  width: 122px;
  height: 122px;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(0, 0%, 25%);
  transition: all 0.2s ease-out;
  font-size: 60px;
  margin: 80px 5px;

  background-color: $background-color-softest;
  opacity: 0.65;

  &:before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 100%;
    border: 20px solid $text-color-base;
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
    border: $border-size-base dashed $text-color-base;
  }

  .hc-attachments-upload-area-post:hover & {
    opacity: 1;
  }
}

.hc-drag-marker-update-post {
  opacity: 0;
}

.contribution-form-footer {
  border-top: $border-size-base solid $border-color-softest;
}

.contribution-image {
  max-height: 300px;
}
</style>
