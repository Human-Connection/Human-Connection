<template>
  <!-- TODO: rename to ImageUploader when delete-teaser-image PR is merged -->
  <div class="image-uploader">
    <vue-dropzone
      v-show="!showCropper"
      id="postdropzone"
      :options="dropzoneOptions"
      :use-custom-slot="true"
      @vdropzone-error="onDropzoneError"
      @vdropzone-thumbnail="initCropper"
    >
      <loading-spinner v-if="isLoadingImage" />
      <base-icon v-else name="image" />
    </vue-dropzone>
    <div v-show="showCropper" class="crop-overlay">
      <img id="cropping-image" />
      <base-button class="crop-confirm" filled @click="cropImage">
        {{ $t('contribution.teaserImage.cropperConfirm') }}
      </base-button>
      <base-button
        class="crop-cancel"
        icon="close"
        size="small"
        circle
        danger
        filled
        @click="closeCropper"
      />
    </div>
  </div>
</template>

<script>
import VueDropzone from 'nuxt-dropzone'
import Cropper from 'cropperjs'
import LoadingSpinner from '~/components/_new/generic/LoadingSpinner/LoadingSpinner'
import 'cropperjs/dist/cropper.css'

export default {
  components: {
    LoadingSpinner,
    VueDropzone,
  },
  props: {
    contribution: { type: Object, default: () => {} },
  },
  data() {
    return {
      dropzoneOptions: {
        url: () => '',
        maxFilesize: 5.0,
        previewTemplate: '<img class="preview-image" />',
      },
      cropper: null,
      file: null,
      showCropper: false,
      isLoadingImage: false,
    }
  },
  methods: {
    onDropzoneError(file, message) {
      this.$toast.error(file.status, message)
    },
    clearImages() {
      const images = document.querySelectorAll('.preview-image')
      images.forEach((image, index) => {
        if (index === images.length - 1) image.src = ''
        else image.remove()
      })
    },
    initCropper(file) {
      this.showCropper = true
      this.file = file
      this.clearImages()

      const imageElement = document.querySelector('#cropping-image')
      imageElement.src = URL.createObjectURL(file)
      this.cropper = new Cropper(imageElement, { zoomable: false, autoCropArea: 0.9 })
    },
    cropImage() {
      this.isLoadingImage = true
      const canvas = this.cropper.getCroppedCanvas()
      canvas.toBlob(blob => {
        const imageAspectRatio = canvas.width / canvas.height
        const croppedImageFile = new File([blob], this.file.name, { type: this.file.type })
        this.$emit('addTeaserImage', croppedImageFile)
        this.$emit('addImageAspectRatio', imageAspectRatio)
        this.setupPreview(canvas.toDataURL())
      }, 'image/jpeg')

      this.closeCropper()
    },
    setupPreview(url) {
      const previewElement = document.querySelector('.image-uploader .preview-image')
      previewElement.src = url
      this.$nextTick((this.isLoadingImage = false))
    },
    closeCropper() {
      this.showCropper = false
      this.cropper.destroy()
    },
  },
}
</script>
<style lang="scss">
.image-uploader {
  position: relative;
  min-height: 200px;
  cursor: pointer;

  .image + & {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  &:only-child {
    background-color: $color-neutral-85;
  }

  &:disabled {
    pointer-events: none;
  }

  &.--blur-image .preview-image {
    filter: blur(22px);
  }

  .preview-image {
    width: 100%;
    max-height: 2000px;
    object-fit: contain;
  }

  > .crop-overlay {
    width: 100%;
    height: 400px;
    font-size: $font-size-base;

    > .img {
      display: block;
      max-width: 100%;
    }

    > .crop-confirm {
      position: absolute;
      left: 10px;
      top: 10px;
      z-index: 1;
    }

    > .crop-cancel {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 1;
    }
  }

  .dz-message {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: 1;

    &:hover {
      > .base-icon {
        opacity: 1;
      }
    }

    > .base-icon {
      position: absolute;
      padding: $space-small;
      border-radius: 100%;
      border: $border-size-base dashed $color-neutral-20;
      background-color: $color-neutral-95;
      font-size: 60px;
      opacity: 0.7;
    }
  }
}
</style>
