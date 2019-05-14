<template>
  <div>
    <vue-dropzone
      ref="el"
      id="dropzone"
      :include-styling="false"
      :options="dropzoneOptions"
    >
    <!-- <ds-icon name="image" size="xxx-large"/> -->
    </vue-dropzone>
  </div>
</template>
<script>

import vueDropzone from 'nuxt-dropzone'
import 'nuxt-dropzone/dropzone.css'

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
        url: 'https://httpbin.org/post',
        thumbnailWidth: 150,
        maxFilesize: 0.5,
        dictDefaultMessage: "<img src='https://s3.amazonaws.com/uifaces/faces/twitter/envex/128.jpg' />"
      }
    }
  },
  mounted() {
    // Everything is mounted and you can access the dropzone instance
    const instance = this.$refs.el.dropzone
  }
}
</script>
<style>
img {
  border-radius: 50%;
}
</style>
