<template>
  <div>
  <no-ssr>
    <vue-friendly-iframe src="http://localhost:5000/" @load="onLoad" @document-load="onDocumentLoad"></vue-friendly-iframe>
  </no-ssr>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import VueFriendlyIframe from 'vue-friendly-iframe';


export default {
  components: {
    VueFriendlyIframe
  },
  computed: {
    ...mapGetters({
      token: 'auth/token'
    })
  },
  methods: {
    onLoad() {
      console.log('onLoad')
    },
    onDocumentLoad() {
      console.log('onDocumentLoad')
      // console.log('token', this.token)
      const iframe = document.querySelector('iframe')
      console.log(iframe)
      iframe.contentWindow.postMessage({
        externalCommand: 'login-with-token',
        token: this.token
      }, '*'); // rocket.chat's URL
    },
  }
}
</script>

<style>
iframe {
  width: 100%;
  height: 80vh;
}
</style>
