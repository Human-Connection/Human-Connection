<template>
  <vue-dropzone
    :options="dropzoneOptions"
    ref="el"
    id="postdropzone"
    :use-custom-slot="true"
    @vdropzone-thumbnail="thumbnail"
    @vdropzone-error="verror"
  >
    <div class="dz-message">
      <div
        :class="{
          'hc-attachments-upload-area-post': createAndUpdate,
          'hc-attachments-upload-area-update-post': contribution,
        }"
      >
        <slot></slot>
        <div
          :class="{
            'hc-drag-marker-post': createAndUpdate,
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
      createAndUpdate: true,
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
      let thumbnailElement, contributionImage, uploadArea
      if (file.previewElement) {
        thumbnailElement = document.querySelectorAll('#postdropzone')[0]
        contributionImage = document.querySelectorAll('.contribution-image')[0]
        if (contributionImage) {
          uploadArea = document.querySelectorAll('.hc-attachments-upload-area-update-post')[0]
          uploadArea.removeChild(contributionImage)
          uploadArea.classList.remove('hc-attachments-upload-area-update-post')
        }
        thumbnailElement.classList.add('image-preview')
        thumbnailElement.alt = file.name
        thumbnailElement.style.backgroundImage = 'url("' + dataUrl + '")'
      }
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

#postdropzone.image-preview {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  height: auto;
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
    height: 300px;
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
