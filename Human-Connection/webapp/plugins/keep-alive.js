import Vue from 'vue'

let lastRoute
const keepAliveHook = {}

if (!process.server) {
  keepAliveHook.install = Vue => {
    const keepAlivePages = process.env.keepAlivePages || []

    Vue.mixin({
      // Save route if this instance is a page (has metaInfo)
      mounted() {
        if (this.$metaInfo) {
          lastRoute = this.$route.name
        }
      },
      activated() {
        if (this.$metaInfo) {
          lastRoute = this.$route.name
        }
      },
      deactivated() {
        // If this is a page and we don't want it to be kept alive
        if (this.$metaInfo && !keepAlivePages.includes(lastRoute)) {
          this.$destroy()
        }
      }
    })
  }
  Vue.use(keepAliveHook)
}
