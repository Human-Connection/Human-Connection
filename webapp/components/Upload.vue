<template>
  <div>
    <vue-dropzone
      id="dropzone"
      ref="el"
      :options="dropzoneOptions"
      :include-styling="false"
      :style="{ backgroundImage: `url(${user.avatar})`}"
      class="vue-dropzone-div"
    >
      <!-- <slot></slot> -->
    </vue-dropzone>
  </div>
</template>
<script>
import vueDropzone from 'nuxt-dropzone'
// import 'nuxt-dropzone/dropzone.css'

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
        maxFilesize: 0.5
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
.vue-dropzone-div {
  /* position: relative; */
  margin-left: 35px;
  width: 122px;
  min-height: 122px;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 50%;
}
</style>
