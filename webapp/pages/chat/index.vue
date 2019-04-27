<template>
  <div>
  <no-ssr>
    <vue-friendly-iframe src="http://localhost:5000?layout=embedded" @load="onLoad" @document-load="onDocumentLoad"></vue-friendly-iframe>
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
      const iframe = document.getElementsByTagName('iframe')[0]
      console.log(iframe)
      iframe.contentWindow.postMessage({
        event: 'login-with-token',
        loginToken: this.token
      }, 'http://localhost:5000'); // rocket.chat's URL
    },
    onDocumentLoad() {
      console.log('onDocumentLoad')
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
