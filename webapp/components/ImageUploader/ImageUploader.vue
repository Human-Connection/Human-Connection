<template>
  <div class="image-uploader">
    <vue-dropzone
      v-show="!showCropper"
      id="postdropzone"
      :options="dropzoneOptions"
      :use-custom-slot="true"
      @vdropzone-error="onDropzoneError"
      @vdropzone-file-added="initCropper"
    >
      <loading-spinner v-if="isLoadingImage" />
      <base-icon v-else name="image" />
      <base-button
        v-if="hasImage"
        icon="trash"
        circle
        danger
        filled
        data-test="delete-button"
        :title="$t('actions.delete')"
        @click.stop="deleteImage"
      />
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
    hasImage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dropzoneOptions: {
        url: () => '',
        maxFilesize: 5.0,
        previewTemplate: '<span class="no-preview" />',
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
    initCropper(file) {
      this.showCropper = true
      this.file = file

      const imageElement = document.querySelector('#cropping-image')
      imageElement.src = URL.createObjectURL(file)
      this.cropper = new Cropper(imageElement, { zoomable: false, autoCropArea: 0.9 })
    },
    cropImage() {
      this.isLoadingImage = true

      const onCropComplete = (aspectRatio, imageFile) => {
        this.$emit('addImageAspectRatio', aspectRatio)
        this.$emit('addHeroImage', imageFile)
        this.$nextTick((this.isLoadingImage = false))
        this.closeCropper()
      }

      if (this.file.type === 'image/jpeg') {
        const canvas = this.cropper.getCroppedCanvas()
        canvas.toBlob((blob) => {
          const imageAspectRatio = canvas.width / canvas.height
          const croppedImageFile = new File([blob], this.file.name, { type: this.file.type })
          onCropComplete(imageAspectRatio, croppedImageFile)
        }, 'image/jpeg')
      } else {
        // TODO: use cropped file instead of original file
        const imageAspectRatio = this.file.width / this.file.height || 1.0
        onCropComplete(imageAspectRatio, this.file)
      }
    },
    closeCropper() {
      this.showCropper = false
      this.cropper.destroy()
    },
    deleteImage() {
      this.$emit('addHeroImage', null)
      this.$emit('addImageAspectRatio', null)
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

    > .base-button {
      position: absolute;
      top: $space-small;
      right: $space-small;
      z-index: $z-index-surface;
    }
  }
}
</style>
