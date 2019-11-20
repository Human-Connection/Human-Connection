import Vue from 'vue'
import InfiniteLoading from 'vue-infinite-loading'

Vue.use(InfiniteLoading, { props: { distance: 10 }, system: { throttleLimit: 800 } })
