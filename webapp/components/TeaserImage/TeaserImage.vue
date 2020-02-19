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
      imageAspectRatio: null,
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
      })
    },
    deleteImage() {
      this.clearImages()
    },
    cropImage() {
      this.showCropper = false
      if (this.file.type === 'image/jpeg') {
        this.uploadJpeg()
      } else {
        this.uploadOtherImageType()
      }
    },
    uploadOtherImageType() {
      this.imageAspectRatio = this.file.width / this.file.height || 1.0
      this.image = new Image()
      this.image.src = this.file.dataURL
      this.setupPreview()
      this.emitImageData(this.file)
    },
    uploadJpeg() {
      const canvas = this.cropper.getCroppedCanvas()
      canvas.toBlob(blob => {
        this.imageAspectRatio = canvas.width / canvas.height
        this.image = new Image()
        this.image.src = canvas.toDataURL()
        this.setupPreview()
        const croppedImageFile = new File([blob], this.file.name, { type: this.file.type })
        this.emitImageData(croppedImageFile)
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
    setupPreview() {
      this.image.classList.add('thumbnail-preview')
      this.thumbnailElement.appendChild(this.image)
    },
    cancelCrop() {
      if (this.oldImage) this.thumbnailElement.appendChild(this.oldImage)
      this.showCropper = false
      this.$emit('cropInProgress', false)
    },
    emitImageData(imageFile) {
      this.$emit('addTeaserImage', imageFile)
      this.$emit('addImageAspectRatio', this.imageAspectRatio)
      this.$emit('cropInProgress', false)
    },
  },
}
</script>
<style lang="scss">
.image-uploader {
  position: relative;
  min-height: $size-image-uploader-min-height;
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
    filter: blur($blur-radius);
  }

  .preview-image {
    width: 100%;
    max-height: $size-image-max-height;
    object-fit: contain;
  }

  > .crop-overlay {
    width: 100%;
    height: 100%;
    min-height: $size-image-cropper-min-height;
    max-height: $size-image-cropper-max-height;
    font-size: $font-size-base;

    > .img {
      display: block;
      max-width: 100%;
    }

    > .crop-confirm {
      position: absolute;
      left: $space-x-small;
      top: $space-x-small;
      z-index: $z-index-surface;
    }

    > .crop-cancel {
      position: absolute;
      right: $space-x-small;
      top: $space-x-small;
      z-index: $z-index-surface;
    }
  }

  .dz-message {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: $z-index-surface;

    &:hover {
      > .base-icon {
        opacity: $opacity-base;
      }
    }

    > .base-icon {
      position: absolute;
      padding: $space-small;
      border-radius: 100%;
      border: $border-size-base dashed $color-neutral-20;
      background-color: $color-neutral-95;
      font-size: $size-icon-large;
      opacity: $opacity-soft;
    }
  }
}
</style>
