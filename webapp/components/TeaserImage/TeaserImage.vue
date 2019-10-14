<template>
  <vue-dropzone
    :options="dropzoneOptions"
    ref="el"
    id="postdropzone"
    class="ds-card-image"
    :use-custom-slot="true"
    @vdropzone-error="verror"
    @vdropzone-thumbnail="transformImage"
    @vdropzone-drop="dropzoneDrop"
  >
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
        url: () => '',
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
    transformImage(file) {
      let thumbnailElement, editor, confirm, thumbnailPreview, contributionImage
      // Create the image editor overlay
      editor = document.createElement('div')
      thumbnailElement = document.querySelectorAll('#postdropzone')[0]
      thumbnailPreview = document.querySelectorAll('.thumbnail-preview')[0]
      if (thumbnailPreview) thumbnailPreview.remove()
      contributionImage = document.querySelectorAll('.contribution-image')[0]
      if (contributionImage) contributionImage.remove()
      editor.classList.add('crop-overlay')
      thumbnailElement.appendChild(editor)
      // Create the confirm button
      confirm = document.createElement('button')
      confirm.classList.add('crop-confirm', 'ds-button', 'ds-button-primary')
      confirm.textContent = this.$t('contribution.teaserImage.cropperConfirm')
      confirm.addEventListener('click', () => {
        // Get the canvas with image data from Cropper.js
        let canvas = cropper.getCroppedCanvas()
        canvas.toBlob(blob => {
          this.$refs.el.manuallyAddFile(blob, canvas.toDataURL(), null, null, {
            dontSubstractMaxFiles: false,
            addToFiles: true,
          })
          image = new Image()
          image.src = canvas.toDataURL()
          image.classList.add('thumbnail-preview')
          thumbnailElement.appendChild(image)
          // Remove the editor from view
          editor.parentNode.removeChild(editor)
          this.$emit('addTeaserImage', blob)
        })
      })
      editor.appendChild(confirm)

      // Load the image
      let image = new Image()
      image.src = URL.createObjectURL(file)
      editor.appendChild(image)
      // Create Cropper.js and pass image
      let cropper = new Cropper(image, { zoomable: false })
    },
    dropzoneDrop() {
      let cropOverlay = document.querySelectorAll('.crop-overlay')[0]
      if (cropOverlay) cropOverlay.remove()
    },
  },
}
</script>
<style lang="scss">
#postdropzone {
  width: 100%;
  min-height: 500px;
  background-color: $background-color-softest;
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
  margin: 180px 5px;
  color: hsl(0, 0%, 25%);
  transition: all 0.2s ease-out;
  font-size: 60px;
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

.crop-overlay {
  max-height: 2000px;
  position: relative;
  width: 100%;
  background-color: #000;
}

.crop-confirm {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 1;
}
</style>
